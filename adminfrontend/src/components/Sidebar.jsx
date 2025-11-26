import React, { useState, useEffect } from "react";
import { Clock, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LeaveManagementPage from "./LeaveManagement";
import RockstarShift from "./RockStar";
import MonthlyCalendar from "./calendar";
import Add from "./addShift";
import EmployeeAddToRockstarPage from "./addEmp";
import PayrollDashboard from "./PayrollStatus";
export default function Sidebar() {
  const [activePage, setActivePage] = useState("dashboard");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const Admin=JSON.parse(localStorage.getItem("adminInfo"));



  return (
    <div className="flex min-h-screen bg-[#E8F0F8]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A1D3A] text-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div>
              <h1 className="text-lg font-semibold">{Admin.name}</h1>
              <p className="text-sm opacity-70">{Admin.role}</p>
            </div>
          </div>

          <nav className="space-y-4">

            {/* DASHBOARD */}
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "dashboard" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("dashboard")}
            >
              <User size={18} /> Dashboard
            </button>

            {/* EMPLOYEE PANEL */}
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "EmployeePanel" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("EmployeePanel")}
            >
              <Clock size={18} /> Attendance
            </button>

            {/* LEAVE PAGE */}
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "rockstar" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("rockstar")}
            >
              <Calendar size={18} /> Rockstar Shift
            </button>
            {/* CALENDAR PAGE */}
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "MonthlyCalendar" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("MonthlyCalendar")}
            >
              <Calendar size={18} /> Monthly Calendar
            </button>
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "Add" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("Add")}
            >
              <Calendar size={18} /> Add Shift
            </button>


             <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "EmployeeAddToRockstarPage" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("EmployeeAddToRockstarPage")}
            >
              <Calendar size={18} /> EmployeeAdd
            </button>

             <button
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${activePage === "PayrollDashboard" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("PayrollDashboard")}
            >
              <Calendar size={18} /> PayrollDetails
            </button>
          </nav>
        </div>

        <button className="w-full p-3 rounded-lg bg-red-600 text-white font-semibold">
          Log Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-5">

        {activePage === "dashboard" && (
          <h1 className="text-3xl font-bold">Dashboard Home</h1>
        )}

        {activePage === "EmployeePanel" && <LeaveManagementPage />}
        {activePage === "rockstar" && <RockstarShift/>}
        {activePage === "MonthlyCalendar" && <MonthlyCalendar/>}
        {activePage === "Add" && <Add/>}
        {activePage === "EmployeeAddToRockstarPage" && <EmployeeAddToRockstarPage/>}
        {activePage === "PayrollDashboard" && <PayrollDashboard />}

        
      

      </div>
    </div>
  );
}
