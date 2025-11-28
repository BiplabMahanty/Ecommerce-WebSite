
const AttendanceModel = require("../models/attendance");

// FETCH ATTENDANCE BY EMPLOYEE & MONTH
const getAttaendanceByMonthLate= async (req, res) => {
  try {
    const employeeId = req.params.id;
    const monthQuery = req.query.month; // format: YYYY-MM

    if (!monthQuery) {
      return res.status(400).json({ error: "Month (YYYY-MM) is required" });
    }

    // Build the start and end dates
    const startDate = new Date(`${monthQuery}-01T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // next month

    // Fetch attendance
    const attendance = await AttendanceModel.find({
      employee: employeeId,
      date: { $gte: startDate, $lt: endDate }
    })
      .populate("lateBy") // optional if you need shift info
      .sort({ date: 1 });
    const late = attendance.filter(
      (a) => a.lateBy
    );
    res.json({
      employeeId,
      month: monthQuery,
      totalRecords: attendance.length,
      records: attendance,
      over:late
    });

  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports={getAttaendanceByMonthLate}
