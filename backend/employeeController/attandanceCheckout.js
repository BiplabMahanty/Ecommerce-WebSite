// employeeController/attandanceCheckout.js  (fixed)
const AttendanceModel = require("../models/attendance");
const EmployeeModel = require("../models/employee");
const RockstarShiftModel = require("../models/rockStarShift");
const PaymentModel = require("../models/Payment");
const LeaveRequestModel = require("../models/leaveRequest")
const axios = require("axios");


async function getReadableAddress(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    const res = await axios.get(url);
    return res.data.display_name; // FULL ADDRESS
  } catch (err) {
    console.error("Address fetch error:", err);
    return "Unknown Location";
  }
}


function calculateFaceDistance(descriptor1, descriptor2) {
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  return Math.sqrt(sum);
}

// 🔥 Verify face match (threshold typically 0.6 for face-api.js)
function verifyFaceMatch(storedDescriptor, currentDescriptor, threshold = 0.5) {
  const distance = calculateFaceDistance(storedDescriptor, currentDescriptor);
  return {
    isMatch: distance < threshold,
    distance: distance.toFixed(4),
    confidence: Math.max(0, (1 - distance) * 100).toFixed(2) + '%'
  };
}



// 🕒 Convert time to IST
function getIndianDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
  return new Date(now.getTime() + istOffset);
}

// 🧭 Get dateKey = YYYY-MM-DD (IST)
function getIndianDateKey() {
  const ist = getIndianDate();
  return ist.toISOString().slice(0, 10);
}
function getTomorrowDateKey() {
  const now = new Date();

  // convert to IST (UTC +5:30)
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

  // add 1 day
  istTime.setDate(istTime.getDate() - 1);

  // return YYYY-MM-DD
  return istTime.toISOString().slice(0, 10);
}


function getIndianMonthKey() {
  const ist = getIndianDate();
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, "0"); // 01–12
  return `${year}-${month}`;
}
function toIST(date) {
  // Convert UTC → IST (+5:30)
  return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
}


// ✅ Check if current time is within shift (+/- 15min)
function isWithinShiftTime(currentUTC, startIST, endIST, graceMinutes = 15) {
  // Convert current time from UTC → IST
  const currentIST = toIST(currentUTC);

  const graceMs = graceMinutes * 60 * 1000;

  // Apply grace
  const startWithGrace = new Date(startIST.getTime() - graceMs);
  const endWithGrace = new Date(endIST.getTime() + graceMs);

  // Full debug logs
  console.log("--------------- SHIFT VALIDATION ----------------");
  console.log("Shift Start (IST):", startIST);
  console.log("Shift End   (IST):", endIST);
  console.log("Allowed Start - Grace:", startWithGrace);
  console.log("Allowed End   + Grace:", endWithGrace);
  console.log("Current Time (IST):", currentIST);
  console.log("---------------------------------------------------");

  return currentIST >= startWithGrace && currentIST <= endWithGrace;
}



/**
 * Build a Date for the shift time in IST for the given dateKey.
 * Example: dateKey = "2025-11-27", timeStr = "06:00" -> new Date("2025-11-27T06:00:00+05:30")
 */

function buildIstDateFromDateKeyAndTime(dateKey, timeStr) {
  // Ensure timeStr is "HH:MM"
  const [hh, mm] = (timeStr || "00:00").split(":").map(s => String(s).padStart(2, "0"));
  // Construct with explicit +05:30 so JS parses correctly as IST moment
  const isoWithOffset = `${dateKey}T${hh}:${mm}:00+05:30`;
  return new Date(isoWithOffset);
}

