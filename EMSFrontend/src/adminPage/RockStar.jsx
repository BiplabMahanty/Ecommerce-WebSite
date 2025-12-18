import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AddRockstarShift ()  {
  const [shiftName, setShiftName] = useState("Shift A");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("14:00");
  const [date, setDate] = useState("");
  const [employees, setEmployees] = useState([]);
 const [department, setDepartment] = useState("HR"); // NEW

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const adminId = localStorage.getItem("adminId");
  const token = localStorage.getItem("adminToken");
  console.log("Admin ID:", adminId);

  // ✅ Automatically adjust times based on selected shift
  useEffect(() => {
    if (shiftName === "Shift A") {
      setStartTime("06:00");
      setEndTime("14:00");
    } else if (shiftName === "Shift B") {
      setStartTime("14:00");
      setEndTime("22:00");
    } else if (shiftName === "Shift C") {
      setStartTime("22:00");
      setEndTime("06:00");
    }
  }, [shiftName]);

  // ✅ Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9000/api/admin/getEmployeeByDepartment/${department}`,{ headers: {
            Authorization: `Bearer ${token}`
          }
          }
        );

        if (res.data.success) {
          setEmployees(res.data.employees);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.log("Error loading employees", error);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [department]);

  // ✅ Select multiple employees
  const handleEmployeeSelect = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((emp) => emp !== id) : [...prev, id]
    );
  };
   const handleRemoveEmployee = (id) => {
    setSelectedEmployees(selectedEmployees.filter((e) => e._id !== id));
  };

  // ✅ Submit new Rockstar shift
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || selectedEmployees.length === 0) {
      return setMessage("⚠️ Please select a date and at least one employee.");
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        shiftName,
        startTime,
        endTime,
        date,
        dateKey: new Date(date).toISOString().split("T")[0],
        employees: selectedEmployees,
        supervisor: adminId,
      };

      const res = await axios.post(
        "http://localhost:9000/api/admin/addRockstarShift",
        payload,{
          headers: { Authorization: `Bearer ${token}` }  
        },
      );

      setMessage(res.data.message || "✅ Shift added successfully!");
      setLoading(false);
      setShiftName("Shift A");
      setStartTime("06:00");
      setEndTime("14:00");
      setDate("");
      setSelectedEmployees([]);
    } catch (err) {
      console.error("❌ Error adding shift:", err);
      setMessage(err.response?.data?.message || "Something went wrong ❌");
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-[#F4F7FB] min-h-screen">

      <h2 className="text-3xl font-bold mb-6">Create Rockstar Shift</h2>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        
        {/* Shift Selector */}
        <div className="grid grid-cols-3 gap-6">

          <div>
            <label className="font-semibold">Shift Name</label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
            >
              <option value="Shift A">A (6 AM - 2 PM)</option>
              <option value="Shift B">B (2 PM - 8 PM)</option>
              <option value="Shift C">C (8 PM - 6 AM)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Start Time</label>
            <input
              type="time"
              value={startTime}
              readOnly
              className="w-full mt-2 p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-semibold">End Time</label>
            <input
              type="time"
              value={endTime}
              readOnly
              className="w-full mt-2 p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Date */}
        <div className="mt-6">
          <label className="font-semibold justify-between flex items-right gap-4">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40 mt-2 p-3 border rounded-lg justify-between flex items-right gap-4"
          />
        </div>

        <div className="mb-6">
          <label className="font-semibold justify-between flex items-right gap-4">Select Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-40 mt-2 p-3 border rounded-lg justify-between flex items-right gap-4"
          >
            <option value="HR">HR</option>
            <option value="it department">IT Department</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="Software Engineer">Software Engineer</option>
          </select>
        </div>

        {/* Assign Employees */}
        <div className="mt-8">
          <label className="font-semibold">Assign Employees</label>

          <div className="grid grid-cols-2 gap-4 mt-3 max-h-[200px] overflow-y-auto p-3 border rounded-lg">
            {employees.length === 0 ? (
              <p>No employees found in this department</p>
            ) : (
              employees.map((emp) => {
                const isSelected = selectedEmployees.includes(emp._id);

                return (
                  <div
                    key={emp._id}
                    className="flex justify-between items-center border p-3 rounded-lg bg-gray-50"
                  >
                    <span>{emp.name}</span>
                    <span className="text-sm text-gray-500">{emp.department}</span>

                    <button
                      onClick={() => handleEmployeeSelect(emp._id)}
                      className={`px-4 py-1 rounded-lg 
                        ${isSelected ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-green-600 text-white text-lg font-semibold rounded-lg"
          >
            Create Shift
          </button>
        </div>
      </div>
    </div>
  );
}
