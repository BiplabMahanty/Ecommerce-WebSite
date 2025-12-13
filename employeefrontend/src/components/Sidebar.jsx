import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Clock, Calendar, User } from "lucide-react";
import axios from "axios";

export default function Sidebar() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employeeInfo"));
  const employeeId = localStorage.getItem("employeeId");

  const [employeeData, setEmployeeData] = useState(null);
  const [photo, setPhoto] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) navigate("/login");

    fetchEmployeeDetails();
  }, [navigate]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/employee/getEmployee/${employeeId}`
      );
      if (res.data?.success) {
        setEmployeeData(res.data.employee);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const imageURL = employeeData?.employeeImage
    ? `http://localhost:9000${employeeData.employeeImage}`
    : null;

  const linkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 p-3 rounded-lg ${
      isActive ? "bg-yellow-500 text-black" : "hover:bg-white/10"
    }`;

  return (
    <div className="flex min-h-screen bg-[#E8F0F8]">

      {/* IMAGE MODAL */}
      {photo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPhoto(false)}
        >
          <div className="w-80 h-80 rounded-full overflow-hidden bg-gray-200">
            <img src={imageURL} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A1D3A] text-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            {imageURL ? (
              <img
                src={imageURL}
                className="w-12 h-12 rounded-full object-cover border"
                onClick={() => setPhoto(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300" />
            )}

            <div>
              <h1 className="text-lg font-semibold">{employee?.name}</h1>
              <p className="text-sm opacity-70">{employee?.position}</p>
            </div>
          </div>

          <nav className="space-y-4">
            <NavLink to="/employee" end className={linkClass}>
              <User size={18} /> Dashboard
            </NavLink>

            <NavLink to="/employee/attendance" className={linkClass}>
              <Clock size={18} /> Attendance
            </NavLink>

            <NavLink to="/employee/leave" className={linkClass}>
              <Calendar size={18} /> Leave
            </NavLink>

            <NavLink to="/employee/attendance-details" className={linkClass}>
              <Calendar size={18} /> Attendance Details
            </NavLink>

            <NavLink to="/employee/logout" className={linkClass}>
              Logout
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
