import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, UserPlus, Save } from "lucide-react";
import Topbar from "./Topbar";

export default function AddRockstarShift ()  {
  const [shiftName, setShiftName] = useState("Shift A");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("14:00");
  const [date, setDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const adminId = localStorage.getItem("adminId");
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
        const res = await axios.get("http://localhost:9000/api/admin/getAllEmployee");
        if (res.data.success) {
          setEmployees(res.data.employee || []);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("❌ Error fetching employees:", err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Select multiple employees
  const handleEmployeeSelect = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((emp) => emp !== id) : [...prev, id]
    );
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
        payload
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
   
  
 
  <div className="flex min-h-screen bg-gray-100">

    {/* MAIN CONTENT */}
    <div className="flex-1 p-8">

      {/* Topbar */}
      <Topbar />

      {/* Page Title */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 mt-6 text-indigo-600">
        🕒 Add Rockstar Shift
      </h2>

      {/* Form Container (Centered & full page look) */}
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-8 mx-auto">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SHIFT NAME */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-gray-600" />
              Shift Name
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
            >
              <option value="Shift A">Shift A (06:00 – 14:00)</option>
              <option value="Shift B">Shift B (14:00 – 22:00)</option>
              <option value="Shift C">Shift C (22:00 – 06:00)</option>
            </select>
          </div>

          {/* START + END TIME */}
          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="font-semibold mb-1 block">Start Time</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold mb-1 block">End Time</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

          </div>

          {/* DATE */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-gray-600" />
              Select Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* EMPLOYEE SELECTION */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-gray-600" />
              Assign Employees
            </label>

            <div className="border border-gray-300 rounded-lg p-3 max-h-56 overflow-y-auto">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <label
                    key={emp._id}
                    className="flex items-center gap-2 py-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedEmployees.includes(emp._id)}
                      onChange={() => handleEmployeeSelect(emp._id)}
                    />
                    {emp.name} ({emp.department})
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No employees found</p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            <Save className="w-5 h-5" />
            {loading ? "Saving..." : "Add Shift"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <div className="text-center mt-4 font-semibold text-green-600">
            {message}
          </div>
        )}
      </div>
    </div>

  </div>
);

}