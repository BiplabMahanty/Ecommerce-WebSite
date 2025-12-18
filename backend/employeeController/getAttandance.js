const AttendanceModel = require("../models/attendance");

const getAttendance = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Validate employeeId
    if (!employeeId) {  
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Fetch attendance records - populate shift details, not attendance fields
    const attendance = await AttendanceModel.find({ employee: employeeId })
      .populate("shift", "shiftName startTime endTime") // Only populate the shift reference
      .populate("employee", "name email") // Optionally populate employee details
      .sort({ date: -1 }) // Sort by date (newest first)
      .lean();

    if (!attendance || attendance.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No attendance records found",
        attendance: [],
        count: 0,
      });
    }
    // const formattedAttendance = attendance.map((record) => {
    //   const formattedPunches = record.punches.map((punch) => ({   
    //     in: punch.in ? new Date(punch.in).toLocaleTimeString("en-IN") : null,
    //     out: punch.out ? new Date(punch.out).toLocaleTimeString("en-IN") : null,
    //   }));
    const todayAttendance = await AttendanceModel.findOne({
      employee: employeeId,
      date: new Date().toISOString().split("T")[0],
    });

    if (todayAttendance) {
      console.log("Today's Attendance Record:", todayAttendance);
    } else {
      console.log("No attendance record found for today.");
    }
      
  

    console.log(`✅ Found ${attendance.length} attendance records for employee ${employeeId}`);

    res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      attendance,
      todayAttendance,
      count: attendance.length,
    });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

module.exports = { getAttendance };