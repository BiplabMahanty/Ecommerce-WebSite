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
    const verifyRole = require("../middleware/authMiddleware");
    const { getInvoiceByMonth } = require("../employeeController/getInvoiceByMonth");
    const invoiceId = require("../employeeController/getInvoiceById");
    const { leaveRequestEmployee } = require("../employeeController/leaveRequestEmployee");
    const { getLeaveType } = require("../employeeController/getLeaveType");
const { getLeaveTotal } = require("../employeeController/getTotalLeave");
     
    router.post("/login",login)


    router.post("/checkIn",verifyRole(["employee"]),checkIn);
    router.post("/checkout",verifyRole(["employee"]), checkOut);
    // Face registration endpoint (accepts employeeId + faceDescriptor array)
    router.post("/registerFace", registerFace);

    router.post("/leaveRequest",verifyRole(["employee"]),leaveRequest)
    router.post("/getAttendance",verifyRole(["employee"]), getAttendance);
    router.post("/getLeaveRequest",verifyRole(["employee"]), getLeaveRequest);
    router.post("/change-password",verifyRole(["employee"]), ChangePassword);


    router.get("/getEmployee/:employeeId",verifyRole(["employee"]), getEmployee);

    router.get("/attendance/:id",verifyRole(["employee"]), getAttaendanceByMonth);

   

    router.post("/invoice",invoice);
    router.get("/getInvoiceByMonth/:id",verifyRole(["employee"]),getInvoiceByMonth);
    router.get("/invoice/download/:invoiceId",verifyRole(["employee"]),invoiceId);


    router.post("/leaveRequestEmployee",leaveRequestEmployee);
    router.get("/getLeaveType",verifyRole(["employee"]),getLeaveType);
    
    router.get("/getLeaveTotal/:employeeId",verifyRole(["employee"]),getLeaveTotal);





    module.exports = router;
