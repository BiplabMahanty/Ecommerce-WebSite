import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../utils/toastMessage";

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("default");
  const [department, setDepartment] = useState("IT");
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [checkOutValues, setCheckOutValues] = useState({})

   const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [attendanceId, setAttendanceId] = useState(null);
  const [details, setDetails] = useState(null);

  const navigate = useNavigate();

  /* --------------------------
      1) GET ALL EMPLOYEES
  --------------------------- */
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/admin/getAllEmployee");
      if (res.data.success) {
        setEmployees(res.data.employee);
      }
    } catch (err) {
      console.error("Error loading employees", err);
    }
  };

  /* --------------------------
      2) WHEN EMPLOYEE SELECTED → LOAD ATTENDANCE
  --------------------------- */
  useEffect(() => {
    if (selectedEmployeeId) fetchAttendance();
  }, [selectedEmployeeId]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/admin/attendance/${selectedEmployeeId}`
      );

      if (res.data.success) {
        setAttendance(res.data.attendance);
        setEmployee(res.data.employee);
      }
    } catch (err) {
      console.error("Error loading attendance", err);
    }
  };

  /* --------------------------
      3) FETCH DETAILS WHEN ID SELECTED
  --------------------------- */
  useEffect(() => {
    if (attendanceId) fetchDetails();
  }, [attendanceId]);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/admin/attendance/details/${attendanceId}`
      );

      if (res.data.success) {
        setDetails(res.data.attendance);
      }
    } catch (err) {
      console.error("Error loading details", err);
    }
  };

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
        successToast(`Leave ${status} successfully!`);
        fetchLeaves();
      }
    } catch (err) {
      console.error("Verification failed", err);
      errorToast("Error updating leave status!");
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
        successToast(`Leave updated to ${newStatus}!`);
        setOpenDropdownId(null); // close dropdown
        fetchLeaves(); // refresh
      }
    } catch (error) {
      console.error("Error editing leave:", error);
      errorToast("Error updating leave request!");
    }
  };



  const handleEditCheckOut = async (Id, checkOutValue) => {
    const attId=Id;
    console.log("attendanceId",attId)
    console.log("checkOut",checkOutValue)
    console.log("selectedEmployeeId",selectedEmployeeId)
    try {

      const res = await axios.post("http://localhost:9000/api/admin/editCheckOut", {
        attendanceId:attId,
        checkOut:checkOutValue,
        employeeId:selectedEmployeeId,
        
      });

      if (res.data.success) {
        successToast(`checkOut Update !`);
       
      }
    } catch (error) {
      console.error("Error editing leave:", error);
      errorToast("Error updating leave request!");
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
        {activeTab === "Leave History" && <div>


        {!selectedEmployeeId && (
        <div className="p-6 w-full">
          <h1 className="text-3xl font-bold mb-6">📅 Attendance History</h1>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="p-3 border">Employee</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr
                    key={emp._id}
                    className={`hover:bg-blue-50 cursor-pointer ${idx % 2 === 0 ? "bg-gray-50" : ""
                      }`}
                    onClick={() => setSelectedEmployeeId(emp._id)}
                  >
                    <td className="p-3 border font-semibold">{emp.name}</td>
                    <td className="p-3 border">{emp.email}</td>
                    <td className="p-3 border text-blue-600 underline">
                      View Attendance
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {selectedEmployeeId && (
          <>
            <button
              className="mb-4 text-blue-600 underline"
              onClick={() => {
                setSelectedEmployeeId(null);
                setAttendance([]);
                setEmployee(null);
              }}
            >
              ← Back
            </button>

            {/* Employee Heading */}
            {employee && (
              <h2 className="text-2xl font-bold mb-4">
                Attendance for {employee.name}
              </h2>
            )}

            {/* ---------------------------------------------------------------------
              PAGE 2: ATTENDANCE LIST OF SELECTED EMPLOYEE
          --------------------------------------------------------------------- */}
            {!attendanceId && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border overflow-x-auto">
                <table className="w-full min-w-max border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 border">Date</th>
                      <th className="p-3 border">Check In</th>
                      <th className="p-3 border">Check Out</th>
                      <th className="p-3 border">Status</th>
                      <th className="p-3 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, idx) => (
                      <tr
                        key={a._id}
                        className={`hover:bg-blue-50 cursor-pointer ${idx % 2 === 0 ? "bg-gray-50" : ""
                          }`}
                        
                      >
                        <td className="p-3 border" onClick={() => setAttendanceId(a._id)}>{a.dateKey}</td>
                        <td className="p-3 border" onClick={() => setAttendanceId(a._id)}>
                          {a.checkIn
                            ? new Date(a.checkIn).toLocaleTimeString()
                            : "--"}
                        </td>
                        <td className="p-3 border">
                          {a.checkOut
                            ? new Date(a.checkOut).toLocaleTimeString() 
                            : <input
                               
                                 type="text"
                                 value={checkOutValues[a._id] || ""}
                                 placeholder="example 12:50"
                                 onChange={(e) => setCheckOutValues(prev => ({ ...prev, [a._id]: e.target.value }))}
                                 onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                     handleEditCheckOut(a._id, checkOutValues[a._id]);
                                   }
                                 }}
                                 className="text-center placeholder:text-center border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                          }
                        </td>
                        <td className="p-3 border capitalize" onClick={() => setAttendanceId(a._id)}>{a.status}</td>
                        <td className="p-3 border text-blue-600 underline" onClick={() => setAttendanceId(a._id)}>
                          View Details
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}


            {attendanceId && (
              <div className="p-6">
                <button
                  className="mb-4 text-blue-600 underline"
                  onClick={() => {
                    setAttendanceId(null);
                    setDetails(null);
                  }}
                >
                  ← Back
                </button>

                {!details ? (
                  <p className="text-lg">Loading details...</p>
                ) : (
                  <div className="bg-white p-6 rounded-2xl shadow-xl border w-full md:w-2/3 mx-auto">
                    <h2 className="text-2xl font-bold mb-4">
                      Attendance Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Date:</span> {details.dateKey}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Check In:</span>
                          {details.checkIn ? new Date(details.checkIn).toLocaleTimeString() : "--"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Check Out:</span>
                          {details.checkOut ? new Date(details.checkOut).toLocaleTimeString() : "--"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Total Hours:</span> {details.totalHours}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Status:</span> {details.status}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Late By:</span> {details.lateBy || "NA"}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Overtime:</span> {details.overTime || "NA"}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Check-In Address:</span> {details.checkInAddress || "NA"}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Check-Out Address:</span> {details.checkOutAddress || "NA"}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border">
                        <p><span className="font-semibold text-gray-600">Shift:</span> {details.shift?.shiftName || "N/A"}</p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </>
        )}      </div>}
        {activeTab === "default" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Leave Management Dashboard</h2>
            <p className="text-gray-600">Select a tab to manage leave requests and settings.</p>
          </div>
        )}
      </main>
    </div>
  );
}
