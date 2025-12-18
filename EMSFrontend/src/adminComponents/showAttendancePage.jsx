import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AttendanceAdminPage() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/admin/getAllEmployee");
      if (res.data.success) {
        setEmployees(res.data.employee);
      }
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  return (
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
                className={`hover:bg-blue-50 cursor-pointer ${idx % 2 === 0 ? "bg-gray-50" : ""}`}
                onClick={() => navigate(`/admin/attendance/${emp._id}`)}
              >
                <td className="p-3 border font-semibold">{emp.name}</td>
                <td className="p-3 border">{emp.email}</td>
                <td className="p-3 border text-blue-600 underline">View Attendance</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

