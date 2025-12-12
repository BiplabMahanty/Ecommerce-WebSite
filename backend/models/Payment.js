const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    name :{type:String},

    // Salary month: YYYY-MM
    salaryMonth: {
      type: String,
      required: true,
    },

    // Base salary details
    basicSalary: { type: Number, required: true },
    totalAllowances: { type: Number, default: 0 },
    hraAllowances:{type:Number,default:0},
    daAllowances:{type:Number,default:0},
    taAllowances:{type:Number,default:0},
    maAllowances:{type:Number,default:0},
    spAllowances:{type:Number,default:0},

    pf:{type:Number},
    esic:{type:Number},
    professionalTex:{type:Number},


    // Attendance-based calculations
    totalWorkingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },

    // Financial deductions & additions
    leaveDeductions: { type: Number, default: 0 },
    absentDeductions: { type: Number, default: 0 },
    overtimeMinites: { type: Number, default: 0 },
    overLateTime: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    lateTimeDeductions: { type: Number, default: 0 },

    // Final calculation
    grossSalary: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque"],
      default: "Cash",
    },

    transactionId: { type: String },
    paidAt: { type: Date },

    salarySlipUrl: { type: String },

    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// -------------------------------
// Round helper
// -------------------------------
const roundNumber = (num) => Math.round(Number(num) || 0);

// -------------------------------
// PRE-SAVE MIDDLEWARE
// -------------------------------
paymentSchema.pre("save", function (next) {
  // Round all numeric values before saving
  this.basicSalary = roundNumber(this.basicSalary);
  this.totalAllowances = roundNumber(this.totalAllowances);

  this.totalWorkingDays = roundNumber(this.totalWorkingDays);
  this.presentDays = roundNumber(this.presentDays);
  this.absentDays = roundNumber(this.absentDays);
  this.leaveDays = roundNumber(this.leaveDays);

  this.leaveDeductions = roundNumber(this.leaveDeductions);
  this.absentDeductions = roundNumber(this.absentDeductions);
  this.overtimeMinites = roundNumber(this.overtimeMinites);
  this.overLateTime = roundNumber(this.overLateTime);
  this.overtimePay = roundNumber(this.overtimePay);
  this.lateTimeDeductions = roundNumber(this.lateTimeDeductions);

  // Calculate totals
  this.grossSalary =
    this.basicSalary + this.totalAllowances + this.overtimePay;

  this.totalDeductions =
    this.leaveDeductions + this.absentDeductions + this.lateTimeDeductions;

  this.netSalary = this.grossSalary - this.totalDeductions;

  next();
});

const PaymentModel = mongoose.model("PayrollPayment", paymentSchema);
module.exports = PaymentModel;
