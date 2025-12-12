    const express = require("express");

    const router = express.Router();


    const { checkIn, checkOut } = require("../employeeController/attandanceCheckout");
    // registerFace implemented in try2.js (kept separate for experiments)
    const { registerFace } = require("../employeeController/try2");
    const { leaveRequest } = require("../employeeController/leaveRequest");
    const { getAttendance } = require("../employeeController/getAttandance");
    const { login } = require("../employeeController/login");
    const { getLeaveRequest } = require("../employeeController/getLeaveRequest");
    const { ChangePassword } = require("../employeeController/changePassword");
    const { getEmployee } = require("../employeeController/getEmployee");
    const { getAttaendanceByMonth } = require("../employeeController/getAttendanceByMonth");
    const invoice = require("../employeeController/getInvoice");
    // Employee check-in

    router.post("/login",login)


    router.post("/checkin", checkIn);
    router.post("/checkout", checkOut);
    // Face registration endpoint (accepts employeeId + faceDescriptor array)
    router.post("/registerFace", registerFace);

    router.post("/leaveRequest",leaveRequest)
    router.post("/getAttendance", getAttendance);
    router.post("/getLeaveRequest", getLeaveRequest);
    router.post("/change-password", ChangePassword);


    router.get("/getEmployee/:employeeId", getEmployee);

    router.get("/attendance/:id", getAttaendanceByMonth);

   

    router.post("/invoice",invoice);


    module.exports = router;
