const mongoose = require("mongoose");

const employeeLeaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },

    totalLeave: Number,
    usedLeave: { type: Number, default: 0 },
    remainingLeave: Number,
  },
  { timestamps: true }
);

employeeLeaveBalanceSchema.pre("save", function (next) {
  this.remainingLeave = this.totalLeave - this.usedLeave;
  next();
});

const EmployeeLeaveBalanceModel  = mongoose.model(
  "EmployeeLeaveBalance",
  employeeLeaveBalanceSchema
);
module.exports = EmployeeLeaveBalanceModel ;
