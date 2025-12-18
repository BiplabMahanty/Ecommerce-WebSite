const RockstarShift = require("../models/rockStarShift");

const addShift = async (req, res) => {
  try {
    const { shiftName, startTime, endTime, date,dateKey,supervisor } = req.body;

    // ✅ Validation
    if (!shiftName || !startTime || !endTime || !date ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }
    const existingShift = await RockstarShift.findOne({dateKey:dateKey});
    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: "Shift already exists for the given date and supervisor",
      });
    }


    // ✅ Create shift
    const newShift = new RockstarShift({
      shiftName,
      startTime,
      endTime,
      date,
      dateKey,
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

const addEmpInRockstar = async (req, res) => {
  try {
    const {dateKey,employees,supervisor } = req.body;

    // ✅ Validation
    if (!dateKey) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }
    if (!employees ) {
      return res.status(400).json({
        success: false,
        message: "!!All required fields must be provided",
      });
    }
    const Shift= await RockstarShift.findOne({dateKey:dateKey});
    console.log(Shift); 

    Shift.employees=employees;
    Shift.supervisor=supervisor;
   
    await Shift.save();

    res.status(201).json({
      success: true,
      message: "Rockstar shift created successfully!",
      shift: Shift,
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



module.exports={addShift,addEmpInRockstar}
