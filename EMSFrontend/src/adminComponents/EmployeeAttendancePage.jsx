import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EmployeeAttendancePage() {
  const { employeeId } = useParams();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId || null);

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

  /* --------------------------------------------------
      MAIN PAGE RENDER
  --------------------------------------------------- */

  return (
    <div className="p-6 w-full">

      {/* ---------------------------------------------------------------------
          PAGE 1: LIST OF EMPLOYEES
      --------------------------------------------------------------------- */}
      {!selectedEmployeeId && (
        <div className="p-6 w-full">
          <h1 className="text-3xl font-bold mb-6">📅 Attendance Dashboard</h1>

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
                    className={`hover:bg-blue-50 cursor-pointer ${
                      idx % 2 === 0 ? "bg-gray-50" : ""
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
                      className={`hover:bg-blue-50 cursor-pointer ${
                        idx % 2 === 0 ? "bg-gray-50" : ""
                      }`}
                      onClick={() => setAttendanceId(a._id)}
                    >
                      <td className="p-3 border">{a.dateKey}</td>
                      <td className="p-3 border">
                        {a.checkIn
                          ? new Date(a.checkIn).toLocaleTimeString()
                          : "--"}
                      </td>
                      <td className="p-3 border">
                        {a.checkOut
                          ? new Date(a.checkOut).toLocaleTimeString()
                          : "--"}
                      </td>
                      <td className="p-3 border capitalize">{a.status}</td>
                      <td className="p-3 border text-blue-600 underline">
                        View Details
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------------------------------------------------------------------
              PAGE 3: ATTENDANCE DETAILS PAGE
          --------------------------------------------------------------------- */}
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
