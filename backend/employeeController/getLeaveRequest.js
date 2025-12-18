const LeaveRequestModel=require("../models/leaveRequest")
const getLeaveRequest = async (req, res) => {
  try {
    
    const {employeeId}=req.body;

    const leave = await LeaveRequestModel.find({employeeId:employeeId})
    
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

    console.log(`Found ${leave.length} leave.`);

    res.status(200).json({
      success: true,
      message: "leave fetched successfully",
      leave,
      count: leave.length,
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

module.exports={getLeaveRequest}