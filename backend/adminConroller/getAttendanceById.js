const AttendanceModel=require("../models/attendance")
const getAttaendanceById = async (req, res) => {
  try {
    const {attendanceId}=req.params;
    const attendance = await AttendanceModel.findById(attendanceId)
    
    if (!attendanceId) {
      return res.status(200).json({
        success: true,
        message: "No attendance found",
        attendance: [],
        count: 0,
      });
    }


    res.status(200).json({
      success: true,
      message: "attendance fetched successfully",
      attendance,
     
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

module.exports={getAttaendanceById}