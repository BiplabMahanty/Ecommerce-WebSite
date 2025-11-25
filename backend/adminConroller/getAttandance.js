const AttendanceModel=require("../models/attendance")
const getAttaendance = async (req, res) => {
  try {
    console.log("Fetching all admin...");

    const attendance = await AttendanceModel.find({})
      .select("_id employee date checkIn checkOut status totalHours")
      .sort({ createdAt: -1 })
      .lean();

    if (!attendance || attendance.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No attendance found",
        attendance: [],
        count: 0,
      });
    }

    console.log(`Found ${attendance.length} users.`);

    res.status(200).json({
      success: true,
      message: "attendance fetched successfully",
      attendance,
      count: attendance.length,
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

module.exports={getAttaendance}