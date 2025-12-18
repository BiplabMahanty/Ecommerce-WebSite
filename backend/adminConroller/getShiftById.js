const RockstarShiftModel = require("../models/rockStarShift");

const getShiftById=async(req, res)=> {
  const {shiftId} = req.params;
    try {
    const shift = await RockstarShiftModel.findById(shiftId)
        
    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }
   
    res.status(200).json({ success: true, shift ,count:shift.length});
  } catch (error) {
    console.error("Error fetching shift by ID:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
module.exports={getShiftById}