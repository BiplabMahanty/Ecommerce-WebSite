// employeeController/attandanceCheckout.js  (fixed)
const AttendanceModel = require("../models/attendance");
const EmployeeModel = require("../models/employee");
const RockstarShiftModel = require("../models/rockStarShift");
const PaymentModel = require("../models/Payment");
const LeaveRequestModel = require("../models/leaveRequest")

//checkIn multiple time

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
const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: "employeeId required", success: false });

    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();
    const month = getIndianMonthKey();

    const nextDay = getTomorrowDateKey();

    const leave = await LeaveRequestModel.findOne({ employeeId: employeeId, status: "approved" })|| 0;
    console.log("leave>>>>", leave)

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found", success: false });

    // Find today's active/upcoming shift for this employee
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

    // Parse shift start/end as IST moments on the shift.dateKey
    const parsedShiftStart = buildIstDateFromDateKeyAndTime(dateKey, shift.startTime);
    const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);
    
    console.log("parsedShiftStart", parsedShiftStart)
    console.log("parsedShiftEnd", parsedShiftEnd)
    console.log("nowIST", nowIST)


    // Validate check-in is within shift window (+/- 15 minutes)
    if (!isWithinShiftTime(nowIST, parsedShiftStart, parsedShiftEnd)) {
      return res.status(400).json({
        message: `⏰ Check-in not allowed. Your ${shift.shiftName} is ${shift.startTime}–${shift.endTime} (+15 min grace).`,
        success: false,
      });
    }

    console.log("nextDay",nextDay)
    console.log("employee",employeeId)

    const existPrevious = await AttendanceModel.findOne({ employee: employeeId, dateKey: nextDay })
    const existRockstar = await RockstarShiftModel.find({ employees: employeeId, dateKey: nextDay })
    console.log("existRockstar",existRockstar)
    const now = new Date();
    const previousDay = new Date(now);
    previousDay.setDate(now.getDate() - 1);

    console.log(">>",previousDay.toISOString());
    console.log("priviousDay",previousDay)
    console.log("leave.startDate",leave.startDate)
    console.log("leave.endDate",leave.endDate)


    // Check if already checked in today
    const existing = await AttendanceModel.findOne({ employee: employeeId, dateKey });
    if (!existing) {
      payment.presentDays = payment.presentDays + 1;
      console.log(">?>?>?", payment.presentDays)

      if (existRockstar) {

        if (!existPrevious) {
           if (leave.allLeaveDays.some(d =>
            new Date(d).toDateString() === new Date(previousDay).toDateString())){
            payment.absentDays = payment.absentDays;
          } else {
           payment.absentDays = payment.absentDays + 1;
          }
          
        }

      } else {
        payment.leaveDays = payment.leaveDays + 1;
        payment.totalWorkingDays = payment.totalWorkingDays - 1;
      }



      await payment.save();

    } else {
      return res.status(400).json({
        message: "⚠️ You have already checked in today.",
        success: false,
      });
    }

    // Create attendance
    const newAttendance = new AttendanceModel({
      employee: employeeId,
      date: nowIST,
      dateKey,
      checkIn: nowIST,
      status: "present",
      shift: shift._id,
      overTime: 0,
      overtimePay: "100/h",
      earlyBy: "0",
      lateBy: "0",
    });

    // Early: check if employee checked in BEFORE shift start
    if (nowIST < parsedShiftStart) {
      newAttendance.early = true;
      const diffMs = parsedShiftStart - nowIST;
      const earlyMinutes = Math.floor(diffMs / 60000);
      newAttendance.earlyBy = String(earlyMinutes);
    } else {
      newAttendance.early = false;
      newAttendance.earlyBy = "0";
    }

    // Late: check if employee checked in AFTER shift start
    if (nowIST > parsedShiftStart) {
      newAttendance.late = true;
      const diffMs = nowIST - parsedShiftStart;
      const lateMinutes = Math.floor(diffMs / 60000);
      newAttendance.lateBy = String(lateMinutes);
    } else {
      newAttendance.late = false;
      newAttendance.lateBy = "0";
    }

    await newAttendance.save();





    const basicSalary = payment.basicSalary;
    const totalDays = Number(payment.totalWorkingDays) || 1; // Prevent 0 division
    const present = Number(payment.presentDays) || 0;
    const absent = Number(payment.absentDays) || 0;
    const leaves = Number(payment.leaveDays) || 0;


    const dailySalary = basicSalary / totalDays;

    // Deductions
    payment.absentDeductions = dailySalary * absent;

    console.log("absentDeductions", payment.absentDeductions)
    console.log("leaveDeductions", payment.leaveDeductions)




    await payment.save();

    // If shift was upcoming, mark active
    if (shift.status === "upcoming") {
      shift.status = "active";
      await shift.save();
    }

    res.status(200).json({
      message: "✅ Check-in successful",
      success: true,
      attendance: newAttendance,
    });
  } catch (err) {
    console.error("❌ Check-in Error:", err);
    res.status(500).json({ message: "Internal Server Error", success: false, error: err.message });
  }
};

