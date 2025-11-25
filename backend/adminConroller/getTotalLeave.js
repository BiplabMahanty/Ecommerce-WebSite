const LeaveRequestModel=require("../models/leaveRequest")
const getLeaveTotal = async (req, res) => {
  try {
    
    const {employeeId}=req.params;

    const leave = await LeaveRequestModel.findOne({employeeId:employeeId})
      .populate("type startDate endDate reason status approvedBy totalLeave")
      .sort({ createdAt: -1 })
      .lean();

    if (!leave || leave.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No leave found",
        leave: [],
        count: 0,
      });
    }
    const total=leave.totalLeave;
    console.log(total);
    

    res.status(200).json({
      success: true,
      message: "leave fetched successfully",
       total: total,
      count: total.length
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