const RockstarShift = require("../models/rockStarShift");

const addRockstarShift = async (req, res) => {
  try {
    const { shiftName, startTime, endTime, date,dateKey, employees, supervisor } = req.body;

    // ✅ Validation
    if (!shiftName || !startTime || !endTime || !date || !employees?.length) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // ✅ Create shift
    const newShift = new RockstarShift({
      shiftName,
      startTime,
      endTime,
      date,
      dateKey,
      employees,
      supervisor,
    });

    await newShift.save();

    res.status(201).json({
      success: true,
      message: "Rockstar shift created successfully!",
      shift: newShift,
    });
  } catch (error) {
    console.error("❌ Error adding rockstar shift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports={addRockstarShift}
