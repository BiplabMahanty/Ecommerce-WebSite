const EmployeeModel=require("../models/employee")
const getEmployee = async (req, res) => {
  try {
    console.log("Fetching all admin...");

    const employee = await EmployeeModel.find({})
      .select("_id name email phone position salary department dataOfJoining status ")
      .sort({ createdAt: -1 })
      .lean();

    if (!employee || employee.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employee found",
        employee: [],
        count: 0,
      });
    }

    console.log(`Found ${employee.length} users.`);

    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      employee,
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

module.exports={getEmployee}