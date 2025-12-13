import { Route } from "react-router-dom";

import EmployeePanel from "../components/face";
import LeaveAdd from "../components/LeaveAdd";
import Logout from "../components/LogOut";
import DashboardPage from "../components/Dashboard";
import AttendanceReportsPage from "../components/AttendanceDetails";

export const EmployeeRoutes = (
  <>
    <Route index element={<DashboardPage />} />
    <Route path="attendance" element={<EmployeePanel />} />
    <Route path="leave" element={<LeaveAdd />} />
    <Route path="attendance-details" element={<AttendanceReportsPage />} />
    
    <Route path="logout" element={<Logout />} />
  </>
);
