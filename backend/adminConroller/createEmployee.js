const AdminModel = require("../models/admin");
const EmployeeModel = require("../models/employee");
const bcrypt = require("bcrypt");
const path = require("path");
const { getFaceDescriptorFromImage } = require("../utils/faceHelper");
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      position,
      salary,
      department,
      dateOfJoining,
      status,
      createdBy,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
        success: false,
      });
    }

    // ✅ Validate createdBy is a valid ObjectId
    if (!createdBy || typeof createdBy !== 'string' || createdBy.length !== 24) {
      return res.status(400).json({
        message: "Valid admin ID required",
        success: false,
      });
    }

    // Check if admin exists
    const admin = await AdminModel.findById(createdBy);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    const existingEmployee = await EmployeeModel.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee with this email already exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let employeeImagePath = null;
    let faceDescriptor = [];
    let faceRegistered = false;

    if (req.file) {
      employeeImagePath = `/uploads/${req.file.filename}`;

      try {
        const absoluteImgPath = path.join(__dirname, "../uploads", req.file.filename);
        const descriptor = await getFaceDescriptorFromImage(absoluteImgPath);

        if (descriptor && descriptor.length > 0) {
          faceDescriptor = descriptor;
          faceRegistered = true;
          console.log("✅ Face registered successfully");
        } else {
          console.log("⚠️ No face detected in image");
        }
      } catch (faceErr) {
        console.error("Face detection error:", faceErr);
        // Continue without face registration
      }
    }

    const newEmployee = new EmployeeModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      position,
      salary: Number(salary) || 0,
      department,
      dateOfJoining,
      status,
      employeeImage: employeeImagePath,
      faceDescriptor: faceDescriptor,
      faceRegistered: faceRegistered,
      createdBy,
    });

    await newEmployee.save();

    const employeeResponse = newEmployee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      message: faceRegistered 
        ? "Employee added successfully with face registration" 
        : "Employee added successfully (Face not detected - register later)",
      success: true,
      employee: employeeResponse,
      faceRegistered,
    });

  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  addEmployee,
};