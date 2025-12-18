const { create } = require("../models/admin");
const LeaveType =require("../models/leaveType");
const getLeaveType = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().lean();

    if (!leaveTypes || leaveTypes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No leave types found",
        leaveTypes: [],
        count: 0,
      });
    }
    console.log(`✅ Found ${leaveTypes.length} leave types.`);
    res.status(200).json({
      success: true,
      message: "Leave types fetched successfully",  
      leaveTypes,
      count: leaveTypes.length,
    });
    } catch (error) {
        console.error("❌ Error fetching leave types:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leave types",
            error: error.message,
        });
    }
};
module.exports={getLeaveType}