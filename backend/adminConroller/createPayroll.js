const AttendanceModel = require("../models/attendance");
const RockstarShiftModel = require("../models/rockStarShift");
const LeaveRequestModel = require("../models/leaveRequest");
const PaymentModel = require("../models/Payment");  
const EmployeeModel = require("../models/employee");  


const createPayroll = async (req, res) => {
    try {
        const { employeeId, month, year} = req.body;

        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }
        // Fetch attendance data for the employee for the given month
        const attendanceRecords = await AttendanceModel.find({
            employee: employeeId,
            dateKey: { $regex: `^${year}-${month.toString().padStart(2, '0')}` }
        });

        if (attendanceRecords.length === 0) {
            return res.status(400).json({ success: false, message: "No attendance records found for this employee for the given month." });
        }

        const shift = await RockstarShiftModel.find({
            employees: employeeId,
            dateKey: { $regex: `^${year}-${month.toString().padStart(2, '0')}` }
        });
        const hi= { dateKey: { $regex: `^${year}-${month.toString().padStart(2, '0')}` }};
        console.log("datekey Records:", hi);
        if (shift.length === 0) {
            return res.status(400).json({ success: false, message: "No shift records found for this employee for the given month." });
        }  
     
        attendanceRecords.forEach(record => {
            console.log("Attendance Record:", record);
            console.log("Record DateKey:", record.dateKey);
            console.log("Record Status:", record.workedSeconds);
            console.log("record minutes:", record.workedMinutes)
            console.log("-----");
        });

        let existingPayroll = await PaymentModel.findOne({ employee: employeeId, salaryMonth: `${year}-${month}` });
        if (!existingPayroll) {
           existingPayroll = new PaymentModel({
            employee: employeeId,
            salaryMonth: `${year}-${month}`,
            basicSalary:employee.basicSalary,
            name:employee.name,
            hraAllowances:employee.hraAllowances,
            daAllowances:employee.daAllowances,
            taAllowances:employee.taAllowances,
            maAllowances:employee.maAllowances,
            spAllowances:employee.spAllowances,
            pf:employee.pf,
            esic:employee.esic,
            professionalTex:employee.professionalTex,
           })
        }


      const basic= existingPayroll.basicSalary || employee.basicSalary;



        const totalWorkingDays = shift.length;
        const presentDays = attendanceRecords.filter(record => record.status === "present").length;
        const absentDays = attendanceRecords.filter(record => record.status === "absent").length;
        const leaveDays = attendanceRecords.filter(record => record.status === "leave").length;

        existingPayroll.totalAllowances = existingPayroll.totalAllowances || (employee.hraAllowances + employee.daAllowances + employee.taAllowances + employee.maAllowances + employee.spAllowances);
        existingPayroll.totalWorkingDays = totalWorkingDays;
        existingPayroll.presentDays = presentDays;
        existingPayroll.absentDays = absentDays;
        existingPayroll.leaveDays = leaveDays;

        existingPayroll.leaveDeductions = absentDays * (basic / totalWorkingDays);

        existingPayroll.compolsoryDeductions = (existingPayroll.pf || employee.pf) + (existingPayroll.esic || employee.esic) + (existingPayroll.professionalTex || employee.professionalTex);
        

        console.log("Total Working Days:", totalWorkingDays);
        console.log("Attendance Records:", attendanceRecords);
        console.log("Absent Days:", absentDays);
        console.log("Present Days:", presentDays);
        console.log("Leave Days:", leaveDays);
        
        
        
        await existingPayroll.save();
        res.status(201).json({ success: true, message: "Payroll created successfully.", payroll: existingPayroll });
    } catch (error) {
        console.error("Error creating payroll:", error);
        res.status(500).json({ success: false, message: "Server error while creating payroll." });
    }   
};
module.exports = createPayroll;