const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Salary month: YYYY-MM (EX: 2025-01)
    salaryMonth: {
      type: String,
      required: true,
    },

    // Base salary details
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },

    // Attendance-based calculations
    totalWorkingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },

    // Financial deductions & additions
    leaveDeductions: { type: Number, default: 0 },
    absentDeductions: { type: Number, default: 0 },
    overtimeMinites: { type: Number, default: 0 },
    overLateTime:{type:Number,default:0},
    overtimePay: { type: Number, default: 0 },
    lateTimeDeductions:{type:Number,default:0},

    // Final calculation
    grossSalary: { type: Number, default: 0 }, // basic + allowances + overtime
    totalDeductions: { type: Number, default: 0 }, // leave + absent
    netSalary: { type: Number, default: 0 }, // gross - deductions

    // Payment Status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // Payment info
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque"],
      default: "Cash",
    },

    transactionId: { type: String }, // UPI/Bank reference
    paidAt: { type: Date },

    // Salary Slip URL (PDF download)
    salarySlipUrl: { type: String },

    // Audit logs / meta
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// --------------------------------------
// AUTO CALCULATE: grossSalary, deductions, netSalary
// --------------------------------------
paymentSchema.pre("save", function (next) {
  this.grossSalary =
    (this.basicSalary || 0) +
    (this.allowances || 0) +
    (this.overtimePay || 0);

  this.totalDeductions =
    (this.leaveDeductions || 0) + (this.absentDeductions || 0)+(this.lateTimeDeductions);

  this.netSalary = this.grossSalary - this.totalDeductions;

  next();
});

const PaymentModel = mongoose.model("PayrollPayment", paymentSchema);
module.exports=PaymentModel;