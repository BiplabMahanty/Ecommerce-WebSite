
const AttendanceModel = require("../models/attendance");
const EmployeeModel = require("../models/employee");
const RockstarShiftModel = require("../models/rockStarShift");
const PaymentModel = require("../models/Payment");

// Helper functions (same as before)
function getIndianDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
}

function getIndianDateKey() {
  const ist = getIndianDate();
  return ist.toISOString().slice(0, 10);
}

function getPreviousDayDateKey() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  istTime.setDate(istTime.getDate() - 1);
  return istTime.toISOString().slice(0, 10);
}

function getIndianMonthKey() {
  const ist = getIndianDate();
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function toIST(date) {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
}

function isWithinShiftTime(currentUTC, startIST, endIST, graceMinutes = 15) {
  const currentIST = toIST(currentUTC);
  const graceMs = graceMinutes * 60 * 1000;
  const startWithGrace = new Date(startIST.getTime() - graceMs);
  const endWithGrace = new Date(endIST.getTime() + graceMs);
  return currentIST >= startWithGrace && currentIST <= endWithGrace;
}

function buildIstDateFromDateKeyAndTime(dateKey, timeStr) {
  const [hh, mm] = (timeStr || "00:00").split(":").map(s => String(s).padStart(2, "0"));
  const isoWithOffset = `${dateKey}T${hh}:${mm}:00+05:30`;
  return new Date(isoWithOffset);
}

async function getOrCreatePayment(employeeId, month, employee) {
  let payment = await PaymentModel.findOne({ employee: employeeId, salaryMonth: month });
  if (!payment) {
    payment = new PaymentModel({
      employee: employeeId,
      salaryMonth: month,
      basicSalary: Number(employee.salary || 0),
      amountPaid: 0,
      previousDue: 0,
      remainingDue: 0,
      overtimeMinites: 0,
      overLateTime: 0,
      leaveDays: 0,
      leaveDeductions: 0,
      absentDeductions: 0,
      totalWorkingDays: 30,
      overtimePay: 0,
      lateTimeDeductions: 0,
      presentDays: 0,
      absentDays: 0,
    });
    await payment.save();
  }
  return payment;
}

// 🔥 NEW: Calculate Euclidean distance between two face descriptors
function calculateDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

// 🔥 NEW: Register face for employee
const registerFace = async (req, res) => {
  try {
    const { employeeId, faceDescriptor } = req.body;

    if (!employeeId || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        message: "employeeId and faceDescriptor (array) required",
        success: false,
      });
    }

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found", success: false });
    }

    employee.faceDescriptor = faceDescriptor;
    employee.faceRegistered = true;
    await employee.save();

    res.status(200).json({
      message: "✅ Face registered successfully",
      success: true,
    });
  } catch (err) {
    console.error("❌ Face Registration Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

// 🔥 UPDATED: Check-In with Face Verification
const checkIn = async (req, res) => {
  try {
    const { employeeId, faceDescriptor } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId required", success: false });
    }

    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();
    const month = getIndianMonthKey();
    const previousDayKey = getPreviousDayDateKey();

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found", success: false });
    }

    // 🔥 Face verification
    if (!employee.faceRegistered || !employee.faceDescriptor || employee.faceDescriptor.length === 0) {
      return res.status(403).json({
        message: "⚠️ Face not registered. Please register your face first.",
        success: false,
        requiresFaceRegistration: true,
      });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        message: "Face descriptor required for check-in",
        success: false,
      });
    }

    const distance = calculateDistance(employee.faceDescriptor, faceDescriptor);
    const THRESHOLD = 0.6; // Adjust based on accuracy needs

    if (distance > THRESHOLD) {
      return res.status(403).json({
        message: "❌ Face verification failed. Face does not match.",
        success: false,
        distance: distance.toFixed(4),
      });
    }

    // Find today's shift
    const shift = await RockstarShiftModel.findOne({
      employees: employeeId,
      dateKey,
      status: { $in: ["active", "upcoming"] },
    });

    if (!shift) {
      return res.status(404).json({
        message: `No active shift assigned for today (${dateKey})`,
        success: false,
      });
    }

    const payment = await getOrCreatePayment(employeeId, month, employee);

    const parsedShiftStart = buildIstDateFromDateKeyAndTime(dateKey, shift.startTime);
    const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);

    if (!isWithinShiftTime(nowIST, parsedShiftStart, parsedShiftEnd)) {
      return res.status(400).json({
        message: `⏰ Check-in not allowed. Your ${shift.shiftName} is ${shift.startTime}–${shift.endTime} (+15 min grace).`,
        success: false,
      });
    }

    const existing = await AttendanceModel.findOne({ employee: employeeId, dateKey });

    let attendance;

    if (existing) {
      attendance = existing;
      attendance.newCheckIn = nowIST;

      let isEarly = false;
      let isLate = false;
      let earlyMinutes = 0;
      let lateMinutes = 0;

      if (nowIST < parsedShiftStart) {
        isEarly = true;
        earlyMinutes = Math.floor((parsedShiftStart - nowIST) / 60000);
      } else if (nowIST > parsedShiftStart) {
        isLate = true;
        lateMinutes = Math.floor((nowIST - parsedShiftStart) / 60000);
      }

      if (isEarly) {
        attendance.early = true;
        attendance.earlyBy = earlyMinutes;
      }
      if (isLate) {
        attendance.late = true;
        attendance.lateBy = Number(attendance.lateBy || 0) + lateMinutes;
      }

      await attendance.save();

      return res.status(200).json({
        message: "✅ Additional check-in recorded (newCheckIn updated)",
        success: true,
        attendance,
        faceVerified: true,
        distance: distance.toFixed(4),
      });
    }

    const previousDayAttendance = await AttendanceModel.findOne({
      employee: employeeId,
      dateKey: previousDayKey,
    });

    const previousDayShift = await RockstarShiftModel.findOne({
      employees: employeeId,
      dateKey: previousDayKey,
    });

    payment.presentDays = payment.presentDays + 1;

    if (previousDayShift && !previousDayAttendance) {
      payment.absentDays = payment.absentDays + 1;
    }

    await payment.save();

    let isEarly = false;
    let isLate = false;
    let earlyMinutes = 0;
    let lateMinutes = 0;

    if (nowIST < parsedShiftStart) {
      isEarly = true;
      earlyMinutes = Math.floor((parsedShiftStart - nowIST) / 60000);
    } else if (nowIST > parsedShiftStart) {
      isLate = true;
      lateMinutes = Math.floor((nowIST - parsedShiftStart) / 60000);
    }

    const newAttendance = new AttendanceModel({
      employee: employeeId,
      date: nowIST,
      dateKey,
      checkIn: nowIST,
      status: "present",
      shift: shift._id,
      overTime: 0,
      early: isEarly,
      earlyBy: earlyMinutes,
      late: isLate,
      lateBy: lateMinutes,
    });

    await newAttendance.save();
    attendance = newAttendance;

    const basicSalary = Number(employee.salary) || 0;
    const totalDays = Number(payment.totalWorkingDays) || 30;
    const dailySalary = basicSalary / totalDays;

    payment.basicSalary = basicSalary;
    payment.absentDeductions = dailySalary * payment.absentDays;
    payment.leaveDeductions = dailySalary * payment.leaveDays;

    await payment.save();

    if (shift.status === "upcoming") {
      shift.status = "active";
      await shift.save();
    }

    res.status(200).json({
      message: "✅ Check-in successful with face verification",
      success: true,
      attendance: attendance,
      faceVerified: true,
      distance: distance.toFixed(4),
    });
  } catch (err) {
    console.error("❌ Check-in Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

// 🔥 UPDATED: Check-Out with Face Verification
const checkOut = async (req, res) => {
  try {
    const { employeeId, faceDescriptor } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId required", success: false });
    }

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found", success: false });
    }

    // 🔥 Face verification
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        message: "Face descriptor required for check-out",
        success: false,
      });
    }

    const distance = calculateDistance(employee.faceDescriptor, faceDescriptor);
    const THRESHOLD = 0.6;

    if (distance > THRESHOLD) {
      return res.status(403).json({
        message: "❌ Face verification failed. Face does not match.",
        success: false,
        distance: distance.toFixed(4),
      });
    }

    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();
    const month = getIndianMonthKey();

    const attendance = await AttendanceModel.findOne({ employee: employeeId, dateKey }).populate(
      "shift"
    );

    if (!attendance) {
      return res.status(404).json({
        message: "No check-in found for today. Please check in first.",
        success: false,
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "⚠️ You have already checked out today.",
        success: false,
      });
    }

    const shift = attendance.shift;
    if (!shift) {
      return res.status(500).json({
        message: "Shift info not found for checkout",
        success: false,
      });
    }

    const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);

    let overtimeMinutes = 0;
    let additionalLateMinutes = 0;

    if (nowIST > parsedShiftEnd) {
      overtimeMinutes = Math.floor((nowIST - parsedShiftEnd) / 60000);
    } else if (nowIST < parsedShiftEnd) {
      additionalLateMinutes = Math.floor((parsedShiftEnd - nowIST) / 60000);
    }

    attendance.checkOut = nowIST;
    attendance.overTime = overtimeMinutes;
    attendance.lateBy = Number(attendance.lateBy || 0) + additionalLateMinutes;

    await attendance.save();

    const payment = await getOrCreatePayment(employeeId, month, employee);

    payment.overtimeMinites = Number(payment.overtimeMinites || 0) + overtimeMinutes;
    payment.overLateTime = Number(payment.overLateTime || 0) + attendance.lateBy;

    const overtimeHours = payment.overtimeMinites / 60;
    const lateHours = payment.overLateTime / 60;

    payment.overtimePay = Math.round(overtimeHours * 100);
    payment.lateTimeDeductions = Math.round(lateHours * 100);

    await payment.save();

    res.status(200).json({
      message: "✅ Check-out successful with face verification",
      success: true,
      attendance,
      faceVerified: true,
      distance: distance.toFixed(4),
      payment: {
        overtimeMinutes: payment.overtimeMinites,
        lateMinutes: payment.overLateTime,
        overtimePay: payment.overtimePay,
        lateDeductions: payment.lateTimeDeductions,
      },
    });
  } catch (err) {
    console.error("❌ Check-out Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

module.exports = { checkIn, checkOut, registerFace };