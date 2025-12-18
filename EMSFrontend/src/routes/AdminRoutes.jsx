import { Route } from "react-router-dom";

import RockstarShift from "../adminPage/RockStar";
import Add from "../adminPage/addShift";
import EmployeeAddToRockstarPage from "../adminPage/addEmp";
import PaymentPage from "../adminPage/PaymentSection";
import AllowancesPage from "../adminPage/addAllowances";
import AddEmployeePage from "../adminPage/addEmployee";
import EmployeeAttendancePage from "../adminComponents/EmployeeAttendancePage";
import Logout from "../adminPage/logOut";
import LeaveLayout from "../adminPage/LeaveLayout";
import LeaveSettings from "../adminComponents/leave/LeaveSettings";
import LeaveHistory from "../adminComponents/leave/LeaveHistory";
import LeaveTypeManagement from "../adminComponents/leave/leaveType";
import AddEmployeesToShift from "../adminComponents/AddEmployeesToShift";
import DashboardPage from "../adminPage/dashboard";
import CreateLeaveType from "../adminComponents/CreateLeaveType";


export const AdminRoutes = (
  <>
    <Route index element={<DashboardPage />} />
    <Route path="dashboard" element={<DashboardPage />} />

    <Route path="attendance" element={<LeaveLayout />}>
      <Route index element={<LeaveSettings />} />
      <Route path="settings" element={<LeaveSettings />} />
      <Route path="history" element={<LeaveHistory />} />
      <Route  path="leaveType" element={<LeaveTypeManagement />}>
        <Route path="create-Leave-Type" element={<CreateLeaveType />} />
      </Route>

    </Route>


    <Route path="rockstar" element={<RockstarShift />} />
    <Route path="add-shift" element={<Add />} />
    {/* <Route path="add-employee-rockstar" element={<EmployeeAddToRockstarPage />} />
      <Route path="add-employee-rockstar/:shiftId" element={<AddEmployeesToShift />} /> */}
    <Route path="add-employee-rockstar" element={<EmployeeAddToRockstarPage />}>
      <Route path=":shiftId" element={<AddEmployeesToShift />} />
    </Route>

    <Route path="payment" element={<PaymentPage />} />
    <Route path="allowances" element={<AllowancesPage />} />
    <Route path="add-employee" element={<AddEmployeePage />} />
    <Route path="employee-attendance" element={<EmployeeAttendancePage />} />
    <Route path="logout" element={<Logout />} />
  </>
);

