const EmployeeModel=require("../models/employee")
const AttendanceModel=require("../models/attendance")
const getAttendanceEmployee = async (req, res) => {
  try {
   const {employeeId}=req.params;

    const employee = await EmployeeModel.findById(employeeId)
      .sort({ createdAt: -1 })
      .lean();

    if (!employee ) {
      return res.status(200).json({
        success: true,
        message: "No employee found",
        employee: [],
        count: 0,
      });
    }
    const attendance=await AttendanceModel.find({employee:employeeId})
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${attendance.length} users.`);

    res.status(200).json({
      success: true,
      message: "employee and attendance fetched successfully",
      employee,
      attendance,
      count: employee.length,
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

module.exports={getAttendanceEmployee}