// ------------------ CHECK-IN ------------------
// Fixed checkIn function with proper location handling
const checkIn = async (req, res) => {
  try {
    const { employeeId, faceDescriptor, location } = req.body;
    
    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({ 
        message: "employeeId required", 
        success: false 
      });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        message: "Valid face descriptor required",
        success: false
      });
    }

    // Validate location
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        message: "Location is required for check-in",
        success: false
      });
    }

    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();
    const month = getIndianMonthKey();
    const nextDay = getTomorrowDateKey();

    // Check for approved leave
    const leave = await LeaveRequestModel.findOne({ 
      employeeId: employeeId, 
      status: "approved" 
    }) || null;

    // Get employee and verify face registration
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        message: "Employee not found", 
        success: false 
      });
    }

    if (!employee.faceRegistered || !employee.faceDescriptor || employee.faceDescriptor.length === 0) {
      return res.status(403).json({
        message: "Face not registered. Please contact admin to register your face.",
        success: false
      });
    }

    // Verify face match
    const faceVerification = verifyFaceMatch(employee.faceDescriptor, faceDescriptor);
    if (!faceVerification.isMatch) {
      return res.status(403).json({
        message: `Face verification failed. Distance: ${faceVerification.distance}. Please try again or contact admin.`,
        success: false,
        distance: faceVerification.distance
      });
    }
    console.log(`✅ Face verified for employee ${employee.name} - Distance: ${faceVerification.distance}`);

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

    // Get or create payment record
    let payment = await PaymentModel.findOne({
      employee: employeeId,
      salaryMonth: month,
    });

    if (!payment) {
      payment = new PaymentModel({
        employee: employeeId,
        salaryMonth: month,
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
        basicSalary: employee.basicSalary,
        hraAllowances: employee.hraAllowances,
        daAllowances: employee.daAllowances,
        taAllowances: employee.taAllowances,
        maAllowances: employee.maAllowances,
        spAllowances: employee.spAllowances,
        pf: employee.pf,
        esic: employee.esic,
        professionalTex: employee.professionalTex,
        totalAllowances: employee.taAllowances,
      });
    }

    // Parse shift times
    const parsedShiftStart = buildIstDateFromDateKeyAndTime(dateKey, shift.startTime);
    const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);

    console.log("Shift Start:", parsedShiftStart);
    console.log("Shift End:", parsedShiftEnd);
    console.log("Current Time (IST):", nowIST);

    // Validate check-in time
    if (!isWithinShiftTime(nowIST, parsedShiftStart, parsedShiftEnd)) {
      return res.status(400).json({
        message: `⏰ Check-in not allowed. Your ${shift.shiftName} is ${shift.startTime}–${shift.endTime} (+15 min grace).`,
        success: false,
      });
    }

    // Check if already checked in today
    const existing = await AttendanceModel.findOne({ 
      employee: employeeId, 
      dateKey 
    });

    if (existing) {
      return res.status(400).json({
        message: "⚠️ You have already checked in today.",
        success: false,
      });
    }

    // Handle previous day attendance
    const existPrevious = await AttendanceModel.findOne({ 
      employee: employeeId, 
      dateKey: nextDay 
    });
    const existRockstar = await RockstarShiftModel.find({ 
      employees: employeeId, 
      dateKey: nextDay 
    });

    // Update payment record
    payment.presentDays = payment.presentDays + 1;

    if (existRockstar && existRockstar.length > 0) {
      if (!existPrevious) {
        let leaveDays = [];
        try {
          if (Array.isArray(leave?.allLeaveDays)) {
            leaveDays = leave.allLeaveDays;
          }
        } catch (e) {
          leaveDays = [];
        }

        const previousDay = new Date();
        previousDay.setDate(previousDay.getDate() - 1);

        const isOnLeave = Array.isArray(leaveDays)
          ? leaveDays.some(d =>
              new Date(d).toDateString() === previousDay.toDateString()
            )
          : false;

        payment.absentDays = isOnLeave
          ? payment.absentDays
          : payment.absentDays + 1;
      }
    } else {
      payment.leaveDays = payment.leaveDays + 1;
      payment.totalWorkingDays = payment.totalWorkingDays - 1;
    }

    await payment.save();

    // Get human-readable address
    let humanAddress = "Unknown Location";
    try {
      humanAddress = await getReadableAddress(location.latitude, location.longitude);
      console.log("✅ Resolved address:", humanAddress);
    } catch (error) {
      console.error("Failed to resolve address:", error);
      // Continue with "Unknown Location" rather than failing
    }

    // Create attendance record
    const newAttendance = new AttendanceModel({
      employee: employeeId,
      date: nowIST,
      dateKey,
      checkIn: nowIST,
      status: "present",
      shift: shift._id,
      overTime: 0,
      overtimePay: "100/h",
      earlyBy: 0,
      lateBy: 0,
      checkInLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      checkInAddress: humanAddress,
    });

    // Calculate early/late status
    if (nowIST < parsedShiftStart) {
      newAttendance.early = true;
      const diffMs = parsedShiftStart - nowIST;
      const earlyMinutes = Math.floor(diffMs / 60000);
      newAttendance.earlyBy = earlyMinutes;
    } else {
      newAttendance.early = false;
      newAttendance.earlyBy = 0;
    }

    if (nowIST > parsedShiftStart) {
      newAttendance.late = true;
      const diffMs = nowIST - parsedShiftStart;
      const lateMinutes = Math.floor(diffMs / 60000);
      newAttendance.lateBy = lateMinutes;
    } else {
      newAttendance.late = false;
      newAttendance.lateBy = 0;
    }
    
    console.log("shiftEnd  time ",shift.endTime)
    console.log("shift time ",parsedShiftEnd)
    console.log("shift time start",parsedShiftStart)

    await newAttendance.save();

    // Calculate salary deductions
    const basicSalary = payment.basicSalary;
    const totalDays = Number(payment.totalWorkingDays) || 1;
    const absent = Number(payment.absentDays) || 0;
    const dailySalary = basicSalary / totalDays;

    payment.absentDeductions = dailySalary * absent;
    await payment.save();

    // Update shift status
    if (shift.status === "upcoming") {
      shift.status = "active";
      await shift.save();
    }

    res.status(200).json({
      message: "✅ Check-in successful",
      success: true,
      attendance: newAttendance,
      matchConfidence: faceVerification.confidence
    });

  } catch (err) {
    console.error("❌ Check-in Error:", err);
    res.status(500).json({ 
      message: "Internal Server Error", 
      success: false, 
      error: err.message 
    });
  }
};

