const LeaveRequestModel = require("../models/leaveRequest");

const getLeave = async (req, res) => {
  try {
    const leave = await LeaveRequestModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    if (!leave.length) {
      return res.status(200).json({
        success: true,
        message: "No leave found",
        leave: [],
        count: 0,
      });
    }

    console.log(`Found ${leave.length} leave requests`);

    res.status(200).json({
      success: true,
      message: "Leave fetched successfully",
      leave,
      count: leave.length,
    });
  } catch (error) {
    console.error("❌ Error fetching leave:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave",
      error: error.message,
    });
  }
};

module.exports = { getLeave };
