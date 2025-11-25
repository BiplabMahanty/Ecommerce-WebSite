const AttendanceModel = require("../models/attendance");
const getTimer = async (req, res) => {
    const { employeeId } = req.body;

    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
    });

    const record = await AttendanceModel.findOne({ employeeId, dateKey: today });

    if (!record)
        return res.json({ success: true, elapsed: 0 });

    if (!record.checkIn || record.checkOut)
        return res.json({ success: true, elapsed: record.elapsedSeconds });

    // still running
    const now = Date.now();
    const elapsed = Math.floor((now - record.timerStart) / 1000);

    return res.json({
        success: true,
        elapsed,
        isRunning: true,
    });
};
 module.exports = { getTimer };