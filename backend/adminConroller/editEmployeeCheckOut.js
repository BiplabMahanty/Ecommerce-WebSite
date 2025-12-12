const AttendanceModel = require("../models/attendance")
const PaymentModel = require("../models/Payment")
const RockstarShiftModel=require("../models/rockStarShift")

//late time to high 

// 🕒 Convert time to IST
function getIndianDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
  return new Date(now.getTime() + istOffset);
}
function getIndianMonthKey() {
  const ist = getIndianDate();
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, "0"); // 01–12
  return `${year}-${month}`;
}

function toIST(date) {
    // Convert UTC → IST (+5:30)
    return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
}
function buildIstDateFromDateKeyAndTime(dateKey, timeStr) {
    // Ensure timeStr is "HH:MM"
    const [hh, mm] = (timeStr || "00:00").split(":").map(s => String(s).padStart(2, "0"));
    // Construct with explicit +05:30 so JS parses correctly as IST moment
    const isoWithOffset = `${dateKey}T${hh}:${mm}:00+05:30`;
    return new Date(isoWithOffset);
}


const editCheckOut = async (req, res) => {
    try {
    const { attendanceId, checkOut, employeeId } = req.body;

    const attendance = await AttendanceModel.findById(attendanceId);
    if (!attendance) {
        return res.status(400).json({
            success: false,
            message: "No attendance found",

        })
    }
    
    const month = getIndianMonthKey();




    
    const dateKey = attendance.dateKey;
    console.log("dataKey",dateKey)
   

    const shift = await RockstarShiftModel.findById(attendance.shift) || await RockstarShiftModel.findOne({
        employees: employeeId,
        dateKey,
        status: { $in: ["active", "upcoming", "completed"] },
    });

    if (!shift) {
        return res.status(500).json({
            message: "Shift info not found for checkout",
            success: false
        });
    }

    
    const time = checkOut;  

    // Step 1: extract date from existing attendance.checkIn
    const existingDate = new Date(attendance.checkIn); // 2025-12-11

    // Step 2: split hours & minutes
    const [hours, minutes] = time.split(":");

    // Step 3: create new datetime with same date but new time
   const newCheckOut = new Date(`${attendance.dateKey}T${hours}:${minutes}:00Z`);

    newCheckOut.setSeconds(0);
    newCheckOut.setMilliseconds(0);
    console.log("checkOut time ",newCheckOut)
    // finally update:  
    attendance.checkOut = newCheckOut;
   


     console.log("checkOut time ",newCheckOut)
     console.log("checkOut  ",checkOut)
     console.log("attendanceCheckOut",attendance.checkIn)





    // // Parse shift end time
    // const parsedShiftEnd = buildIstDateFromDateKeyAndTime(dateKey, shift.endTime);
    const parsedShiftEnd = new Date(`${dateKey}T${shift.endTime}:00Z`);


    console.log("shiftEnd  time ",shift.endTime)
    console.log("parsedShiftEnd ",parsedShiftEnd)

    // Initialize numeric fields
    attendance.lateBy = Number(attendance.lateBy || 0);
    attendance.overTime = Number(attendance.overTime || 0);

    // Calculate overtime/late time
    if (newCheckOut < parsedShiftEnd) {
        // Checking out early
        const diffMs = parsedShiftEnd - newCheckOut;
        const minutesUntilEnd = Math.floor(diffMs / 60000);
        attendance.lateBy = Number(attendance.lateBy || 0) + minutesUntilEnd;
    } else if (newCheckOut > parsedShiftEnd) {
        // Checking out after shift end
        const diffMs = newCheckOut - parsedShiftEnd;
        const overtimeMinutes = Math.floor(diffMs / 60000);
        const prevLate = Number(attendance.lateBy || 0);

        if (prevLate < overtimeMinutes) {
            attendance.overTime = overtimeMinutes - prevLate;
            attendance.lateBy = 0;
        } else {
            attendance.lateBy = prevLate - overtimeMinutes;
            attendance.overTime = 0;
        }
    }

    



    await attendance.save();

    // Update payment record
    let payment = await PaymentModel.findOne({
        employee: employeeId,
        salaryMonth: month,
    });

    if (!payment) {
        payment = new PaymentModel({
            employee: employeeId,
            salaryMonth: month,
            amountPaid: 0,
            previousDue: 0,
            remainingDue: 0,
            overtimeMinites: 0,
            overLateTime: 0,
        });
    }

    // Update overtime and late time
    payment.overtimeMinites = Number(payment.overtimeMinites || 0) + Number(attendance.overTime || 0);
    payment.overLateTime = Number(payment.overLateTime || 0) + Number(attendance.lateBy || 0);

    const overLate = Number(payment.overLateTime);
    const overtime = Number(payment.overtimeMinites);

    payment.lateTimeDeductions = (overLate / 60) * 100;
    payment.overtimePay = (overtime / 60) * 100;

    await payment.save();

    // Update shift status
    // if (shift) {
    //     shift.status = "completed";
    //     await shift.save().catch(() => { });
    // }

    res.status(200).json({
        message: "✅ Check-out successful",
        success: true,
        attendance,

    });

} catch (err) {
    console.error("❌ Check-out Error:", err);
    res.status(500).json({
        message: "Internal Server Error",
        success: false,
        error: err.message
    });

 }
}
module.exports=editCheckOut;