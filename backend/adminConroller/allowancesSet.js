// makeemployee.js (controller)
const employeeModel = require("../models/employee");
const EmployeeModel = require("../models/employee");


const payAllowances = async (req, res) => {
    try {
        const { employeeId, month,hraAllowances,daAllowances ,taAllowances,maAllowances,spAllowances,basicSalary,pfcal} = req.body;

        if (!employeeId || !month)
            return res.status(400).json({ success: false, message: "Employee & amount required" });
        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) return res.status(404).json({ message: "Employee not found", success: false });

        console.log("emp",employee.salary)       

       
        employee.pf = (basicSalary * pfcal) / 100;
        console.log("pf ",employee.pf);

        employee.esic = basicSalary <= 21000 ? (basicSalary * 0.75) / 100 : 0;
        console.log("employee.esic ",employee.esic);

        employee.professionalTex = 200;
        console.log("employee.professionalTex ",employee.professionalTex);

        employee.basicSalary=basicSalary;
        
        console.log("basicSalary ",basicSalary);

        employee.hraAllowances =  hraAllowances
        employee.daAllowances = daAllowances
        employee.taAllowances = taAllowances
        employee.maAllowances = maAllowances
        employee.spAllowances = spAllowances

        employee.totalAllowances=(employee.hraAllowances+ employee.daAllowances+employee.taAllowances+employee.maAllowances+employee.spAllowances)-(employee.pf+employee.esic+employee.professionalTex);
        console.log("employeeTotalAllowances ",employee.totalAllowances)

       




        // Update fields


        await employee.save();

        res.status(200).json({
            success: true,
            message: "Allowances paid successfully",
            employee,
        });

    } catch (err) {
        console.log("employee Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = payAllowances;
