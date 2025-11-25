const LeaveRequestModel = require("../models/leaveRequest");
const EmployeeModel = require("../models/employee");

const leaveRequest = async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;

    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Find latest leave record for employee
    const lastLeave = await LeaveRequestModel
      .findOne({ employeeId })
      .sort({ createdAt: -1 });   // returns SINGLE document

    console.log("Last leave record:", lastLeave);

    // Validate employee
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    // Calculate requested leave days
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = Math.abs(end - start);
    const wantLeave = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    // If no past leave record → employee starts with 12 leave
    const availableLeave = lastLeave ? lastLeave.totalLeave : 12;

    console.log("Available Leave:", availableLeave);
    console.log("Requested:", wantLeave);

    // Validate leave balance
    if (availableLeave < wantLeave) {
      return res.status(400).json({
        success: false,
        message: `Leave request denied. You have only ${availableLeave} leave days.`,
      });
    }

    // Create new leave request
    const newLeave = new LeaveRequestModel({
      employeeId,
      type,
      startDate,
      endDate,
      reason,
      wantLeave,
      totalLeave: availableLeave, // Save latest leave balance
    });

    await newLeave.save();

    res.status(201).json({
      message: "Leave request submitted successfully",
      success: true,
      leave: newLeave,
      availableLeave,
      requestedDays: wantLeave,
    });

  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { leaveRequest };
