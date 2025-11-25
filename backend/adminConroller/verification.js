const bcrypt = require("bcrypt");


const AdminModel = require("../models/admin");
const jwt = require('jsonwebtoken')




const crypto = require("crypto");

const signup = async (req, resp) => {
    try {
        const { name, email, password, address, number } = req.body;

        // check if admin exists
        const admin = await AdminModel.findOne({ email });
        if (admin) {
            return resp.status(409).json({
                message: "You are already registered",
                success: false,
            });
        }
        

        // create OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // ✅ store as Date

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create new admin with OTP
        const newadmin = new AdminModel({
            name,
            email,
            password: hashedPassword,
            address,
            number,
            status: "pending",
            otp,
            otpExpiry,
        });
        await newadmin.save();

        // send OTP mail
        /*let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                admin: "jimmie98@ethereal.email",
                pass: "jxjrmJnacF5HBx2eEK",
            },
            tls: {
                rejectUnauthorized: false, // ✅ allows self-signed certs
            }
        });


        await transporter.sendMail({
            from: `"Verify Account" <no-reply@example.com>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It is valid for 3 minutes.`,
            html: `<p>Y*/
       

        resp.status(201).json({
            message: "Signup successful, please verify OTP sent to email",
            success: true,
        });
    } catch (error) {
        console.error(error);
        resp.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


const login = async (req, resp) => {
    try {
        const { email, password } = req.body;
        const messagep = "Invalid email or password";

        // check if admin exists
        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return resp.status(400).json({
                message: messagep,
                success: false,
            });
        }

        // 🔴 Check if email is verified
        if (!admin.isVerified) {
            return resp.status(403).json({
                message: "Please verify your email before login",
                success: false,
            });
        }

        // check password
        const isPassEquel = await bcrypt.compare(password, admin.password);
        if (!isPassEquel) {
            return resp.status(403).json({
                message: messagep,
                success: false,
            });
        }

        // generate JWT token
        const jwtToken = jwt.sign(
            { email: admin.email, _id: admin._id , role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "24h" } // ✅ fixed spelling
        );

        resp.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email,
            name: admin.name,
        });
    } catch (error) {
        console.error(error);
        resp.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


const verifyOtp = async (req, resp) => {
    try {
        const { email, otp } = req.body;

        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return resp.status(400).json({ message: "admin not found", success: false });
        }

        if (admin.isVerified) {
            return resp.status(400).json({ message: "Already verified", success: false });
        }

        if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
            return resp.status(400).json({ message: "Invalid or expired OTP", success: false });
        }

        // mark verified
        admin.isVerified = true;
        admin.status = "success:verified";
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save();

        resp.json({ message: "Email verified successfully", success: true });
    } catch (error) {
        console.error(error);
        resp.status(500).json({ message: "Internal server error", success: false });
    }
};


module.exports = { signup, login, verifyOtp };
