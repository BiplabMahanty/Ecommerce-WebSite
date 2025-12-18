const LeaveRequestModel = require("../models/leaveRequest");
const EmployeeLeaveBalance = require("../models/employeeLeaveBalance");
// ✅ Get all leave requests
const getLeaveRequests = async (req, res) => {
  try {
    console.log("Fetching all leave requests...");

    const leaveRequests = await LeaveRequestModel.find({})
      .populate("employeeId", "name email department") 
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
        message: "Missing required fields",
      });
    }

    const leave = await LeaveRequestModel.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (status === "approved") {
      const balance = await EmployeeLeaveBalance.findOne({
        employeeId: leave.employeeId,
        leaveType: leave.leaveType,
      });

      if (!balance) {
        return res.status(400).json({
          success: false,
          message: "Leave balance not found for this leave type",
        });
      }

      if (balance.remainingLeave < leave.wantLeave) {
        return res.status(400).json({
          success: false,
          message: "Insufficient leave balance",
        });
      }

      balance.usedLeave += leave.wantLeave;
      balance.remainingLeave -= leave.wantLeave;
      await balance.save();
    }

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
    console.error("Verify leave error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { verifyLeaveRequest };




module.exports = { getLeaveRequests, verifyLeaveRequest };
