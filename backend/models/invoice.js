const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
   invoiceNo: { type: String,uniqe:true },
   invoiceDate: { type: Date, default: () => new Date() },
   salaryMonth: { type: String, required: true }, // "2025-11"
   employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
   employeeName: {type:String},
   designation: {type:String},
   department: {type:String},

  
    basicSalary: { type: Number, default: 0 },
    totalAllowances: { type: Number, default: 0 },
    hraAllowances:{type:Number,default:0},
    daAllowances:{type:Number,default:0},
    taAllowances:{type:Number,default:0},
    maAllowances:{type:Number,default:0},
    spAllowances:{type:Number,default:0},

    pf:{type:Number},
    esic:{type:Number},
    professionalTex:{type:Number},


    leaveDeductions: { type: Number, default: 0 },
    absentDeductions: { type: Number, default: 0 },
    overtimeMinites: { type: Number, default: 0 },
    overLateTime: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    lateTimeDeductions: { type: Number, default: 0 },

    grossSalary: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },

    paymentMethod: { type: String, default: "Bank Transfer" },
    paymentStatus: { type: String, enum: ["PAID","PENDING"], default: "PENDING" },
    transactionId: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
}, { timestamps: true });
invoiceSchema.pre("save", async function (next) {
  if (this.invoiceNo) return next(); // already exists

  // get count of invoices for the salaryMonth
  const count = await this.constructor.countDocuments({
    salaryMonth: this.salaryMonth
  });

  // Create invoice number like: INV-EMPID-YYYY-MM-0001
  this.invoiceNo = `INV-${this.employeeId.toString().slice(-6)}-${this.salaryMonth}-${String(count + 1).padStart(4, "0")}`;

  next();
});


const InvoiceModel = mongoose.model("Invoice", invoiceSchema);
module.exports=InvoiceModel;