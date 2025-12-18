import { Route } from "react-router-dom";

import EmployeePanel from "../employeeComponents/face";
import LeaveAdd from "../employeeComponents/LeaveAdd";
import Logout from "../employeeComponents/LogOut";
import DashboardPage from "../employeeComponents/Dashboard";
import AttendanceReportsPage from "../employeeComponents/AttendanceDetails";
import EmployeeInvoicePage from "../employeeComponents/paymentDetails";

export const EmployeeRoutes = (
  <>
    <Route index element={<DashboardPage />} />
    <Route path="attendance" element={<EmployeePanel/>} />
    <Route path="leave" element={<LeaveAdd />} />
    <Route path="attendance-details" element={<AttendanceReportsPage />} />
    <Route path="EmployeeInvoicePage" element={<EmployeeInvoicePage/>} />
    
    <Route path="logout" element={<Logout />} />
  </>
);
