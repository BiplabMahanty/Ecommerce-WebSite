  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import "../componentsCss/CheckInOut.css";
  import { useNavigate } from "react-router-dom";
  import { LogIn, LogOut, Clock, Calendar, User } from "lucide-react";

  export default function CheckInOut() {
    const navigate = useNavigate();
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [records, setRecords] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState(null);
    console.log("Today Attendance:", todayAttendance);
    console.log("Is Checked In:", isCheckedIn);
    console.log("Check-In Time:", checkInTime);
    console.log("Check-Out Time:", checkOutTime);
    console.log("Attendance Records:", records);

    // ✅ Get employeeId from localStorage
    const employeeId = localStorage.getItem("employeeId");
    console.log("Employee ID:", employeeId);

    useEffect(() => {
      if (!employeeId) {
        alert("Please login first");
        navigate("/login");
        return;
      }
      console.log("Employee ID from localStorage:", employeeId);
      fetchAttendance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    // 🔹 Auto update current time every second while checked in
    useEffect(() => {
      let timer;
      if (isCheckedIn) {
        timer = setInterval(() => setCurrentDate(new Date()), 1000);
      }
      return () => clearInterval(timer);
    }, [isCheckedIn]);

    const formatTime = (date) => {
      if (!date) return "--:--:--";
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleTimeString( {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    };
    console.log("Formatted Time:", formatTime(new Date()));
    const formatDate = (date) =>
      date.toLocaleDateString( {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    // ✅ Fetch attendance history and today's status
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          "http://localhost:9000/api/employee/getAttendance",
          { employeeId }
        );

        if (res.data && res.data.success) {
          setRecords(res.data.attendance || []);

          console.log("Attendance Records:>>>>", res.data.attendance);
          console.log(setRecords);

          // Determine today's record using dateKey (IST)
          const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });
          const todayRecord = (res.data.attendance || []).find(
            (record) => record.dateKey === today
          );

          if (todayRecord) {
            setTodayAttendance(todayRecord);
            setIsCheckedIn(Boolean(todayRecord.checkIn && !todayRecord.checkOut));
            setCheckInTime(todayRecord.checkIn || null);
            setCheckOutTime(todayRecord.checkOut || null);
          } else {
            setTodayAttendance(null);
            setIsCheckedIn(false);
            setCheckInTime(null);
            setCheckOutTime(null);
          }
        } else {
          console.warn("getAttendance returned no success:", res.data);
          setRecords([]);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        alert("Error fetching attendance records");
      } finally {
        setLoading(false);
      }
    };

    // ✅ Handle Check-In
    const handleCheckIn = async () => {
      try {
        setLoading(true);
        // NOTE: backend expects /checkIn (camelCase)
        const res = await axios.post("http://localhost:9000/api/employee/checkIn", {
          employeeId,
        });

        if (res.data && res.data.success) {
          alert("✅ Check-in successful");
          const checkInVal = res.data.attendance?.checkIn || null;
          console.log("Check-in time from response:", checkInVal);
          setIsCheckedIn(true);
          setCheckInTime(checkInVal);
          setCheckOutTime(null);
          await fetchAttendance(); // Refresh data
        } else {
          alert(res.data?.message || "Check-in failed");
        }
      } catch (err) {
        console.error("Check-in error:", err);
        const errorMsg = err.response?.data?.message || "Something went wrong during check-in.";
        alert(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    // ✅ Handle Check-Out
    const handleCheckOut = async () => {
      try {
        setLoading(true);
        // NOTE: backend expects /checkOut (camelCase)
        const res = await axios.post("http://localhost:9000/api/employee/checkOut", {
          employeeId,
        });

        if (res.data && res.data.success) {
          alert("✅ Check-out successful");
          const checkOutVal = res.data.attendance?.checkOut || null;
          setIsCheckedIn(false);
          setCheckOutTime(checkOutVal);
          await fetchAttendance(); // Refresh data
        } else {
          alert(res.data?.message || "Check-out failed");
        }
      } catch (err) {
        console.error("Check-out error:", err);
        const errorMsg = err.response?.data?.message || "Something went wrong during check-out.";
        alert(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    // --- Design (kept exactly as you requested) ---
    return (
      <div className="flex min-h-screen bg-[#E8F0F8]">
        {/* SIDEBAR */}
        

        {/* MAIN CONTENT */}
        <main className="flex-1 p-10">
          <h2 className="text-2xl font-bold mb-8">Employee Attendance Panel</h2>

          {/* Check In / Check Out Card */}
          <div className="bg-white p-8 rounded-2xl shadow-md mb-10">
            <h3 className="text-xl font-semibold mb-6">Check In / Check Out</h3>

            <div className="card-content">
              <div className="time-section">
                <div className="time-info">
                  <div className="clock-icon">🕒</div>
                  <div>
                    <p className="label">Current Time</p>
                    <p className="current-time">
                      {isCheckedIn
                        ? formatTime(new Date())
                        : new Date()
                        ? formatTime(checkOutTime)
                        : "--:--:--"}
                    </p>
                  </div>
                </div>
                <div className={`status-badge ${isCheckedIn ? "in" : "out"}`}>
                  {isCheckedIn ? "Checked In" : "Checked Out"}
                </div>
              </div>

              <div className="time-grid mt-6">
                <div className="time-card">
                  <p className="label">Check-In Time</p>
                  <p className="time-value">{formatTime(new Date())}</p>
                </div>
                <div className="time-card">
                  <p className="label">Check-Out Time</p>
                  <p className="time-value">{formatTime(new Date())}</p>
                </div>
              </div>

              <div className="button-row mt-6">
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn || loading}
                  className="btn btn-primary "
                >
                  {loading ? "⏳ Processing..." : "✅ Check In"}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn || loading}
                  className="btn btn-outline"
                >
                  {loading ? "⏳ Processing..." : "🚪 Check Out"}
                </button>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="card bg-white p-8 rounded-2xl shadow-md overflow-auto max-h-[400px]">
            <div className="card-header mb-4">
              <h3 className="text-xl font-semibold mb-2">Attendance History</h3>
              <p className="text-sm text-gray-500">Your recent check-in and check-out records</p>
            </div>

            <div className="card-content">
              {loading && records.length === 0 ? (
                <p className="loading">Loading attendance...</p>
              ) : records.length === 0 ? (
                <div className="empty-state">
                  <div className="clock-large">🕓</div>
                  <p>No attendance records yet</p>
                  <span>Check in to start tracking your attendance</span>
                </div>
              ) : (
              <table className="history-table w-full border-collapse text-left">
    <thead>
      <tr>
        <th>Date</th>
        <th>Check-In</th>
        <th>Check-Out</th>
        <th>Total Hours</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {records.map((r, idx) => (
        <tr key={r._id || idx}>
          <td>{r.dateKey}</td>
          <td>{(r.checkIn)}</td>
          <td>{(r.checkOut)}</td>
          <td>{r.totalHours || "--"}</td>

          <td>
            <span className={`status-badge-table ${r.status || ""}`}>
              {r.status || "-"}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

              )}
            </div>
          </div>
        </main>
      </div>
    );
  }
