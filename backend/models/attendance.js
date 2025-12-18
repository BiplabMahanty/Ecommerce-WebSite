// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema(
//   {
//     employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
//     date: { type: Date, required: true },
//     dateKey: { type: String, required: true },
//     checkIn: { type: Date },
//     checkOut: { type: Date },
//     newCheckIn:{type:Date},
//     newCheckOut:{type:Date},
//     checkInLocation: {
//            latitude: Number,
//            longitude: Number,  
//       },
//     checkInAddress:{type:String},
//     checkOutLocation: {
//            latitude: Number,
//            longitude: Number,
//         },
//     checkOutAddress:{type:String},
 
//     late:{type:Boolean},
//     early:{type:Boolean},
//     leave:{type:Boolean},
//     status: { type: String, enum: ["present", "absent", "half-day","leave","notStart"], default: "present" },  
//     totalHours: { type: String, default: "0h 0m 0s" },
//     lateBy:{type:Number,default:0},
//     earlyBy:{type:Number,default:0},
//     overTime:{type:Number,default:0},
//     shift:{type: mongoose.Schema.Types.ObjectId, ref: "RockstarShift", required: true },
//      // 🧭 YYYY-MM-DD (IST)

//   },
//   { timestamps: true }
// );

// // Automatically calculate total hours on checkout
// attendanceSchema.pre("save", function (next) {
//   if (this.isModified("checkOut") || this.isModified("newCheckOut")) {
//     let totalSeconds = 0;

//     // 1) First shift duration
//     if (this.checkIn && this.checkOut) {
//       totalSeconds += Math.floor((this.checkOut - this.checkIn) / 1000);
//     }

//     // 2) Second shift / new check-in duration
//     if (this.newCheckIn && this.newCheckOut) {
//       totalSeconds += Math.floor((this.newCheckOut - this.newCheckIn) / 1000);
//     }

//     // Convert total seconds → h/m/s
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     this.totalHours = `${hours}h ${minutes}m ${seconds}s`;
//   }

//   next();
// });


// const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
// module.exports=AttendanceModel;

const mongoose = require("mongoose");

const punchSchema = new mongoose.Schema(
  {
    in: Date,
    out: Date,
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RockstarShift",
      required: true,
    },

    // 🧭 Attendance belongs to shift start date
    dateKey: {
      type: String, // YYYY-MM-DD (IST)
      required: true,
      index: true,
    },

    punches: [punchSchema], // unlimited punches ✅

    checkInLocation: {
      latitude: Number,
      longitude: Number,
    },
    checkInAddress: String,

    checkOutLocation: {
      latitude: Number,
      longitude: Number,
    },
    checkOutAddress: String,

    status: {
      type: String,
      enum: ["present", "absent", "half-day", "leave", "not-started"],
      default: "not-started",
    },
    buttonCheckIn: { type:Number, default: false },
    buttonCheckOut: { type: Boolean, default: false },

    // ⏱️ NUMERIC (IMPORTANT)
    workedSeconds: {
      type: Number,
      default: 0,
    },
    workedHours: {
      type: Number,
      default: 0,
    },
    workedMinutes: {
      type: Number,
      default: 0,
    },


    late: { type: Boolean, default: false },
    early: { type: Boolean, default: false },

    lateByMinutes: { type: Number, default: 0 },
    earlyByMinutes: { type: Number, default: 0 },

    overtimeMinutes: { type: Number, default: 0 },

  },
  { timestamps: true }
);
attendanceSchema.pre("save", function (next) {
  let totalSeconds = 0;

  for (const p of this.punches) {
    if (p.in && p.out) {
      totalSeconds += Math.floor((p.out - p.in) / 1000);
    }
  }

  this.workedSeconds = totalSeconds;

  this.workedHours = Math.floor(totalSeconds / 3600);
  this.workedMinutes = Math.floor((totalSeconds % 3600) / 60);

  // Auto status
  const hours = totalSeconds / 3600;
  if (hours >= 8) this.status = "present";
  else if (hours >= 4) this.status = "half-day";
  else if (hours > 0) this.status = "absent";

  next();
});

const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
module.exports = AttendanceModel;