const LeaveRequestModel=require("../models/leaveRequest")
const mongoose = require("mongoose");
const getLeaveTotal = async (req, res) => {
  try {
    
    const {employeeId}=req.params;

    if (!employeeId || employeeId === "null" || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId",
      });
    }

    const leave = await LeaveRequestModel.findOne({employeeId:employeeId})
      .populate("leaveType")
      .sort({ createdAt: -1 })
      .lean();

    if (!leave) {
      return res.status(200).json({
        success: true,
        message: "No leave found",
        leave: null,
        count: 0,
      });
    }
    const total=leave.wantLeave; // assuming wantLeave is the total days
    console.log(total);
    

    res.status(200).json({
      success: true,
      message: "leave fetched successfully",
       total: total,
      count: 1 // since it's one leave request
    });
  } catch (error) {
    console.error("❌ Error fetching admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin",
      error: error.message,
    });
  }
};

module.exports={getLeaveTotal}