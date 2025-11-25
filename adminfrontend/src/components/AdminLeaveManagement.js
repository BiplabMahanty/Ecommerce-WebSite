import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Eye, Users } from "lucide-react";
import "../componentsCss/AdminLeaveManagement.css";
import { useNavigate } from "react-router-dom";

export default function AdminLeaveManagement() {
    const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminComment, setAdminComment] = useState("");

  const adminId = localStorage.getItem("adminId"); // Assuming stored on login

  // ✅ Fetch all leave requests
  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/admin/getLeaveRequests");
      if (res.data.success) {
        setRequests(res.data.leave || res.data.requests || res.data.leaveRequests || []);
      } else {
        setRequests([]);
      }
    

    } catch (err) {
      console.error(err);
      alert("Failed to fetch leave requests");
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "badge approved";
      case "rejected":
        return "badge rejected";
      default:
        return "badge pending";
    }
  };

  const calculateDays = (start, end) => {
    const diff = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleViewDetails = (req) => {
    setSelectedRequest(req);
    setIsDialogOpen(true);
  };
  console.log("test", adminId)
  // ✅ Approve or Reject Leave Request
  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await axios.post("http://localhost:9000/api/admin/verifyLeaveRequest", {
        leaveId:id,
        adminId,
        status,
        comment: adminComment,
      });

      if (res.data.success) {
        alert(`Leave ${status} successfully!`);
        setIsDialogOpen(false);
        setAdminComment("");
        fetchLeaveRequests(); // refresh data
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update leave status");
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const rejected = requests.filter((r) => r.status === "rejected");

  return (
    <div className="admin-leave-container">
      <div className="summary-grid">
        <div className="summary-card yellow">
          <div><p>Pending Requests</p><h2>{pending.length}</h2></div>
          <Users className="icon yellow-icon" />
        </div>
        <div className="summary-card green">
          <div><p>Approved</p><h2>{approved.length}</h2></div>
          <Check className="icon green-icon" />
        </div>
        <div className="summary-card red">
          <div><p>Rejected</p><h2>{rejected.length}</h2></div>
          <X className="icon red-icon" />
        </div>
      </div>

      <div className="table-card">
        <h3>All Leave Requests</h3>
        {requests.length === 0 ? (
          <div className="empty">
            <Users className="empty-icon" />
            <p>No leave requests yet.</p>
          </div>
        ) : (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{req.employeeId?.name || "N/A"}</td>
                  <td className="capitalize">{req.type}</td>
                  <td>{new Date(req.startDate).toLocaleDateString()}</td>
                  <td>{new Date(req.endDate).toLocaleDateString()}</td>
                  <td>{calculateDays(req.startDate, req.endDate)}</td>
                  <td><span className={getStatusClass(req.status)}>{req.status}</span></td>
                  <td>
                    <button className="btn outline" onClick={() => handleViewDetails(req)}>
                      <Eye size={16} />
                    </button>
                    {req.status === "pending" && (
                      <>
                        <button className="btn success" onClick={() => updateLeaveStatus(req._id, "approved")}>
                          <Check size={16} />
                        </button>
                        <button className="btn danger" onClick={() => updateLeaveStatus(req._id, "rejected")}>
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog */}
      {isDialogOpen && selectedRequest && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Leave Request Details</h3>
           
            <p><strong>Employee:</strong> {selectedRequest.employeeId?.name}</p>
            <p><strong>Type:</strong> {selectedRequest.type}</p>
            <p><strong>Start:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason}</p>

            {selectedRequest.status === "pending" && (
              <>
                <textarea
                  placeholder="Add comment (optional)"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
                <div className="dialog-footer">
                  <button className="btn outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
                  <button className="btn danger" onClick={() => updateLeaveStatus(selectedRequest._id, "rejected")}>Reject</button>
                  <button className="btn success" onClick={() => updateLeaveStatus(selectedRequest._id, "approved")}>Approve</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
