import React, { useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { Clock, Calendar, User } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const Admin = JSON.parse(localStorage.getItem("adminInfo"));

  const linkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 p-3 rounded-lg ${
      isActive ? "bg-yellow-500 text-black" : "hover:bg-white/10"
    }`;

  return (
    <div className="flex min-h-screen bg-[#E8F0F8]">
      
      {/* SIDEBAR (ALWAYS VISIBLE) */}
      <aside className="w-64 bg-[#0A1D3A] text-white p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
          <div>
            <h1 className="text-lg font-semibold">{Admin?.name}</h1>
            <p className="text-sm opacity-70">{Admin?.role}</p>
          </div>
        </div>

        <nav className="space-y-3">
          <NavLink to="/admin/dashboard" end className={linkClass}>
            <User size={18} /> Dashboard
          </NavLink>

          <NavLink to="/admin/attendance" className={linkClass}>
            <Clock size={18} /> Leave
          </NavLink>

          <NavLink to="/admin/rockstar" className={linkClass}>
            <Calendar size={18} /> Rockstar Shift
          </NavLink>

          <NavLink to="/admin/add-shift" className={linkClass}>
            <Calendar size={18} /> Add Shift
          </NavLink>

          <NavLink to="/admin/payroll" className={linkClass}>
            <Calendar size={18} /> Payroll
          </NavLink>

          <NavLink to="/admin/payment" className={linkClass}>
            <Calendar size={18} /> Payment
          </NavLink>
          <NavLink to="/admin/add-employee-rockstar" className={linkClass}>
            <Calendar size={18} /> EmployeeAddToRockstarPage
          </NavLink>
          <NavLink to="/admin/allowances" className={linkClass}>
            <Calendar size={18} /> AllowancesPage
          </NavLink>
          <NavLink to="/admin/add-employee" className={linkClass}>
            <Calendar size={18} /> add-employee
          </NavLink>
          <NavLink to="/admin/Logout" className={linkClass}>
            <Calendar size={18} /> Logout
          </NavLink>
        </nav>
      </aside>

      {/* MAIN CONTENT (CHANGES, SIDEBAR STAYS) */}
      <main className="flex-1 p-5 overflow-y-auto">
        <Outlet/>
      </main>
    </div>
  );
}
