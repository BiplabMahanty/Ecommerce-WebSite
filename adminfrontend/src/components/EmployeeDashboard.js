import React, { useEffect, useState } from "react";
import Topbar from "./Topbar";
import DashboardCard from "./DashboardCard";
import LeaveTable from "./LeaveTable";
import axios from "axios";



const EmployeeDashboard = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeLeaves, setActiveLeaves] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [payrollAlerts, setPayrollAlerts] = useState(0);

  // Store fetched datasets
  const [employeesData, setEmployeesData] = useState([]);
  const [activeLeavesData, setActiveLeavesData] = useState([]);
  const [pendingRequestsData, setPendingRequestsData] = useState([]);
  const [payrollAlertsData, setPayrollAlertsData] = useState([]);

  // Table to show
  const [selectedTable, setSelectedTable] = useState("employees");

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  const fetchDashboardCounts = async () => {
    try {
      // Employees
      const empRes = await axios.get("http://localhost:9000/api/admin/getAllEmployee");
      setTotalEmployees(empRes.data.count || 0);
      setEmployeesData(empRes.data.employee || []);

      // Active leaves
      const activeRes = await axios.get("http://localhost:9000/api/admin/getActiveLeaves");
      setActiveLeaves(activeRes.data.count || 0);
      setActiveLeavesData(activeRes.data.leaves || []);

      // Pending Requests
      const pendingRes = await axios.get("http://localhost:9000/api/admin/getPendingRequests");
      setPendingRequests(pendingRes.data.count || 0);
      setPendingRequestsData(pendingRes.data.leaves || []);

      // Payroll Alerts
      const alertRes = await axios.get("http://localhost:9000/api/admin/getPayrollAlerts");
      setPayrollAlerts(alertRes.data.count || 0);
      setPayrollAlertsData(alertRes.data.alerts || []);

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    }
  };

  // Decide what to show in LeaveTable
  const getTableData = () => {
    switch (selectedTable) {
      case "employees":
        return { type: "employees", data: employeesData };
      case "activeLeaves":
        return { type: "activeLeaves", data: activeLeavesData };
      case "pendingRequests":
        return { type: "pendingRequests", data: pendingRequestsData };
      case "payrollAlerts":
        return { type: "payrollAlerts", data: payrollAlertsData };
      default:
        return { type: "employees", data: employeesData };
    }
  };

  return (
   
  <div className="flex min-h-screen bg-gray-100">

    {/* MAIN CONTENT */}
    <div className="flex-1 p-8">

      {/* Topbar */}
      <Topbar />

      {/* Top Stats → Dashboard Cards */}
      <div className="grid grid-cols-4 gap-6 mt-6">

        <div onClick={() => setSelectedTable("employees")}>
          <DashboardCard title="Total Employees" count={totalEmployees} clickable />
        </div>

        <div onClick={() => setSelectedTable("activeLeaves")}>
          <DashboardCard title="Active Leaves" count={activeLeaves} clickable />
        </div>

        <div onClick={() => setSelectedTable("pendingRequests")}>
          <DashboardCard title="Pending Requests" count={pendingRequests} clickable />
        </div>

        <div onClick={() => setSelectedTable("payrollAlerts")}>
          <DashboardCard title="Payroll Alerts" count={payrollAlerts} clickable />
        </div>

      </div>

      {/* Dynamic Table Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <LeaveTable display={getTableData()} />
      </div>

    </div>
  </div>
);

};
export default EmployeeDashboard;