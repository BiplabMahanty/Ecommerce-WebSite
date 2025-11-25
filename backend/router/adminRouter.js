const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");



const verifyRole=require("../middleware/authMiddleware");
const { signup, login, verifyOtp } = require("../adminConroller/verification");
const { addEmployee } = require("../adminConroller/createEmployee");
const { getAttaendance } = require("../adminConroller/getAttandance");
const { verifyLeaveRequest, getLeaveRequests } = require("../adminConroller/verifyLeaveRequest");
const { addRockstarShift } = require("../adminConroller/addRockstarShift");
const { getEmployee } = require("../adminConroller/getAllEmployee");
const { getLeave } = require("../adminConroller/getLeave");
const { getActiveLeaves, getPendingRequests, getPayrollAlerts } = require("../adminConroller/leaveDetails");
const { getDepartmentLeave } = require("../adminConroller/getLeaveDepart");
const { getEmployeeByDepartment } = require("../adminConroller/getEmployeeByDepartment");

const { getLeaveTotal } = require("../adminConroller/getTotalLeave");
const { addEmpInRockstar, addShift } = require("../adminConroller/addShiftAndEmployee");
const { getShift } = require("../adminConroller/getShift");
const { editLeaveRequest } = require("../adminConroller/editLeaveRequest");



router.post("/signup",  signup);
router.post("/login",  login);
router.post("/verifyOtp", verifyOtp);


router.post("/addEmployee",upload.single("image"), addEmployee);
/*router.post("/getAttaendance", getAttaendance);
router.post("/verifyLeaveRequest", verifyLeaveRequest);

console.log("shift",shift)
    console.log("time",todayIST)*/
router.get("/getLeaveRequests", getLeaveRequests);

// ✅ POST approve/reject
router.post("/verifyLeaveRequest", verifyLeaveRequest);


router.post("/addRockstarShift", addRockstarShift);


router.get("/getAllEmployee", getEmployee);
router.get("/getLeave", getLeave);


router.get("/getPayrollAlerts", getPayrollAlerts);
router.get("/getPendingRequests", getPendingRequests);
router.get("/getActiveLeaves", getActiveLeaves);


router.get("/getAttaendance", getAttaendance);

router.get("/department/:department", getDepartmentLeave);

router.get("/getEmployeeByDepartment/:department", getEmployeeByDepartment);

router.get("/getLeaveTotal/:employeeId", getLeaveTotal);


router.post("/addEmpInRockstar", addEmpInRockstar);
router.post("/addShift", addShift);

router.get("/getShift",getShift)

router.post("/editLeaveRequest",editLeaveRequest)


module.exports=router