// ------------------ CHECK-OUT ------------------
// Fixed checkOut function with location support
const checkOut = async (req, res) => {
  try {
    const { employeeId, faceDescriptor, location } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ 
        message: "employeeId required", 
        success: false 
      });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        message: "Valid face descriptor required",
        success: false
      });
    }

    // Validate location
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        message: "Location is required for check-out",
        success: false
      });
    }

    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();
    const month = getIndianMonthKey();

    // Verify employee face
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ 
        message: "Employee not found", 
        success: false 
      });
    }

    if (!employee.faceRegistered || !employee.faceDescriptor || employee.faceDescriptor.length === 0) {
      return res.status(403).json({
        message: "Face not registered. Please contact admin.",
        success: false
      });
    }

    // Verify face match
    const faceVerification = verifyFaceMatch(employee.faceDescriptor, faceDescriptor);
    if (!faceVerification.isMatch) {
      return res.status(403).json({
        message: `Face verification failed. Distance: ${faceVerification.distance}. Please try again.`,
        success: false,
        distance: faceVerification.distance
      });
    }
    console.log(`✅ Face verified for checkout - ${employee.name} - Distance: ${faceVerification.distance}`);

    // Find today's attendance
    const attendance = await AttendanceModel.findOne({ 
      employee: employeeId, 
      dateKey 
    }).populate("shift");

    if (!attendance) {
      return res.status(404).json({ 
        message: "No check-in found for today", 
        success: false 
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "You have already checked out today",
        success: false
      });
    }

    // Get shift information
    const shift = attendance.shift || (await RockstarShiftModel.findOne({
      employees: employeeId,
      dateKey,
      status: { $in: ["active", "upcoming", "completed"] },
    }));

    if (!shift) {
      return res.status(500).json({ 
        message: "Shift info not found for checkout", 
        success: false 
      });
    }

    // Parse shift end time
    const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);

    // Initialize numeric fields
    attendance.lateBy = Number(attendance.lateBy || 0);
    attendance.overTime = Number(attendance.overTime || 0);

    // Calculate overtime/late time
    if (nowIST < parsedShiftEnd) {
      // Checking out early
      const diffMs = parsedShiftEnd - nowIST;
      const minutesUntilEnd = Math.floor(diffMs / 60000);
      attendance.lateBy = Number(attendance.lateBy || 0) + minutesUntilEnd;
    } else if (nowIST > parsedShiftEnd) {
      // Checking out after shift end
      const diffMs = nowIST - parsedShiftEnd;
      const overtimeMinutes = Math.floor(diffMs / 60000);
      const prevLate = Number(attendance.lateBy || 0);

      if (prevLate < overtimeMinutes) {
        attendance.overTime = overtimeMinutes - prevLate;
        attendance.lateBy = 0;
      } else {
        attendance.lateBy = prevLate - overtimeMinutes;
        attendance.overTime = 0;
      }
    }

    // Get human-readable address for checkout location
    let humanAddress = "Unknown Location";
    try {
      humanAddress = await getReadableAddress(location.latitude, location.longitude);
      console.log("✅ Resolved checkout address:", humanAddress);
    } catch (error) {
      console.error("Failed to resolve checkout address:", error);
    }

    // Update attendance with checkout info
    attendance.checkOut = nowIST;
    attendance.checkOutLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    
    // Store checkout address separately if you want, or append to existing address
    if (!attendance.checkOutAddress) {
      attendance.checkOutAddress = humanAddress;
    } else {
      attendance.address = `Check-in: ${attendance.address} | Check-out: ${humanAddress}`;
    }

    await attendance.save();

    // Update payment record
    let payment = await PaymentModel.findOne({
      employee: employeeId,
      salaryMonth: month,
    });

    if (!payment) {
      payment = new PaymentModel({
        employee: employeeId,
        salaryMonth: month,
        amountPaid: 0,
        previousDue: 0,
        remainingDue: 0,
        overtimeMinites: 0,
        overLateTime: 0,
      });
    }

    // Update overtime and late time
    payment.overtimeMinites = Number(payment.overtimeMinites || 0) + Number(attendance.overTime || 0);
    payment.overLateTime = Number(payment.overLateTime || 0) + Number(attendance.lateBy || 0);

    const overLate = Number(payment.overLateTime);
    const overtime = Number(payment.overtimeMinites);

    payment.lateTimeDeductions = (overLate / 60) * 100;
    payment.overtimePay = (overtime / 60) * 100;

    await payment.save();

    // Update shift status
    // if (attendance.shift) {
    //   attendance.shift.status = "completed";
    //   await attendance.shift.save().catch(() => {});
    // }

    res.status(200).json({
      message: "✅ Check-out successful",
      success: true,
      attendance,
      matchConfidence: faceVerification.confidence
    });

  } catch (err) {
    console.error("❌ Check-out Error:", err);
    res.status(500).json({ 
      message: "Internal Server Error", 
      success: false, 
      error: err.message 
    });
  }
};

module.exports = { checkIn, checkOut };
