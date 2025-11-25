const mongoose = require("mongoose");


const adminSchema = new mongoose.Schema(
  {
   name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String,  default: 'admin' },
  address: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  status: { type: String, default: "pending" },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },                // store OTP
  otpExpiry: { type: Date }
  },
  { timestamps: true }
);



const AdminModel = mongoose.model("Admin", adminSchema);
module.exports=AdminModel;


