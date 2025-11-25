const RockstarShiftModel=require("../models/rockStarShift");

// ✅ Get Shift Details for Employee
const getShift = async (req, res) => {
  try {
    
    const shift = await RockstarShiftModel.find({ })
        .populate("_id supervisor dateKey startTime endTime shiftName status")
       
    if (!shift) {
      console.log("No shift found for the given criteria.");
      return res.status(404).json({ 
        success: false, 
        message: "No shift found for the given employee on the specified date." 
      });
    }       
    console.log("Shift found:", shift);
    res.status(200).json({
      success: true,
      shift,
    });
  } catch (error) {
    console.error("❌ Error fetching shift:", error);
    res.status(500).json({  
        success: false, 
        message: "Internal server error",
        error: error.message
    });
  } 
};
module.exports={getShift}