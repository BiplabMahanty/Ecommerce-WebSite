import React, { useState, useEffect } from "react";
import axios from "axios";
import "../componentsCss/LeaveRequest.css";
import { Link,useNavigate } from "react-router-dom";


const LeaveRequest = () => {
  const navigate = useNavigate();
    
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState([]);

  // ✅ Example: employeeId stored in localStorage after login
  const employeeId = localStorage.getItem("employeeId");

  

  useEffect(() => {
    if (!employeeId) {
      alert("Please login first");
      window.location.href = "/login";
    } else {
      fetchLeaveRequests();
    }
  }, [employeeId]);

  // ✅ Fetch all leave requests for logged-in employee
  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.post("http://localhost:9000/api/employee/getLeaveRequest", {
        employeeId,
      });
      if (res.data.success) {
        setRequests(res.data.leave || []);
      } else {
        alert(res.data.message || "Failed to load leave requests");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching leave requests");
    }
  };

  // ✅ Submit new leave request
   const handleSubmit = async (e) => {
  e.preventDefault();

  if (!type || !startDate || !endDate || !reason) {
    return alert("Please fill all fields");
  }

  try {
    const res = await axios.post("http://localhost:9000/api/employee/leaveRequest", {
      employeeId,
      type,
      startDate,
      endDate,
      reason,
    });

    if (res.data.success) {
      alert("Leave request submitted successfully!");

      // ✅ Reset input fields
      setType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaveRequests();
      
      // ✅ Instantly update UI (add new request to the table)
      const newRequest = {
        type,
        startDate,
        endDate,
        reason,
        status: "pending", // default until admin updates
      };
      setRequests((prev) => [newRequest, ...prev]);
    } else {
      alert(res.data.message || "Failed to submit leave request");
    }
  } catch (error) {
    console.error(error);
    alert("Server error while submitting leave request");
  }
};

    const hh="<<=CheckInOut<<="
  return (
    <div className="leave-request-container">
      <h2>Leave Request Form</h2>
      <div className="btn" onClick={() => navigate("/checkInOut")}>
            {hh}
          </div>

      {/* Leave Request Form */}
      <form className="leave-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Leave Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Type</option>
            <option value="casual">Casual</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Reason:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason"
            required
          />
        </div>
 {/*onClick={() => navigate("/LeaveRequest")*/}
        <button type="submit" className="submit-btn">
          Submit request
        </button>
      </form>

      {/* Leave History Table */}
      <h3>Your Leave Requests</h3>
      {requests.length > 0 ? (
        <table className="leave-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr key={index}>
                <td>{req.type}</td>
                <td>{new Date(req.startDate).toLocaleDateString()}</td>
                <td>{new Date(req.endDate).toLocaleDateString()}</td>
                <td>{req.reason}</td>
                <td
                  className={
                    req.status === "approved"
                      ? "status-approved"
                      : req.status === "rejected"
                      ? "status-rejected"
                      : "status-pending"
                  }
                >
                  {req.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No leave requests found.</p>
      )}
    </div>
  );
};

export default LeaveRequest;
