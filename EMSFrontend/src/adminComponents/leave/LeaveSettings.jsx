// adminfrontend/src/adminComponents/leave/LeaveSettings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { successToast, errorToast } from "../../utils/toastMessage";

export default function LeaveSettings() {
  const [department, setDepartment] = useState("it department");
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
const token = localStorage.getItem("adminToken");
  console.log("Admin Token in LeaveLayout:", token);
  const adminId = localStorage.getItem("adminId");
  // const departments = ["HR", "it department", "Finance", "Support"];
  const [departments, setDepartments] = useState([]);

  console.log("departments", departments);
   useEffect(() => {
      fetchAllDepartments();
    }, []);
  
    const fetchAllDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:9000/api/admin/getAllDepartments",{ headers: {
            Authorization: `Bearer ${token}`
          }}  );
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error("Error loading employees", err);
      }
    };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:9000/api/admin/department/${department}`,{ headers: {
          Authorization: `Bearer ${token}`
        } } 
      );
      if (res.data.success) setLeaveData(res.data.leaves);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [department]);

  const handleVerify = async (leaveId, status) => {
    const res = await axios.post(
      "http://localhost:9000/api/admin/verifyLeaveRequest",
      { leaveId, adminId, status, comment: "" },{ headers: {
          Authorization: `Bearer ${token}`
        } }
    );
    if (res.data.success) {
      successToast(`Leave ${status}`);
      fetchLeaves();
    }
  };

  const handleEditStatus = async (leaveId, status) => {
    const res = await axios.post(
      "http://localhost:9000/api/admin/editLeaveRequest",
      { leaveId, adminId, status, comment: "" },{ headers: {
          Authorization: `Bearer ${token}`
        } }
    );
    if (res.data.success) {
      successToast("Updated");
      setShowEditModal(false);
      fetchLeaves();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Department Selector */}
      <div className="mb-6 flex gap-4">
        <label className="font-semibold">Select Department</label>
        <select
          className="w-60 px-4 py-2 border rounded-lg"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          {departments.map((def) => (
            <option key={def._id}>{def}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && leaveData.length > 0 && (
        <table className="w-full border-collapse">
          <thead className="bg-[#0f2340] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Employee Name</th>
                      <th className="px-4 py-3 text-left">Leave Type</th>
                      <th className="px-4 py-3 text-left">Start</th>
                      <th className="px-4 py-3 text-left">End</th>
                      <th className="px-4 py-3 text-left">Want Leave</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

            <tbody>
                    {leaveData.map((row) => (
                      <tr key={row._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{row.employeeId?.name}</td>
                        <td className="px-4 py-3 capitalize">{row.type}</td>
                        <td className="px-4 py-3">
                          {new Date(row.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(row.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{row.wantLeave}</td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded text-white ${row.status === "pending"
                              ? "bg-yellow-500"
                              : row.status === "approved"
                                ? "bg-green-600"
                                : "bg-red-600"
                              }`}
                          >
                            {row.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3 flex gap-2 relative">
                          {row.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleVerify(row._id, "approved")}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerify(row._id, "rejected")}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedRow(row);  // <-- save selected row
                                setShowEditModal(true); // <-- open modal
                              }}
                              className="px-3 py-1 bg-gray-300 text-black rounded-lg"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                        {showEditModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-5 rounded-xl shadow-lg w-80">
                              <h2 className="text-xl font-semibold mb-4">Edit Leave Status</h2>

                              <button
                                onClick={() => handleEditStatus(selectedRow._id, "approved")}
                                className="block w-full text-left px-3 py-2 mb-1 rounded-lg hover:bg-green-100"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleEditStatus(selectedRow._id, "rejected")}
                                className="block w-full text-left px-3 py-2 mb-1 rounded-lg hover:bg-red-100"
                              >
                                Reject
                              </button>

                              <button
                                onClick={() => handleEditStatus(selectedRow._id, "pending")}
                                className="block w-full text-left px-3 py-2 mb-3 rounded-lg hover:bg-yellow-100"
                              >
                                Pending
                              </button>

                              <button
                                onClick={() => setShowEditModal(false)}
                                className="w-full bg-gray-300 text-black py-2 rounded-lg"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}


                      </tr>
                    ))}
                  </tbody>
        </table>
      )}

      
    
    </div>
  );
}
 