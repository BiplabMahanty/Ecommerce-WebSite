// adminfrontend/src/adminComponents/leave/LeaveHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { successToast, errorToast } from "../../utils/toastMessage";

export default function LeaveHistory() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [attendance, setAttendance] = useState([]);
  
    const [checkOutValues, setCheckOutValues] = useState({});
    const [employee, setEmployee] = useState(null);
  
    const [attendanceId, setAttendanceId] = useState(null);
    const [details, setDetails] = useState(null);
  const token = localStorage.getItem("adminToken");
  console.log("Admin Token in LeaveLayout:", token);    
   useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/admin/getAllEmployee",{ headers: {   
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setEmployees(res.data.employee);
      }
    } catch (err) {
      console.error("Error loading employees", err);
    }
  };

   useEffect(() => {
    if (selectedEmployeeId) fetchAttendance();
  }, [selectedEmployeeId]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/admin/attendance/${selectedEmployeeId}`,{ headers: {
          Authorization: `Bearer ${token}`
        } }
      );

      if (res.data.success) {
        setAttendance(res.data.attendance);
        setEmployee(res.data.employee);
      }
    } catch (err) {
      console.error("Error loading attendance", err);
    }
  };


  useEffect(() => {
    if (attendanceId) fetchDetails();
  }, [attendanceId]);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/admin/attendance/details/${attendanceId}`,{ headers: {
          Authorization: `Bearer ${token}`
        }     }
      );

      if (res.data.success) {
        setDetails(res.data.attendance);
      }
    } catch (err) {
      console.error("Error loading details", err);
    }
  };

  const handleEditCheckOut = async (Id, checkOutValue) => {
      const attId = Id;
      console.log("attendanceId", attId)
      console.log("checkOut", checkOutValue)
      console.log("selectedEmployeeId", selectedEmployeeId)
      try {
  
        const res = await axios.post("http://localhost:9000/api/admin/editCheckOut",{
          headers: { Authorization: `Bearer ${token}`}

        }, {
          attendanceId: attId,
          checkOut: checkOutValue,
          employeeId: selectedEmployeeId,
  
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
    <div>
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
          )}   
        </div>
  );
}
