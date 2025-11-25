import React, { useState, useEffect } from "react";
import axios from "axios";
import "../componentsCss/CheckInOut.css";
import { useNavigate } from "react-router-dom";

export default function CheckInOut() {
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // ✅ Get employeeId from localStorage
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    console.log("Employee ID from localStorage:", employeeId);
    fetchAttendance();
  }, [employeeId]);

  // 🔹 Auto update current time every second
  // ⏱️ Update current time only when checked in
  useEffect(() => {
    let timer;
    if (isCheckedIn) {
      timer = setInterval(() => setCurrentDate(new Date()), 1000);
    } else {
      // When checked out, freeze the time at checkout moment
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn]);

  const formatTime = (date) => {
    if (!date) return "--:--:--";
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // ✅ Fetch attendance history and today's status
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:9000/api/employee/getAttendance", {
        employeeId,
      });

      if (res.data.success) {
        setRecords(res.data.attendance);

        // Check if there's an attendance record for today
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        const todayRecord = res.data.attendance.find(
          (record) => record.dateKey === today
        );

        if (todayRecord) {
          setTodayAttendance(todayRecord);
          setIsCheckedIn(todayRecord.checkIn && !todayRecord.checkOut);
          setCheckInTime(todayRecord.checkIn);
          setCheckOutTime(todayRecord.checkOut);
        } else {
          setTodayAttendance(null);
          setIsCheckedIn(false);
          setCheckInTime(null);
          setCheckOutTime(null);
        }
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
      const res = await axios.post("http://localhost:9000/api/employee/checkin", {
        employeeId,
      });

      if (res.data.success) {
        alert("✅ Check-in successful");
        setIsCheckedIn(true);
        setCheckInTime(res.data.attendance.checkIn);
        setCheckOutTime(null);
        await fetchAttendance(); // Refresh data
      } else {
        alert(res.data.message || "Check-in failed");
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
      const res = await axios.post("http://localhost:9000/api/employee/checkout", {
        employeeId,
      });

      if (res.data.success) {
        alert("✅ Check-out successful");
        setIsCheckedIn(false);
        setCheckOutTime(res.data.attendance.checkOut);
        await fetchAttendance(); // Refresh data
      } else {
        alert(res.data.message || "Check-out failed");
      }
    } catch (err) {
      console.error("Check-out error:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong during check-out.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkinout-container">
      {/* 🔹 Attendance Tracker Card */}
      <div className="card">
        <div className="card-header">
          <h2>Attendance Tracker</h2>
          <p>{formatDate(currentDate)}</p>
          <div className="btn" onClick={() => navigate("/LeaveRequest")}>
            Leave Request
          </div>
        </div>

        <div className="card-content">
          <div className="time-section">
            <div className="time-info">
              <div className="clock-icon">🕒</div>
              <div>
                <p className="label">Current Time</p>
                <p className="current-time">
                  {isCheckedIn ? formatTime(currentDate) : checkOutTime ? formatTime(checkOutTime) : "--:--:--"}
                </p>

              </div>
            </div>
            <div className={`status-badge ${isCheckedIn ? "in" : "out"}`}>
              {isCheckedIn ? "Checked In" : "Checked Out"}
            </div>
          </div>

          <div className="time-grid">
            <div className="time-card">
              <p className="label">Check-In Time</p>
              <p className="time-value">{formatTime(checkInTime)}</p>
            </div>
            <div className="time-card">
              <p className="label">Check-Out Time</p>
              <p className="time-value">{formatTime(checkOutTime)}</p>
            </div>
          </div>

          <div className="button-row">
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn || loading}
              className="btn btn-primary"
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

      {/* 🔹 Attendance History */}
      <div className="card">
        <div className="card-header">
          <h2>Attendance History</h2>
          <p>Your recent check-in and check-out records</p>
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
            <table className="history-table">
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
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{formatTime(r.checkIn)}</td>
                    <td>{formatTime(r.checkOut)}</td>
                    <td>{r.totalHours || "--"}</td>
                    <td>
                      <span className={`status-badge-table ${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}