import React, { useState, useEffect } from "react";
import axios from "axios";
import { successToast, errorToast } from "../utils/toastMessage";

export default function EmployeeAddToRockstarPage() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const adminId = localStorage.getItem("adminId");

  console.log("Selected Shift →", selectedShift);
  console.log("Selected Employees →", selectedEmployees);

  // --------------------------
  // Fetch Shifts From Backend
  // --------------------------
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await axios.get("http://localhost:9000/api/admin/getShift");

        setShifts(res.data.shift);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    fetchShifts();
  }, []);

  // --------------------------
  // Fetch Employees
  // --------------------------
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9000/api/admin/getAllEmployee"
        );
        setEmployees(res.data.employee);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // --------------------------
  // Select / Unselect Employee
  // --------------------------
  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --------------------------
  // Submit Selected Employees
  // --------------------------
  const submitEmployeeShift = async () => {
    if (!selectedShift) return errorToast("Please select a shift first!");
    if (selectedEmployees.length === 0)
      return errorToast("Please select at least one employee!");

    const payload = {
      dateKey: selectedShift.dateKey,
      supervisor: adminId,
      employees: selectedEmployees,
    };

    try {
      const res = await axios.post(
        "http://localhost:9000/api/admin/addEmpInRockstar",
        payload
      );

      successToast("Employees added successfully!");
      console.log(res.data);

      setSelectedEmployees([]); // Reset selection
    } catch (error) {
      console.error(error);
      errorToast("Error saving employee shift");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Rockstar Shift Assignment</h1>

      {/* SHIFT LIST */}
      <h2 className="text-xl font-semibold mt-4">Available Shifts</h2>

      <table className="w-full border-collapse text-center mt-4">
        <thead>
          <tr className="bg-gray-200 font-semibold">
            <th className="border p-2">Shift</th>
            <th className="border p-2">Start Time</th>
            <th className="border p-2">End Time</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {shifts.map((shift) => (
            <tr
              key={shift._id}
              className={`border ${
                selectedShift?._id === shift._id ? "bg-blue-100" : "bg-white"
              }`}
            >
              <td className="border p-2">{shift.shiftName}</td>
              <td className="border p-2">{shift.startTime}</td>
              <td className="border p-2">{shift.endTime}</td>
              <td className="border p-2">{shift.dateKey}</td>
              <td className="border p-2">
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                  onClick={() => {
                    setSelectedShift(shift);
                    setSelectedEmployees([]); // reset employee selection
                  }}
                >
                  Select Shift
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SHOW EMPLOYEES ONLY AFTER SHIFT SELECT */}
      {selectedShift && (
        <>
          <h2 className="text-xl font-semibold mt-6">
            Add Employees To Shift:{" "}
            <span className="text-green-700">{selectedShift.dateKey}</span>
          </h2>

          <table className="w-full border-collapse text-left mt-4">
            <thead>
              <tr className="bg-gray-200 font-semibold">
                <th className="border p-2">Select</th>
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
                  <td className="border p-2 text-center ">
                    <input
                    className="cursor-pointer"
                      type="checkbox"
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
            className="bg-green-700 text-white px-6 py-2 rounded mt-4"
          >
            Assign Employees To Shift
          </button>
        </>
      )}
    </div>
  );
}
