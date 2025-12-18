const LeaveType = require("../models/leaveType");
const Employee = require("../models/employee");
const EmployeeLeaveBalanceModel = require("../models/employeeLeaveBalance");

const createLeaveType = async (req, res) => {
  try {
    const {
      name,
      totalLeaves,
      isPaid,
      sandwichRule,
      applicableFrom,
      applicableTo,
      assignMode,
      departments,
      employees,
      carryForward,
    } = req.body;

    const leaveType = await LeaveType.create({
      name,
      totalLeaves,
      isPaid,
      sandwichRule,
      applicableFrom,
      applicableTo,
      assignMode,
      departments,
      employees,
      carryForward,
    });

    // 🔥 Assign leave balance automatically
    let employeeList = [];

    if (assignMode === "department") {
      employeeList = await Employee.find({
        department: { $in: departments },
      });
    } else {
      employeeList = await Employee.find({
        _id: { $in: employees },
      });
    }

    const balances = employeeList.map((emp) => ({
      employeeId: emp._id,
      leaveType: leaveType._id,
      totalLeave: totalLeaves,
      usedLeave: 0,
      remainingLeave: totalLeaves,
    }));

    //await EmployeeLeaveBalance.//insertMany(balances);
    await EmployeeLeaveBalanceModel.insertMany(balances);


    res.json({ success: true, leaveType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {createLeaveType};