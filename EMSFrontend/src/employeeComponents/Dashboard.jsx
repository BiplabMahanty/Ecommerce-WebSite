import React, { useState, useEffect } from "react";
import { Clock, Calendar, CheckCircle, BarChart3, Sun, Timer, User } from "lucide-react";
import { errorToast,successToast } from "../utils/toastMessage";

export default function DashboardPage() {
  const [leave, setLeave] = useState([]);
  const [loading, setLoading] = useState(false);

  const employeeId = localStorage.getItem("employeeId");
  const employee = JSON.parse(localStorage.getItem("employeeInfo"));
  console.log("emp",employee) // store during login

  // PROFILE POPUP STATE
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:9000/api/employee/getLeaveTotal/${employeeId}`);
      if (res.data.success) {
        setLeave((res.data.leave || [])[0] || { total: 0 });
      } else generateError("Failed to load leave");
    } catch (error) {
      console.error("Error fetching leave:", error);
      errorToast("Failed to load leave");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/employee"; // redirect to login
  };

  return (
    <div className="relative p-8 space-y-10">

      {/* TOP LEFT LOGO + PROFILE */}
      <div className="flex justify-between items-center mb-10">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src="/logo192.png" 
            className="w-12 h-12 rounded-full border"
            alt="Logo"
          />
          <h2 className="text-2xl font-bold">#######</h2>
        </div>

        {/* PROFILE BUTTON */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-xl"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <User size={30} className="text-gray-700" />
          <span className="text-lg font-semibold">{employee.name}</span>
        </div>
      </div>

      {/* PROFILE POPUP */}
      {profileOpen && (
        <div className="absolute right-10 top-20 bg-white shadow-lg rounded-xl p-6 w-64 z-50 border">

          <h3 className="text-xl font-bold mb-4">Profile Details</h3>

          <p className="text-gray-700">
            <strong>Name:</strong> {employee.name}
          </p>

          <p className="text-gray-700 mt-2">
            <strong>ID:</strong> {employeeId}
          </p>

          <button
            onClick={() => (window.location.href = "/change-password")}
            className="w-full mt-5 bg-blue-600 text-white py-2 rounded-lg"
          >
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg"
          >
            Log Out
          </button>
        </div>
      )}

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Today's Check In/Out */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4">
            <CheckCircle size={42} />
            <div>
              <h3 className="text-xl font-semibold">Today’s Check-in/out</h3>
              <p className="text-lg mt-1">Check-In: 09:10 AM</p>
              <p className="text-lg">Check-Out: --</p>
            </div>
          </div>
        </div>

        {/* Total Working Hours */}
        <div className="bg-gradient-to-r from-green-100 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4">
            <Clock size={42} />
            <div>
              <h3 className="text-xl font-semibold">Total Working Hours</h3>
              <p className="text-lg mt-1">4h 20m</p>
            </div>
          </div>
        </div>

        {/* Monthly Attendance */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4">
            <BarChart3 size={42} />
            <div>
              <h3 className="text-xl font-semibold">Monthly Attendance</h3>
              <p className="text-lg mt-1">86% Present</p>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-gradient-to-r from-red-100 to-red-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4">
            <Calendar size={42} />
            <div>
              <h3 className="text-xl font-semibold">Leave Balance</h3>
              <p className="text-lg mt-1">{leave.leave} Days Left</p>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-gradient-to-r from-orange-100 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4">
            <Sun size={42} />
            <div>
              <h3 className="text-xl font-semibold">Upcoming Holiday</h3>
              <p className="text-lg mt-1">Republic Day - Jan 26</p>
            </div>
          </div>
        </div>

        {/* Today's Shift Time */}
        <div className="bg-gradient-to-r from-teal-100 to-teal-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4">
            <Timer size={42} />
            <div>
              <h3 className="text-xl font-semibold">Today’s Shift Time</h3>
              <p className="text-lg mt-1">9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
