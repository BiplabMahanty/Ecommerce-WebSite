const AttendanceModel = require("../models/attendance");
const EmployeeModel = require("../models/employee");
const RockstarShiftModel = require("../models/rockStarShift");
const LeaveRequestModel = require("../models/leaveRequest");
const axios = require("axios");

/* -------------------- UTILITIES -------------------- */

async function getReadableAddress(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await axios.get(url);
    return res.data.display_name || "Unknown Location";
  } catch {
    return "Unknown Location";
  }
}

function calculateFaceDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}

function verifyFaceMatch(stored, current, threshold = 0.5) {
  const d = calculateFaceDistance(stored, current);
  return {
    isMatch: d < threshold,
    distance: Number(d.toFixed(4)),
    confidence: `${Math.max(0, (1 - d) * 100).toFixed(2)}%`,
  };
}

function getISTNow() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000);
}

function getISTDateKey() {
  return getISTNow().toISOString().slice(0, 10);
}
function toIST(date) {
  // Convert UTC → IST (+5:30)
  return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
}

function buildIST(dateKey, time) {
  const [h, m] = time.split(":");
  return new Date(`${dateKey}T${h}:${m}:00+05:30`);
}

function isWithinShiftTime(currentUTC, startIST, endIST, graceMinutes = 15) {
  // Convert current time from UTC → IST
  const currentIST = toIST(currentUTC);

  const graceMs = graceMinutes * 60 * 1000;

  // Apply grace
  const startWithGrace = new Date(startIST.getTime() - graceMs);
  const endWithGrace = new Date(endIST.getTime() + graceMs);

  // Full debug logs
  console.log("--------------- SHIFT VALIDATION ----------------");
  console.log("Shift Start (IST):", startIST);
  console.log("Shift End   (IST):", endIST);
  console.log("Allowed Start - Grace:", startWithGrace);
  console.log("Allowed End   + Grace:", endWithGrace);
  console.log("Current Time (IST):", currentIST);
  console.log("---------------------------------------------------");

  return currentIST >= startWithGrace && currentIST <= endWithGrace;
}


/* -------------------- CHECK-IN -------------------- */

