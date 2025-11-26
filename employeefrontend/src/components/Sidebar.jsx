import React, { useState, useEffect } from "react";
import { Clock, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import EmployeePanel from "./EmployeePanel";
import LeaveAdd from "./LeaveAdd";
import Logout from "./LogOut";
import DashboardPage from "./Dashboard";
import AttendanceReportsPage from "./AttendanceDetails"
import { get } from "mongoose";
import axios from "axios";

export default function Sidebar() {
  const [activePage, setActivePage] = useState("EmployeePanel");
  const [employeeData, setEmployeeData] = useState(null);



  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employeeInfo"));

  const employeeId = localStorage.getItem("employeeId");
    console.log("Employee ID:", employeeId);

  if (!employee) {
    navigate("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) navigate("/login");

    // Fetch employee details (including image)
    fetchEmployeeDetails();

  }, [navigate]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:9000/api/employee/getEmployee/${employeeId}`, 
      
      );

      

      if (res.data && res.data.success) {
        setEmployeeData(res.data.employee);

      }


    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };
  // Image URL
  const imageURL = employeeData?.employeeImage
    ? `http://localhost:9000/${employeeData.employeeImage}`
    : null;
    console.log("image>>>>>>>>>",employeeData);
 
  return (
    <div className="flex min-h-screen bg-[#E8F0F8]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A1D3A] text-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            
            {/* Employee Image */}
            {imageURL ? (
              <img
                src={imageURL}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border border-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            )}

            <div>
              <h1 className="text-lg font-semibold">{employee?.name}</h1>
              <p className="text-sm opacity-70">{employee?.position}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-4">

            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                activePage === "dashboard"
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-white/10"
              }`}
              onClick={() => setActivePage("dashboard")}
            >
              <User size={18} /> Dashboard
            </button>

            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                activePage === "EmployeePanel"
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-white/10"
              }`}
              onClick={() => setActivePage("EmployeePanel")}
            >
              <Clock size={18} /> Attendance
            </button>

            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                activePage === "leave"
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-white/10"
              }`}
              onClick={() => setActivePage("leave")}
            >
              <Calendar size={18} /> Leave
            </button>
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                activePage === "attendanceDetails"
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-white/10"
              }`}
              onClick={() => setActivePage("attendanceDetails")}
            >
              <Calendar size={18} /> Attendance Details
            </button>
          </nav>
        </div>

        <button
          className={`w-full flex items-center gap-3 p-3 rounded-lg ${
            activePage === "logout"
              ? "bg-yellow-500 text-black"
              : "hover:bg-white/10"
          }`}
          onClick={() => setActivePage("logout")}
        >
          Log Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-5">
        {activePage === "EmployeePanel" && <EmployeePanel />}
        {activePage === "leave" && <LeaveAdd />}
        {activePage === "logout" && <Logout />}
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "attendanceDetails" && <AttendanceReportsPage />}
        
      </div>
    </div>
  );
}
