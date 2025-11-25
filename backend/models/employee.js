const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,unique:true },
    phone: { type: String },
    position: { type: String },
    salary: { type: Number, default: 0 },
    department: { type: String,default:"it department" },
    dateOfJoining: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    employeeImage:{type:String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const EmployeeModel = mongoose.model("Employee", employeeSchema);
module.exports=EmployeeModel;