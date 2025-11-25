const LeaveRequestModel = require("../models/leaveRequest");

// ✅ Get all leave requests
const getLeaveRequests = async (req, res) => {
  try {
    console.log("Fetching all leave requests...");

    const leaveRequests = await LeaveRequestModel.find({})
      .populate("employeeId", "name email department") // optional: populate employee details
      .sort({ createdAt: -1 })
      .lean();

    if (!leaveRequests || leaveRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No leave requests found",
        leaveRequests: [],
        count: 0,
      });
    }

    console.log(`✅ Found ${leaveRequests.length} leave requests.`);
  res.status(200).json({
  success: true,
  message: "Leave requests fetched successfully",
  leave: leaveRequests,  // 👈 must match frontend
  count: leaveRequests.length,
});


  } catch (error) {
    console.error("❌ Error fetching leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

// ✅ Verify / Approve / Reject leave request



const verifyLeaveRequest = async (req, res) => {
  try {
    const { leaveId, adminId, status, comment } = req.body;

    if (!leaveId || !adminId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (leaveId, adminId, status)",
      });
    }

    const leave = await LeaveRequestModel.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // ✅ Only subtract from total if approved
    if (status === "approved") {
      leave.totalLeave = leave.totalLeave - leave.wantLeave;
      if (leave.totalLeave < 0) leave.totalLeave = 0; // prevent negative
    }

    // ✅ Update other fields
    leave.status = status;
    leave.approvedBy = adminId;
    leave.comment = comment || "";

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave,
    });
  } catch (error) {
    console.error("Error verifying leave:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying leave request",
      error: error.message,
    });
  }
};



module.exports = { getLeaveRequests, verifyLeaveRequest };
