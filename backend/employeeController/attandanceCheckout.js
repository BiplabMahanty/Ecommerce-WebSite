const AttendanceModel = require("../models/attendance");
const EmployeeModel = require("../models/employee");
const RockstarShiftModel = require("../models/rockStarShift");

// 🕒 Convert time to IST
// 🕒 Convert time to IST (correct method)
function getIndianDate() {
  const now = new Date();
  console.log("Current UTC Time:", now);
  const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
  console.log("IST Offset (ms):", istOffset);
  console.log("IST Time:", new Date(now.getTime() + istOffset));
  return new Date(now.getTime() + istOffset);
}

// 🧭 Get dateKey = YYYY-MM-DD (IST)
function getIndianDateKey() {
  const ist = getIndianDate();
  return ist.toISOString().slice(0, 10);
}

console.log("Date Key (IST):", new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));

// ✅ Check if current time is within shift (+/- 15min)
function isWithinShiftTime(current, start, end, graceMinutes = 15) {
  const graceMs = graceMinutes * 60 * 1000;
  const startWithGrace = new Date(start.getTime() - graceMs);
  const endWithGrace = new Date(end.getTime() + graceMs);
  console.log("Current Time:", current);
  console.log("Shift Start with Grace:", startWithGrace);
  console.log("Shift End with Grace:", endWithGrace);
  return current >= startWithGrace && current <= endWithGrace;
  

}

// ✅ Employee Check-In
const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found", success: false });

    console.log("Employee Details:", employee);
    console.log("Current IST Time:", nowIST);
    console.log("Date Key (IST):", dateKey);
    // 🔍 Find today's active shift
    const shift = await RockstarShiftModel.findOne({
      employees: employeeId,
      dateKey: dateKey,
      status: { $in: ["active", "upcoming"] },
    });
    console.log("Date Key (IST):", new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));

    console.log("🗓️ Date Key:", dateKey);
    console.log("🔍 Shift search for:", { employeeId, dateKey });
    console.log("🎯 Found shift:", shift ? shift.shiftName : "None");
    console.log("⏰ Current IST time:", shift);

    console.log("Current IST Time:", nowIST);
    console.log("Shift Details:", shift);
    console.log("Shift Start Time:", shift ? shift.startTime : "N/A");
    console.log("Shift End Time:", shift ? shift.endTime : "N/A");

    if (!shift) {
      return res.status(404).json({
        message: `No active shift assigned for today (${dateKey})`,
        success: false,
      });
    }

    // Parse shift start & end times
    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);
    const shiftStart = getIndianDate();
        console.log("Parsed Shift Start Time 1:", shiftStart);

    
        console.log("Parsed Shift Start Time: 2", shiftStart);

    const shiftEnd = getIndianDate();
   

    console.log("Parsed Shift Start Time:", shiftStart);
    console.log("Parsed Shift End Time:", shiftEnd);

    // Validate time window
    if (!isWithinShiftTime(nowIST, shiftStart, shiftEnd)) {
      return res.status(400).json({
        message: `⏰ Check-in not allowed. Your ${shift.shiftName} is ${shift.startTime}–${shift.endTime} (+15 min grace).`,
        success: false,
      });
    }    console.log("Proceeding to create new attendance record.",nowIST);



    // Check if already checked in today
    const existing = await AttendanceModel.findOne({ employee: employeeId, dateKey });
    
    if (existing) {
      return res.status(400).json({
        message: "⚠️ You have already checked in today.",
        success: false,
      });
    }

    const newAttendance = new AttendanceModel({
      employee: employeeId,
      date: nowIST,
      dateKey,
      checkIn: nowIST,
      status: "present",
      shift: shift._id,
    });

    await newAttendance.save();

    // ✅ Mark shift as active if it was upcoming
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
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// ✅ Employee Check-Out
const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const nowIST = getIndianDate();
    const dateKey = getIndianDateKey();

    const attendance = await AttendanceModel.findOne({ employee: employeeId, dateKey }).populate("shift");
    if (!attendance)
      return res.status(404).json({ message: "No check-in found for today", success: false });


    attendance.checkOut = nowIST;
    await attendance.save();

    // ✅ Mark shift as completed if checked out
    const shift = attendance.shift;
    if (shift) {
      shift.status = "active";
      await shift.save();
    }

    res.status(200).json({
      message: "✅ Check-out successful",
      success: true,
      attendance,
    });
  } catch (err) {
    console.error("❌ Check-out Error:", err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports = { checkIn, checkOut };
