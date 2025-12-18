const SuperAdminDetailsModel = require("../models/superAdmindetails");

const addDepartment = async (req, res) => {
  try {
    const { departmentName } = req.body;

    if (!departmentName) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    // 1️⃣ Find single super admin document
    let superAdmin = await SuperAdminDetailsModel.findOne();

    // 2️⃣ If not exists → create one
    if (!superAdmin) {
      superAdmin = new SuperAdminDetailsModel({
        departments: [departmentName],
      });
      await superAdmin.save();

      return res.status(201).json({
        success: true,
        message: "Department added successfully",
        department: superAdmin.departments,
      });
    }

    // 3️⃣ Prevent duplicate departments
    if (superAdmin.departments.includes(departmentName)) {
      return res.status(400).json({
        success: false,
        message: "Department already exists",
      });
    }

    // 4️⃣ Push new department
    superAdmin.departments.push(departmentName);
    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "Department added successfully",
      department: superAdmin.departments,
    });

  } catch (error) {
    console.error("❌ Error adding department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add department",
      error: error.message,
    });
  }
};

module.exports = { addDepartment };
