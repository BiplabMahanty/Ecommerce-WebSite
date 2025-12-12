import axios from "axios";
import React, { useState,useEffect } from "react";
import { successToast, errorToast } from "../utils/toastMessage";

export default function AttendanceReportsPage() {
    const [activeReport, setActiveReport] = useState("monthly");
    const[Attendance,setAttendance]=useState([])
    const [type, setType] = useState("");

    console.log("test",type)
    const employeeId = localStorage.getItem("employeeId");
    console.log("emp",employeeId)
    console.log("attendance",Attendance)


   
    const filterData = () => {
        switch (activeReport) {
            case "monthly":
                return Attendance;
            case "leave":
                return Attendance.filter((d) => d.status !== "present");
            case "late":
                return Attendance.filter((d) => d.late);
            case "early":
                return Attendance.filter((d) => d.early);
            default:
                return Attendance;
        }
    };
useEffect(() => {
          if (!employeeId) {
            errorToast("Please login first");
            return;
          }
          console.log("Employee ID from localStorage:", employeeId);
          fetchAttendance();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [employeeId,type]);
const fetchAttendance = async () => {
  try {
      if (!type) return;
      const res = await axios.get(
        `http://localhost:9000/api/employee/attendance/${employeeId}?month=${type}`
      );

      if (res.data) {
          setAttendance(res.data.records);
      } else {
          errorToast(res.data.message || "Failed to load attendance");
      }
  } catch (err) {
      console.error("Fetch error:", err);
      errorToast("Server error while fetching attendance");
  }
};



    return (
        <div className="p-8 space-y-10">
            <h1 className="text-3xl font-bold mb-6">Attendance Reports</h1>

            {/* Report Selector */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <button
                    onClick={() => setActiveReport("monthly")}
                    className={`p-5 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition ${activeReport === "monthly"
                            ? "bg-gray-700"
                            : "bg-gray-400 hover:bg-blue-500"
                        }`}
                >
                    Monthly Attendance
                </button>

                <button
                    onClick={() => setActiveReport("leave")}
                    className={`p-5 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition ${activeReport === "leave"
                            ? "bg-gray-700"
                            : "bg-gray-400 hover:bg-green-500"
                        }`}
                >
                    Leave Report
                </button>

                <button
                    onClick={() => setActiveReport("late")}
                    className={`p-5 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition ${activeReport === "late"
                            ? "bg-gray-700"
                            : "bg-gray-400 hover:bg-orange-500"
                        }`}
                >
                    Late Coming Report
                </button>

                <button
                    onClick={() => setActiveReport("early")}
                    className={`p-5 rounded-xl text-white font-semibold shadow-md hover:scale-105 transition ${activeReport === "early"
                            ? "bg-gray-700"
                            : "bg-gray-400 hover:bg-red-500"
                        }`}
                >
                    Early Checkout Report
                </button>
            </div>

            {/* Table */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-6 capitalize">{activeReport} Report</h2>
                <select
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)} required
                    className="w-23 p-1 border rounded-xl bg-gray-200  float-left mb-3"
                >
                    <option value="">Select Month</option>
                    <option value="2025-01">January</option>
                    <option value="2025-02">February</option>
                    <option value="2025-03">March</option>
                    <option value="2025-04">April</option>
                    <option value="2025-05">May</option>
                    <option value="2025-06">June</option>
                    <option value="2025-07">July</option>
                    <option value="2025-08">August</option>
                    <option value="2025-09">September</option>
                    <option value="2025-10">October</option>
                    <option value="2025-11">November</option>
                    <option value="2025-12">December</option>
                </select>
                <table className="w-full border-collapse text-left">

                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="p-3 border">Date</th>
                            <th className="p-3 border">Check In</th>
                            <th className="p-3 border">Check Out</th>
                            <th className="p-3 border">Total Hours</th>
                            <th className="p-3 border">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filterData().map((row, i) => (
                            <tr
                                key={row.id}
                                className={`${i % 2 === 0 ? "bg-gray-50" : ""} hover:bg-blue-50 transition cursor-pointer`}
                            >
                                <td className="p-3 border">{row.date}</td>
                                <td className="p-3 border">{row.checkIn}</td>
                                <td className="p-3 border">{row.checkOut}</td>
                                <td className="p-3 border">{row.totalHours}</td>
                                <td className="p-3 border font-semibold capitalize">
                                    {row.status === "present" && <span className="text-green-600">Present</span>}
                                    {row.status === "absent" && <span className="text-red-600">Absent</span>}
                                    {row.status === "half-day" && <span className="text-yellow-600">Half Day</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
