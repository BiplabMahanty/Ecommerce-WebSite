const express = require("express");
const EmployeeModel = require("../models/employee");
const bcrypt = require("bcrypt");


const ChangePassword= async (req, res) => {
  try {
    const { employeeId, oldPassword, newPassword } = req.body;

    const employee = await EmployeeModel.findById( employeeId);
    if (!employee) return res.json({ success: false, message: "employee not found" });

    const isPassEquel = await bcrypt.compare(oldPassword, employee.password);
    if (!isPassEquel) {
               return res.json({ success: false, message: "Old password is incorrect" });
    }

    console.log("Old password verified");
      
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.json({ success: false, message: "Server error",error: error.message});
  }
};

module.exports={ChangePassword}