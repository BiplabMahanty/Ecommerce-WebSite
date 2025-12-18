const LeaveRequestModel = require("../models/leaveRequest");
const EmployeeModel = require("../models/employee");
const SuperAdminModel = require("../models/superAdmin");

//fix multiple leave request 

const leaveRequest = async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;

    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
       return res.status(400).json({
       success: false,
       message: "Start date cannot be greater than end date",
       });
    }

    const superAdmin = await SuperAdminModel.findOne()

    // Find latest leave record for employee
    let lastLeave = await LeaveRequestModel
      .findOne({ employeeId })
      .sort({ createdAt: -1 });   // returns SINGLE document

    console.log("Last leave record:", lastLeave);
    if (!lastLeave) {
      if (employee.department == "it department") {

        console.log("if 1")
        lastLeave = new LeaveRequestModel({
          employeeId,
          type,
          startDate,
          endDate,
          reason,
          totalLeave: superAdmin.itDepartmentLeave,
          remaningLeave: superAdmin.itDepartmentLeave,
          wantLeave:0,
          usedLeave:0,
        })

      }
      else if (employee.department == "HR") {

        console.log("if 2")

        lastLeave = new LeaveRequestModel({
          employeeId,
          type,
          startDate,
          endDate,
          reason,
          totalLeave: superAdmin.HRLeave,
          remaningLeave: superAdmin.HRLeave,
          wantLeave:0,
          usedLeave:0,
        })

      }
      else {
        console.log("if 3")

        lastLeave = new LeaveRequestModel({
          employeeId,
          type,
          startDate,
          endDate,
          reason,
          totalLeave: superAdmin.otherLeave,
          remaningLeave: superAdmin.otherLeave,
          wantLeave:0,
          usedLeave:0,
        })
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diff = Math.abs(end - start);
      const wantLeave = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;



      let allDates = [];

      let current = new Date(start);

      while (current <= end) {
        allDates.push(new Date(current)); // push a copy
        current.setDate(current.getDate() + 1); // move to next day
      }

      console.log(allDates);
      lastLeave.allLeaveDays.push(...allDates);

      lastLeave.wantLeave = wantLeave
      await lastLeave.save();
    }



   


    else {
       console.log("remaning leave",lastLeave.remaningLeave)
    console.log("totalleave",lastLeave.totalLeave)
    const totalLeave=lastLeave.totalLeave;
    const remaning=lastLeave.remaningLeave;
      if (employee.department == "it department") {

        console.log("if 4")

        const newLeave = new LeaveRequestModel({
          employeeId,
          type,
          startDate,
          endDate,
          reason,
          totalLeave:totalLeave,
          remaningLeave:remaning,
          wantLeave: 0,
         usedLeave:lastLeave.usedLeave,
        })
        await newLeave.save();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const diff = Math.abs(end - start); 
        const wantLeave = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

        let allDates = [];

        let current = new Date(start);

        while (current <= end) {
          allDates.push(new Date(current)); // push a copy
          current.setDate(current.getDate() + 1); // move to next day
        }

        console.log(allDates);
        newLeave.allLeaveDays.push(...allDates);

        newLeave.wantLeave = wantLeave

        await newLeave.save();
      }
      else if (employee.department == "HR") {

        console.log("if 5")
        const totalLeave=lastLeave.totalLeave;
        const remaningLeave=lastLeave.remaningLeave;
        const newLeave = new LeaveRequestModel({
          employeeId,
          type,
          startDate,
          endDate,
          reason,
          totalLeave: totalLeave,
          remaningLeave: remaningLeave,
          wantLeave,
         usedLeave:lastLeave.usedLeave,
        })
        await newLeave.save();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const diff = Math.abs(end - start);
        const wantLeave = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;



        let allDates = [];

        let current = new Date(start);

        while (current <= end) {
          allDates.push(new Date(current)); // push a copy
          current.setDate(current.getDate() + 1); // move to next day
        }

        console.log(allDates);
        newLeave.allLeaveDays.push(...allDates);

        newLeave.wantLeave = wantLeave

        await newLeave.save();

      }
      else {
        console.log("if 6")
        const totalLeave=lastLeave.totalLeave;
        const remaningLeave=lastLeave.remaningLeave;
        const newLeave = new LeaveRequestModel({
          employeeId,
          type,
          startDate,
          endDate,
          reason,
          totalLeave: totalLeave,
          remaningLeave: remaningLeave,
          wantLeave:0,
          usedLeave:lastLeave.usedLeave,

        })

        const start = new Date(startDate);
        const end = new Date(endDate);

        const diff = Math.abs(end - start);
        const wantLeave = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;



        let allDates = [];

        let current = new Date(start);

        while (current <= end) {
          allDates.push(new Date(current)); // push a copy
          current.setDate(current.getDate() + 1); // move to next day
        }

        console.log(allDates);
        newLeave.allLeaveDays.push(...allDates);

        newLeave.wantLeave = wantLeave

        await newLeave.save();
      }
    }



    res.status(201).json({
      message: "Leave request submitted successfully",
      success: true,
      leave: lastLeave,
      availableLeave: lastLeave.remaningLeave,
      
    });

  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { leaveRequest };