import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
export default function LeaveRequestPage() {
  


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


  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Leave Request</h2>

      {/* Leave Form */}
      <div className="bg-white p-8 rounded-2xl shadow-md mb-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leave Type */}
          <div>
            <label className="block mb-2 font-medium">Select Leave Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)} required
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Select Type</option>
            <option value="casual">Casual</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency</option>
            <option value="other">Other</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block mb-2 font-medium">Start Date</label>
            <input
              type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block mb-2 font-medium">End Date</label>
            <input
              type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Reason</label>
            <textarea
              value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason"
              rows="3"
              className="w-full p-3 border rounded-xl"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-xl text-lg shadow-md"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>

      {/* Requests Table */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold mb-6">Leave History</h3>
    {requests.length > 0 ? (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">TYPE</th>
              <th className="p-3 border">Start</th>
              <th className="p-3 border">End</th>
              <th className="p-3 border">Reason</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req, index) => (
              <tr key={index} className={(index % 2 === 0 ? "bg-gray-50" : "") + " hover:bg-blue-50 transition cursor-pointer"}>
                <td className="p-3 border">{req.type}</td>
                <td className="p-3 border">{new Date(req.startDate).toLocaleDateString()}</td>
                <td className="p-3 border">{new Date(req.endDate).toLocaleDateString()}</td>
                <td className="p-3 border">{req.reason}</td>
                <td className="p-3 border font-semibold">
                  {req.status === "approved" && (
                    <span className="text-green-600">Approved</span>
                  )}
                  {req.status === "pending" && (
                    <span className="text-yellow-600">Pending</span>
                  )}
                  {req.status === "rejected" && (
                    <span className="text-red-600">Rejected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
            <p>No leave requests found.</p>
        )}
      </div>
    </div>
  );
}
