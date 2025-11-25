// routes/leaveRoutes.js
const express = require("express");
const LeaveRequest = require("../models/leaveRequest");
const Employee = require("../models/employee");

// GET leave requests by employee department
const getDepartmentLeave= async (req, res) => {
  try {
    const { department } = req.params;

    // Step 1: Find employees in this department
    const employees = await Employee.find({ department })
      .select("_id name email department");

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found in this department.",
      });
    }

    const employeeIds = employees.map((e) => e._id);

    // Step 2: Find leave requests of these employees
    const leaves = await LeaveRequest.find({ employeeId: { $in: employeeIds } })
      .populate("employeeId", "name email department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: leaves.length,
      department,
      leaves,
    });

  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {getDepartmentLeave}
