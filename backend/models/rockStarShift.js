const mongoose = require("mongoose");

const rockstarShiftSchema = new mongoose.Schema(
  {
    shiftName: {
      type: String,
      enum: ["Shift A", "Shift B", "Shift C"],
      required: true,
    },
    startTime: { type: String, required: true }, // "06:00"
    endTime: { type: String, required: true },   // "14:00"
    totalHours: { type: Number, default: 8 },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
    ],
    date: { type: Date, required: true },
    dateKey: { type: String, required: true }, // 🧭 YYYY-MM-DD (IST)
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed", "upcoming"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);




const RockstarShiftModel = mongoose.model("RockstarShift", rockstarShiftSchema);
module.exports=RockstarShiftModel;


