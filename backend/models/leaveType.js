const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String, // Medical, Casual
      required: true,
      unique: true,
      trim: true,
    },

    totalLeaves: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: true,
    },

    sandwichRule: {
      type: Boolean,
      default: false,
    },

    applicableFrom: {
      type: Date,
      required: true,
    },

    applicableTo: {
      type: Date,
      required: true,
    },

    assignMode: {
      type: String,
      enum: ["department", "employee"],
      required: true,
    },

    departments: [String],

    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    carryForward: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
