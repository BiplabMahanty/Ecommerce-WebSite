const cron = require("node-cron");
const AttendanceModel = require("../models/attendance");
const RockstarShiftModel = require("../models/rockStarShift");
const LeaveRequestModel = require("../models/leaveRequest");

/* -------------------- HELPERS -------------------- */

// Build IST date
function buildIST(dateKey, timeStr) {
  const [h, m] = timeStr.split(":");
  return new Date(`${dateKey}T${h}:${m}:00+05:30`);
}

// Get yesterday IST dateKey
function getYesterdayISTDateKey() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  ist.setDate(ist.getDate() - 1);
  return ist.toISOString().slice(0, 10);
}

/* -------------------- CRON -------------------- */

cron.schedule("0 5 * * *", async () => {
  console.log("🕒 Attendance cron started");

  try {
    const dateKey = getYesterdayISTDateKey();

    /* -------------------- SHIFTS -------------------- */
    const shifts = await RockstarShiftModel.find({ dateKey });

    for (const shift of shifts) {
      for (const employeeId of shift.employees) {

        /* -------------------- CHECK LEAVE -------------------- */
        const leave = await LeaveRequestModel.findOne({
          employeeId,
          status: "approved",
          allLeaveDays: {
            $elemMatch: {
              $gte: new Date(`${dateKey}T00:00:00+05:30`),
              $lte: new Date(`${dateKey}T23:59:59+05:30`),
            },
          },
        });

        /* -------------------- ATTENDANCE -------------------- */
        let attendance = await AttendanceModel.findOne({
          employee: employeeId,
          dateKey,
          shift: shift._id,
        });

        /* ---------- LEAVE ---------- */
        if (leave && !attendance) {
          await AttendanceModel.create({
            employee: employeeId,
            shift: shift._id,
            dateKey,
            status: "leave",
            punches: [],
            workedSeconds: 0,
          });
          continue;
        }

        /* ---------- ABSENT ---------- */
        if (!attendance && !leave) {
          await AttendanceModel.create({
            employee: employeeId,
            shift: shift._id,
            dateKey,
            status: "absent",
            punches: [],
            workedSeconds: 0,
          });
          continue;
        }

        /* ---------- AUTO CHECK-OUT ---------- */
        if (attendance?.punches?.length) {
          const lastPunch = attendance.punches[attendance.punches.length - 1];

          if (lastPunch.in && !lastPunch.out) {
            const shiftEnd = buildIST(dateKey, shift.endTime);
            lastPunch.out = shiftEnd;
            await attendance.save();
          }
        }
      }

      /* -------------------- COMPLETE SHIFT -------------------- */
      if (shift.status !== "completed") {
        shift.status = "completed";
        await shift.save();
      }
    }

    console.log("✅ Attendance cron completed");

  } catch (err) {
    console.error("❌ Attendance cron failed:", err);
  }
});