const checkIn = async (req, res) => {
  try {
    const { employeeId, faceDescriptor, location } = req.body;

    if (!employeeId || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    if (!location?.latitude || !location?.longitude) {
      return res.status(400).json({ success: false, message: "Location required" });
    }

    const now = getISTNow();
    const dateKey = getISTDateKey();
    console.log(`🕒 Check-in attempt at ${now.toISOString()} (IST)`);

    /* -------- Employee -------- */
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee || !employee.faceRegistered) {
      return res.status(403).json({ success: false, message: "Face not registered" });
    }

    const face = verifyFaceMatch(employee.faceDescriptor, faceDescriptor);
    if (!face.isMatch) {
      return res.status(403).json({
        success: false,
        message: "Face verification failed",
        distance: face.distance,
      });
    }

    /* -------- Shift -------- */
    const shift = await RockstarShiftModel.findOne({
      employees: employeeId,
      dateKey,
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "No shift assigned today",
      });
    }

    const shiftStart = buildIST(dateKey, shift.startTime);
    const shiftEnd = buildIST(dateKey, shift.endTime);

    if (!isWithinShiftTime(now, shiftStart, shiftEnd)) {
      return res.status(400).json({
        success: false,
        message: `Check-in allowed near ${shift.startTime} – ${shift.endTime}`,
      });
    }
    

    /* -------- Leave -------- */
    const leave = await LeaveRequestModel.findOne({
      employeeId,
      status: "approved",
      allLeaveDays: {
        $elemMatch: {
          $gte: new Date(`${dateKey}T00:00:00`),
          $lte: new Date(`${dateKey}T23:59:59`),
        },
      },
    });

    if (leave) {
      return res.status(403).json({
        success: false,
        message: "You are on approved leave today",
      });
    }

    /* -------- Attendance -------- */
    let attendance = await AttendanceModel.findOne({
      employee: employeeId,
      dateKey,
      shift: shift._id,
    });

    // Block double check-in without checkout
    if (attendance?.punches?.length) {
      const last = attendance.punches[attendance.punches.length - 1];
      if (last.in && !last.out) {
        return res.status(400).json({
          success: false,
          message: "Already checked in. Please check out first.",
        });
      }
    }

    const address = await getReadableAddress(
      location.latitude,
      location.longitude
    );

    if (!attendance) {
      attendance = new AttendanceModel({
        employee: employeeId,
        shift: shift._id,
        dateKey,
        punches: [],
        status: "not-started",
        buttonCheckIn: 1,
        buttonCheckOut: false,
      });
    }
    const start = new Date(shiftStart.getTime() )
     const currentIST = toIST(now);
     if (currentIST < start) {
      attendance.early = true;
      attendance.late = false;
      
    }
    else {
      attendance.late = true;
      attendance.early = false;
    }


    // Push punch
    attendance.punches.push({ in: now });
    attendance.buttonCheckIn = 1;
    attendance.checkInLocation = location;
    attendance.checkInAddress = address;

    

    await attendance.save();

    if (shift.status === "upcoming") {
      shift.status = "active";
      await shift.save();
    }

    res.status(200).json({
      success: true,
      message: "✅ Check-in successful",
      attendance,
      faceConfidence: face.confidence,
    });

  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// ------------------ CHECK-OUT ------------------
// Fixed checkOut function with location support
const checkOut = async (req, res) => {
  try {
    const { employeeId, faceDescriptor, location } = req.body;

    /* -------------------- VALIDATION -------------------- */
    if (!employeeId || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    if (!location?.latitude || !location?.longitude) {
      return res.status(400).json({ success: false, message: "Location required" });
    }

    const nowIST = getISTNow();
    const dateKey = getISTDateKey();

    /* -------------------- EMPLOYEE + FACE -------------------- */
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee || !employee.faceRegistered) {
      return res.status(403).json({ success: false, message: "Face not registered" });
    }

    const face = verifyFaceMatch(employee.faceDescriptor, faceDescriptor);
    if (!face.isMatch) {
      return res.status(403).json({
        success: false,
        message: "Face verification failed",
        distance: face.distance,
      });
    }

    /* -------------------- ATTENDANCE -------------------- */
    const attendance = await AttendanceModel.findOne({
      employee: employeeId,
      dateKey,
    }).populate("shift");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No attendance found for today",
      });
    }

    if (!attendance.punches.length) {
      return res.status(400).json({
        success: false,
        message: "No active check-in found",
      });
    }

    const lastPunch = attendance.punches[attendance.punches.length - 1];

    if (lastPunch.out) {
      return res.status(400).json({
        success: false,
        message: "Already checked out",
      });
    }

    /* -------------------- SHIFT -------------------- */
    const shift = attendance.shift;
    if (!shift) {
      return res.status(500).json({
        success: false,
        message: "Shift not found",
      });
    }

    // const shiftEnd = buildIST(attendance.dateKey, shift.endTime);

    /* -------------------- LOCATION ADDRESS -------------------- */
    const address = await getReadableAddress(
      location.latitude,
      location.longitude
    );

    /* -------------------- CLOSE PUNCH -------------------- */
    lastPunch.out = nowIST;
    attendance.buttonCheckIn = null;
    attendance.checkOutLocation = location;
    attendance.checkOutAddress = address;

    /* -------------------- EARLY / OT CALCULATION -------------------- */
    // const diffMinutes = Math.floor((nowIST - shiftEnd) / 60000);

    // if (diffMinutes < 0) {
    //   attendance.early = true;
    //   attendance.earlyByMinutes = Math.abs(diffMinutes);
    // } else if (diffMinutes > 0) {
    //   attendance.overtimeMinutes += diffMinutes;
    // }

    

    await attendance.save();

    /* -------------------- SHIFT STATUS -------------------- */
    if (shift.status !== "completed") {
      shift.status = "completed";
      await shift.save();
    }

    return res.status(200).json({
      success: true,
      message: "✅ Check-out successful",
      attendance,
      faceConfidence: face.confidence,
    });

  } catch (err) {
    console.error("❌ Check-out error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { checkIn, checkOut };