const LeaveRequest = require("../models/leaveRequest");
const LeaveType = require("../models/leaveType");
const EmployeeLeaveBalance = require("../models/employeeLeaveBalance");
const Attendance = require("../models/attendance");
const calculateLeaveDays = require("../utils/calculateLeaveDays");

const leaveRequestEmployee = async (req, res) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // 1️⃣ Fetch leave type
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    // 2️⃣ Check applicable date range
    const today = new Date();
    if (today < leaveType.applicableFrom || today > leaveType.applicableTo) {
      return res.status(400).json({ message: "Leave type expired" });
    }

    // 3️⃣ Calculate leave days (🔥 sandwich rule applied)
    const { count: leaveDays, dates: allLeaveDays } =
      calculateLeaveDays(
        new Date(startDate),
        new Date(endDate),
        leaveType.sandwichRule
      );

    // 4️⃣ Fetch leave balance
    const balance = await EmployeeLeaveBalance.findOne({
      employeeId,
      leaveType: leaveTypeId,
    });

    if (!balance || balance.remainingLeave < leaveDays) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }

    // 5️⃣ Check overlapping leave
    const existingLeave = await LeaveRequest.findOne({
      employeeId,
      allLeaveDays: { $in: allLeaveDays },
      status: { $ne: "rejected" },
    });

    if (existingLeave) {
      return res.status(400).json({
        message: "Leave already applied for selected dates",
      });
    }

    // 6️⃣ Create leave request
    const leave = await LeaveRequest.create({
      employeeId,
      leaveType: leaveTypeId,
      startDate,
      endDate,
      wantLeave: leaveDays,
      allLeaveDays,
      reason,
      status: "pending",
    });

    

    // 8️⃣ Mark attendance as LEAVE
    const attendanceDocs = allLeaveDays.map((date) => ({
      employee: employeeId,
      date,
      dateKey: date.toISOString().split("T")[0],
      status: "leave",
    }));

    await Attendance.insertMany(attendanceDocs, { ordered: false });

    res.json({
      success: true,
      message: "Leave requested successfully",
      leave,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { leaveRequestEmployee };
