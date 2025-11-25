import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("default");
  const [department, setDepartment] = useState("IT");
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const adminId = localStorage.getItem("adminId");

  const departments = ["HR", "it department", "Finance", "Support"];

  // ======================================================
  // 🔥 Fetch Leave Requests by Department
  // ======================================================
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const dep = department; // backend expects lowercase

      const res = await axios.get(
        `http://localhost:9000/api/admin/department/${dep}`
      );

      if (res.data.success) {
        setLeaveData(res.data.leaves);
      }
    } catch (err) {
      console.error("Error fetching leaves", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Leave Settings") fetchLeaves();
  }, [activeTab, department]);

  // ======================================================
  // 🔥 Approve / Reject Leave
  // ======================================================
  const handleVerify = async (leaveId, status) => {
    try {
      // Replace with real admin ID if needed

      const res = await axios.post(
        "http://localhost:9000/api/admin/verifyLeaveRequest",
        { leaveId, adminId, status, comment: "" }
      );

      if (res.data.success) {
        alert(`Leave ${status} successfully!`);
        fetchLeaves();
      }
    } catch (err) {
      console.error("Verification failed", err);
      alert("Error updating leave status!");
    }
  };

  const handleEditStatus = async (leaveId, newStatus) => {
    try {

      const res = await axios.post("http://localhost:9000/api/admin/editLeaveRequest", {
        leaveId,
        adminId,
        status: newStatus,
        comment: ""
      });

      if (res.data.success) {
        alert(`Leave updated to ${newStatus}!`);
        setOpenDropdownId(null); // close dropdown
        fetchLeaves(); // refresh
      }
    } catch (error) {
      console.error("Error editing leave:", error);
      alert("Error updating leave request!");
    }
  };


  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}


      {/* MAIN */}
      <main className="flex-1 p-8">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-md bg-transparent text-2xl">☰</button>

            <div className="bg-white rounded-full flex items-center overflow-hidden shadow-md">
              <select className="px-4 py-3 outline-none bg-transparent">
                <option>All Candidates</option>
              </select>
              <input className="px-4 py-3 w-96 outline-none" placeholder="Search..." />
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <rect x="2" y="3" width="20" height="18" rx="2" fill="#0f2340" />
          </svg>
          <h2 className="text-2xl font-bold">Leave Management</h2>
        </div>

        {/* Buttons */}
        <div className="flex gap-6 mb-8">
          {["Leave Settings", "Leave Recall", "Leave History", "Relief Officers"].map((b) => (
            <button
              key={b}
              onClick={() => setActiveTab(b)}
              className={`${activeTab === b ? "bg-yellow-500 text-black" : "bg-[#213c93] text-white"
                } rounded-xl px-8 py-3 shadow-md hover:opacity-90`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* ------------------------- LEAVE SETTINGS VIEW ------------------------ */}
        {activeTab === "Leave Settings" && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            {/* Department Selector */}
            <div className="mb-6 text-sm font-medium justify-between flex items-left gap-4">
              <label className="block text-sm font-semibold mb-2">Select Department</label>
              <select
                className="w-60 px-4 py-2 border rounded-lg shadow-sm justify-between flex items-right gap-4"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((dep) => (
                  <option key={dep}>{dep}</option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {loading && <p className="text-blue-600 font-semibold">Loading...</p>}

            {/* TABLE */}
            {!loading && leaveData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
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
              </div>
            )}

            {!loading && leaveData.length === 0 && (
              <p className="text-center text-gray-600 mt-5">
                No leave requests found for {department}.
              </p>
            )}
          </div>
        )}

        {/* ------------------------- DEFAULT BANNER ------------------------ */}
        {activeTab === "default" && (
          <div className="bg-[#1a2f78] rounded-2xl p-10 text-white shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-4xl font-extrabold">
                Manage <span className="text-yellow-400">ALL Leave Applications</span>
              </h3>
              <p className="mt-4 text-sm text-white/80">
                A relaxed employee is a performing employee.
              </p>
            </div>
          </div>
        )}

        <div className="h-40" />
      </main>
    </div>
  );
}
