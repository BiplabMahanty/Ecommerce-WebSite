const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    dateKey: { type: String, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    newCheckIn:{type:Date},
    newCheckOut:{type:Date},
    checkInLocation: {
           latitude: Number,
           longitude: Number,  
      },
    checkInAddress:{type:String},
    checkOutLocation: {
           latitude: Number,
           longitude: Number,
        },
    checkOutAddress:{type:String},
 
    late:{type:Boolean},
    early:{type:Boolean},
    leave:{type:Boolean},
    status: { type: String, enum: ["present", "absent", "half-day","notStart"], default: "present" },  
    totalHours: { type: String, default: "0h 0m 0s" },
    lateBy:{type:Number,default:0},
    earlyBy:{type:Number,default:0},
    overTime:{type:Number,default:0},
    shift:{type: mongoose.Schema.Types.ObjectId, ref: "RockstarShift", required: true },
     // 🧭 YYYY-MM-DD (IST)

  },
  { timestamps: true }
);

// Automatically calculate total hours on checkout
attendanceSchema.pre("save", function (next) {
  if (this.isModified("checkOut") || this.isModified("newCheckOut")) {
    let totalSeconds = 0;

    // 1) First shift duration
    if (this.checkIn && this.checkOut) {
      totalSeconds += Math.floor((this.checkOut - this.checkIn) / 1000);
    }

    // 2) Second shift / new check-in duration
    if (this.newCheckIn && this.newCheckOut) {
      totalSeconds += Math.floor((this.newCheckOut - this.newCheckIn) / 1000);
    }

    // Convert total seconds → h/m/s
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.totalHours = `${hours}h ${minutes}m ${seconds}s`;
  }

  next();
});


const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
module.exports=AttendanceModel;