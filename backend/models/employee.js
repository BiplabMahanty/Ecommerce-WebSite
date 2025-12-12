
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    phone: { type: String },
    position: { type: String },
    salary: { type: Number, default: 0 },
    department: { type: String, default: "it department" },
    dateOfJoining: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    employeeImage: { type: String },
    
    // 🔥 NEW: Face recognition data
    faceDescriptor: { type: [Number], default: [] }, // Store face encoding
    faceRegistered: { type: Boolean, default: false },

    basicSalary: { type: Number},
    totalAllowances: { type: Number, default: 0 },
    hraAllowances:{type:Number,default:0},
    daAllowances:{type:Number,default:0},
    taAllowances:{type:Number,default:0},
    maAllowances:{type:Number,default:0},
    spAllowances:{type:Number,default:0},

    pf:{type:Number},
    esic:{type:Number},
    professionalTex:{type:Number},
    grossSalary: { type: Number, default: 0 },


    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const EmployeeModel = mongoose.model("Employee", employeeSchema);
module.exports=EmployeeModel;