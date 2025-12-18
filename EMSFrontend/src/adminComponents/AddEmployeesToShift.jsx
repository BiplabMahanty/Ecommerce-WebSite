import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { successToast, errorToast } from "../utils/toastMessage";

export default function AddEmployeesToShift() {
  const { shiftId } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [shift, setShift] = useState(null);

  const adminId = localStorage.getItem("adminId");
  const token = localStorage.getItem("adminToken");

  // --------------------------  // Fetch Shift Details  // --------------------------
  useEffect(() => {
    const fetchShift = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9000/api/admin/getShiftById/${shiftId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setShift(res.data.shift);
      } catch (error) {
        errorToast("Failed to load shift");
      }
    };

    fetchShift();
  }, [shiftId]);

  // --------------------------  // Fetch Employees  // --------------------------
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9000/api/admin/getAllEmployee",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEmployees(res.data.employee);
      } catch (error) {
        errorToast("Failed to load employees");
      }
    };

    fetchEmployees();
  }, []);

  // --------------------------  // Toggle Employee  // --------------------------
  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --------------------------  // Submit Employees  // --------------------------
  const submitEmployeeShift = async () => {
    if (selectedEmployees.length === 0) {
      return errorToast("Select at least one employee");
    }
    if (!shift || !shift.dateKey) {
      return errorToast("Shift dateKey is missing or invalid");
    }
    if (!adminId) {
      return errorToast("Supervisor ID is missing");
    }

    console.log("Submitting employees to shift:", shift.dateKey);
    console.log("Selected Shift:", shift);
    console.log("Selected Employees:", selectedEmployees);
    const payload = {
      dateKey: shift.dateKey,
      supervisor: adminId,
      employees: selectedEmployees,
    };

    console.log("Payload being sent:", payload);

    try {
      await axios.post(
        "http://localhost:9000/api/admin/addEmpInRockstar",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      successToast("Employees assigned successfully");
      navigate("/admin/add-employee-rockstar");
    } catch (error) {
      console.error("API Error:", error.response?.data);
      errorToast("Failed to assign employees");
    }
  };

  if (!shift) return <p>Loading shift...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Add Employees To Shift:
        <span className="text-green-700 ml-2">{shift.dateKey}</span>
      </h2>

      <table className="w-full border-collapse text-left mt-4">
        <thead>
          <tr className="bg-gray-200 font-semibold">
            <th className="border p-2 text-center">Select</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Position</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp._id}
              className={`border ${
                selectedEmployees.includes(emp._id)
                  ? "bg-green-100"
                  : "bg-white"
              }`}
            >
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={selectedEmployees.includes(emp._id)}
                  onChange={() => toggleEmployee(emp._id)}
                />
              </td>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.department}</td>
              <td className="border p-2">{emp.position}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={submitEmployeeShift}
        className="bg-green-700 text-white px-6 py-2 rounded mt-6"
      >
        Assign Employees To Shift
      </button>
    </div>
  );
}