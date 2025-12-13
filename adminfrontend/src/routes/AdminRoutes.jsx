// adminfrontend/src/routes/AdminRoutes.jsx
import { Route } from "react-router-dom";

import LeaveManagementPage from "../components/LeaveManagement";
import RockstarShift from "../components/RockStar";
import MonthlyCalendar from "../components/calendar";
import Add from "../components/addShift";
import EmployeeAddToRockstarPage from "../components/addEmp";
import PayrollDashboard from "../components/PayrollStatus";
import PaymentPage from "../components/PaymentSection";
import AllowancesPage from "../components/addAllowances";
import AddEmployeePage from "../components/addEmployee";
import EmployeeAttendancePage from "../components/EmployeeAttendancePage";

export const AdminRoutes = (
  <>
    <Route index element={<h1 className="text-3xl font-bold">Dashboard</h1>} />
    <Route path="attendance" element={<LeaveManagementPage />} />
    <Route path="rockstar" element={<RockstarShift />} />
    <Route path="calendar" element={<MonthlyCalendar />} />
    <Route path="add-shift" element={<Add />} />
    <Route path="add-employee-rockstar" element={<EmployeeAddToRockstarPage />} />
    <Route path="payroll" element={<PayrollDashboard />} />
    <Route path="payment" element={<PaymentPage />} />
    <Route path="allowances" element={<AllowancesPage />} />
    <Route path="add-employee" element={<AddEmployeePage />} />
    <Route path="employee-attendance" element={<EmployeeAttendancePage />} />
  </>
);
