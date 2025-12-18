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
const { getAttaendanceByMonthOverTime } = require("../adminConroller/getAttendanceByOvertime");
const { getAttaendanceByMonthLate } = require("../adminConroller/getAttendanceByLate");
const employeePayment = require("../adminConroller/employeePayment");
const paySalary = require("../adminConroller/employeePayment");
const {getPayment} = require("../adminConroller/getPayment");
const { getAllPayment } = require("../adminConroller/getAllPayment");
const payAllowances = require("../adminConroller/allowancesSet");
const { getAttendanceEmployee } = require("../adminConroller/getAttendanceEmp");
const { getAttaendanceById } = require("../adminConroller/getAttendanceById");
const editCheckOut = require("../adminConroller/editEmployeeCheckOut");
const { createLeaveType } = require("../adminConroller/adminLeaveSet");
const { addDepartment } = require("../adminConroller/addDepartment");
const { getAllDepartments } = require("../adminConroller/getAllDepertments");
const { getLeaveType } = require("../adminConroller/getLeaveType");
const {getShiftById} = require("../adminConroller/getShiftById");
const createPayroll = require("../adminConroller/createPayroll");


//varification routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verifyOtp", verifyOtp);

//admin for employee routes
router.post("/addEmployee", upload.single("image"),verifyRole(["admin"]), addEmployee);
router.get("/getAllEmployee", verifyRole(["admin"]), getEmployee);
router.get("/getEmployeeByDepartment/:department", verifyRole(["admin"]),getEmployeeByDepartment);

//shift routes
router.post("/addRockstarShift", verifyRole(["admin"]),addRockstarShift);
router.post("/addEmpInRockstar",verifyRole(["admin"]), addEmpInRockstar);
router.post("/addShift", verifyRole(["admin"]),addShift);
router.get("/getShift", verifyRole(["admin"]),getShift);
router.get("/getShiftById/:shiftId", verifyRole(["admin"]),getShiftById);

//leave routes
router.get("/getLeave", getLeave);
router.get("/getLeaveRequests", verifyRole(["admin"]), getLeaveRequests);
router.post("/verifyLeaveRequest", verifyRole(["admin"]), verifyLeaveRequest);
router.post("/editLeaveRequest", verifyRole(["admin"]), editLeaveRequest);
router.get("/department/:department", verifyRole(["admin"]), getDepartmentLeave);
router.get("/getLeaveTotal/:employeeId", getLeaveTotal);

//attendance routes
router.get("/getAttaendance", getAttaendance);
router.get("/attendance/:employeeId", verifyRole(["admin"]), getAttendanceEmployee);
router.get("/attendance/details/:attendanceId", verifyRole(["admin"]), getAttaendanceById);
router.get("/getAttaendanceByMonthOverTime/:id", getAttaendanceByMonthOverTime);
router.get("/getAttaendanceByMonthLate/:id", getAttaendanceByMonthLate);
router.post("/editCheckOut", verifyRole(["admin"]), editCheckOut);

//payment routes
router.post("/paySalary",verifyRole(["admin"]), paySalary);
router.post("/payAllowances",verifyRole(["admin"]), payAllowances);
router.get("/getPayment/:id",verifyRole(["admin"]), getPayment);
router.get("/getAllPayments", verifyRole(["admin"]), getAllPayment);
router.get("/getPayrollAlerts", getPayrollAlerts);
router.get("/getPendingRequests", getPendingRequests);
router.get("/getActiveLeaves", getActiveLeaves);

router.post("/createPayroll", createPayroll);

router.post("/createLeaveType",createLeaveType);
   

 router.post("/addDepartment",addDepartment);
 router.get("/getAllDepartments",verifyRole(["admin"]),getAllDepartments);


 router.get("/getLeaveType",verifyRole(["admin"]),getLeaveType);

module.exports = router;











