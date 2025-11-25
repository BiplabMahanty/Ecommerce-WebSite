const LeaveRequestModel = require("../models/leaveRequest");


const editLeaveRequest = async (req, res) => {
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

    if (status==="rejected") {
        
        if (leave.status === "approved") {
             leave.totalLeave = leave.totalLeave + leave.wantLeave;
        if (leave.totalLeave <= 0){
               
             leave.totalLeave = 0;

      }
      await leave.save();
    
      }  // prevent negative
    }

     if (status==="pending") {
        
        if (leave.status === "approved") {
             leave.totalLeave = leave.totalLeave + leave.wantLeave;
        if (leave.totalLeave <= 0){
               
             leave.totalLeave = 0;

      }
      await leave.save();
    
      }  // prevent negative
    }

    
    if (status==="approved") {
        
        if (leave.status === "rejected") {
             leave.totalLeave = leave.totalLeave - leave.wantLeave;
        if (leave.totalLeave <= 0){
               
             leave.totalLeave = 0;

      }
      await leave.save();
    
      }  // prevent negative
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



module.exports = {  editLeaveRequest };
