const LeaveRequestModel = require("../models/leaveRequest");

// ACTIVE LEAVES: Approved + Today in between start & end date
const getActiveLeaves = async (req, res) => {
  try {
    const today = new Date();

    const active = await LeaveRequestModel.find({
      status: "approved",
      
    });

    res.status(200).json({
      success: true,
      count: active.length,
      leaves: active
    });

  } catch (error) {
    console.error("❌ Error fetching active leaves:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active leaves",
      error: error.message
    });
  }
};


// PENDING LEAVE REQUESTS
const getPendingRequests = async (req, res) => {
  try {
    const pending = await LeaveRequestModel.find({ status: "pending" });

    res.status(200).json({
      success: true,
      count: pending.length,
      leaves: pending
    });

  } catch (error) {
    console.error("❌ Error fetching pending requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message
    });
  }
};



// PAYROLL ALERTS: leave exceeding limits
const getPayrollAlerts = async (req, res) => {
  try {
    const alerts = await LeaveRequestModel.find({
      $or: [
        { wantLeave: { $gt: 12 } },            // Exceeds allowed leave
        { status: "approved", wantLeave: { $gt: 10 } } // Long duration alert
      ]
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });

  } catch (error) {
    console.error("❌ Error fetching payroll alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll alerts",
      error: error.message
    });
  }
};

module.exports = { getPayrollAlerts,getPendingRequests,getActiveLeaves };
