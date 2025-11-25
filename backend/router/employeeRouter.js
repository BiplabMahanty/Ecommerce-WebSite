    const express = require("express");

    const router = express.Router();


    const { checkIn, checkOut } = require("../employeeController/attandanceCheckout");
    const { leaveRequest } = require("../employeeController/leaveRequest");
    const { getAttendance } = require("../employeeController/getAttandance");
    const { login } = require("../employeeController/login");
    const { getLeaveRequest } = require("../employeeController/getLeaveRequest");
    const { ChangePassword } = require("../employeeController/changePassword");
const { getEmployee } = require("../employeeController/getEmployee");
    // Employee check-in

    router.post("/login",login)


    router.post("/checkin", checkIn);
    router.post("/checkout", checkOut);

    router.post("/leaveRequest",leaveRequest)
    router.post("/getAttendance", getAttendance);
    router.post("/getLeaveRequest", getLeaveRequest);
    router.post("/change-password", ChangePassword);


    router.get("/getEmployee/:employeeId", getEmployee);


    module.exports = router;