// ------------------ CHECK-OUT ------------------
const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: "employeeId required", success: false });

    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();
    const month = getIndianMonthKey();

    // Find today's attendance and populate shift reference
    const attendance = await AttendanceModel.findOne({ employee: employeeId, dateKey }).populate("shift");
    if (!attendance) return res.status(404).json({ message: "No check-in found for today", success: false });

    // Determine shift end time (from shift in attendance or by finding active shift)
    const shift = attendance.shift || (await RockstarShiftModel.findOne({
      employees: employeeId,
      dateKey,
      status: { $in: ["active", "upcoming", "completed"] },
    }));

    if (!shift) {
      return res.status(500).json({ message: "Shift info not found for checkout", success: false });
    }

    // Build parsed shift end as IST moment
    const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);

    // Ensure numeric lateBy / overTime fields exist and are numbers
    attendance.lateBy = Number(attendance.lateBy || 0);
    attendance.overTime = Number(attendance.overTime || 0);

    if (nowIST < parsedShiftEnd) {
      const diffMs = parsedShiftEnd - nowIST;
      const minutesUntilEnd = Math.floor(diffMs / 60000);
      attendance.lateBy = Number(attendance.lateBy || 0) + minutesUntilEnd;
    } else if (nowIST > parsedShiftEnd) {
      const diffMs = nowIST - parsedShiftEnd;
      const lateMinutes = Math.floor(diffMs / 60000);
      const prevLate = Number(attendance.lateBy || 0);

      if (prevLate < lateMinutes) {
        attendance.overTime = lateMinutes - prevLate;
        attendance.lateBy = 0;
      } else {
        attendance.lateBy = prevLate - lateMinutes;
        attendance.overTime = 0;
      }
    }

    attendance.checkOut = nowIST;
    await attendance.save();

    // Update monthly payment record with overtime etc.
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
        basicSalary: Number(employee.salary || 0),
      });
    }

    // Initialize numeric fields safely
    payment.overtimeMinites = Number(payment.overtimeMinites || 0) + Number(attendance.overTime || 0);
    console.log("overtimeMinites", payment.overtimeMinites)

    payment.overLateTime = Number(payment.overLateTime || 0) + Number(attendance.lateBy || 0);
    console.log("overLateTime", payment.overLateTime)

    const overLate = Number(payment.overLateTime);
    const overtime = Number(payment.overtimeMinites);


    payment.lateTimeDeductions = (overLate / 60) * 100;
    console.log("late", payment.lateTimeDeductions)
    payment.overtimePay = (overtime / 60) * 100;
    console.log("overtimePay", payment.overtimePay)


    console.log("totalDeductions", payment.totalDeductions)


    console.log("netSalary", payment.netSalary)






    await payment.save();
    console.log("totalDeductions", payment.totalDeductions)


    // Mark shift as completed/active if needed
    if (attendance.shift) {
      attendance.shift.status = "active";
      await attendance.shift.save().catch(() => { });
    }

    res.status(200).json({
      message: "✅ Check-out successful",
      success: true,
      attendance,
    });
  } catch (err) {
    console.error("❌ Check-out Error:", err);
    res.status(500).json({ message: "Internal Server Error", success: false, error: err.message });
  }
};

module.exports = { checkIn, checkOut };


