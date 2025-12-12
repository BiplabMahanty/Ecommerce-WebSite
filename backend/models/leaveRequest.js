const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["casual", "medical", "emergency", "other"],
      required: true,
    },
    totalLeave: {
      type: Number,
      required: true,
      default:12
    },
    remaningLeave:{type:Number},
    usedLeave:{type:Number},
    wantLeave:{
        type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    allLeaveDays:[
      {type:Date}
    ],
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

leaveRequestSchema.pre("save",function(next){
  this.remaningLeave=this.totalLeave-this.usedLeave;

  next();
})

const LeaveRequestModel = mongoose.model("LeaveRequest", leaveRequestSchema);
module.exports=LeaveRequestModel;