const EmployeeModel=require("../models/employee")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const login = async (req, resp) => {
    try {
        const { email, password } = req.body;
        const messagep = "Invalid email or password";

        // check if employee exists
        const employee = await EmployeeModel.findOne({ email });
        if (!employee) {
            return resp.status(400).json({
                message: messagep,
                success: false,
            });
        }

        // 🔴 Check if email is verified
        

        // check password
        const isPassEquel = await bcrypt.compare(password, employee.password);
        if (!isPassEquel) {
            return resp.status(403).json({
                message: messagep,
                success: false,
            });
        }

        // generate JWT token
        const jwtToken = jwt.sign(
            { email: employee.email, _id: employee._id , role: "employee" },
            process.env.JWT_SECRET,
            { expiresIn: "24h" } // ✅ fixed spelling
        );

        resp.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email,
            name: employee.name,
        });
    } catch (error) {
        console.error(error);
        resp.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};




module.exports = { login };
