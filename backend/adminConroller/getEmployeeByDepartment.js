const EmployeeModel = require("../models/employee");

const getEmployeeByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const employees = await EmployeeModel.find({ department });

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};
module.exports = { getEmployeeByDepartment };
