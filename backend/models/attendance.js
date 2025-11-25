const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    dateKey: { type: String, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ["present", "absent", "half-day"], default: "present" },
    totalHours: { type: String, default: "0h 0m 0s" },
    shift:{type: mongoose.Schema.Types.ObjectId, ref: "RockstarShift", required: true },
     // 🧭 YYYY-MM-DD (IST)

  },
  { timestamps: true }
);

// Automatically calculate total hours on checkout
attendanceSchema.pre("save", function (next) {
  if (this.isModified("checkOut") && this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.totalHours = `${hours}h ${minutes}m ${seconds}s`;
  }
  next();
});



const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
module.exports=AttendanceModel;