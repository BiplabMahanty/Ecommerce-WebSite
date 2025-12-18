    import React, { useState, useEffect } from "react";
    import axios from "axios";
    import { successToast, errorToast } from "../utils/toastMessage";
     import { useNavigate } from "react-router-dom";
     import { Outlet } from "react-router-dom";

    export default function EmployeeAddToRockstarPage() {
     

const navigate = useNavigate();

      const [shifts, setShifts] = useState([]);
      const [selectedShift, setSelectedShift] = useState(null);

      const [employees, setEmployees] = useState([]);
      const [selectedEmployees, setSelectedEmployees] = useState([]);


      const adminId = localStorage.getItem("adminId");
      const token = localStorage.getItem("adminToken");

      console.log("Selected Shift →", selectedShift);
      console.log("Selected Employees →", selectedEmployees);

      // --------------------------
      // Fetch Shifts From Backend
      // --------------------------
      useEffect(() => {
        const fetchShifts = async () => {
          try {
            const res = await axios.get("http://localhost:9000/api/admin/getShift",{
              headers: { Authorization: `Bearer ${token}`

            }
            });

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
              "http://localhost:9000/api/admin/getAllEmployee",{ headers: {
              Authorization: `Bearer ${token}`
            }}
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
            payload,{ headers: {
              Authorization: `Bearer ${token}`
            }}
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
                        navigate(`/admin/add-employee-rockstar/${shift._id}`)
                      }}
                    >
                      Select Shift
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        <Outlet />
        </div>
      );
    }
