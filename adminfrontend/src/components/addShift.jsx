import React, { useState } from "react";
import axios from "axios";
import { successToast, errorToast } from "../utils/toastMessage";

export default function AddRockstarPage() {
  const [selectedShiftData, setSelectedShiftData] = useState({});
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");

  const adminId = localStorage.getItem("adminId");

  const shiftTimes = {
    "Shift A": { start: "06:00", end: "14:00" },
    "Shift B": { start: "14:00", end: "22:00" },
    "Shift C": { start: "22:00", end: "06:00" },
    Off: { start: null, end: null },
  };

  // -------------------- STATIC 5 WEEKS TABLE --------------------
  const weeks = Array.from({ length: 5 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => ({
      week: w + 1,
      weekday: d,
    }))
  );

  const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // -------------------- SAVE TABLE SHIFT SELECTION --------------------
  const handleShiftSelect = (week, weekday, shift) => {
    const key = `${week}-${weekday}`;
    const shiftInfo = shiftTimes[shift];

    setSelectedShiftData((prev) => ({
      ...prev,
      [key]: {
        week,
        weekday,
        shiftName: shift,
        startTime: shiftInfo.start,
        endTime: shiftInfo.end,
      },
    }));
  };

  // -------------------- SUBMIT BACKEND --------------------
  const submitToBackend = async () => {
    if (!startRange || !endRange)
      return errorToast("Please select start & end date!");

    if (endRange < startRange)
      return errorToast("End date must be after start!");

    if (Object.keys(selectedShiftData).length === 0)
      return errorToast("Select at least one shift from table!");

    try {
      let start = new Date(startRange);
      let end = new Date(endRange);

      let loop = new Date(start);

      while (loop <= end) {
        let weekday = loop.getDay(); // 0 = Sun, 1 = Mon ...

        // For 5 weeks repeat pattern
        let diffDays = Math.floor((loop - start) / (1000 * 60 * 60 * 24));
        let weekIndex = Math.floor(diffDays / 7) % 5 + 1;

        let key = `${weekIndex}-${weekday}`;
        let match = selectedShiftData[key];

        if (match && match.shiftName !== "Off") {
          const dateStr = loop.toISOString().split("T")[0];

          await axios.post("http://localhost:9000/api/admin/addShift", {
            shiftName: match.shiftName,
            startTime: match.startTime,
            endTime: match.endTime,
            date: dateStr,
            dateKey: dateStr,
            supervisor: adminId,
          });
        }

        loop.setDate(loop.getDate() + 1);
      }

      successToast("Shift pattern successfully applied and saved!");
    } catch (err) {
      console.error(err);
      successToast("Error saving shifts!");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Add Rockstar Shift Pattern</h1>

      {/* WEEK TABLE (NO DATES) */}
      <table className="w-full border-collapse text-center mt-6">
        <thead>
          <tr className="bg-gray-200 font-semibold">
            <th className="border p-2">Week</th>
            {weekNames.map((d) => (
              <th key={d} className="border p-2">{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {weeks.map((weekRow, w) => (
            <tr key={w}>
              <td className="border p-2 bg-gray-100">Week {w + 1}</td>
              {weekRow.map((day) => (
                <td key={day.weekday} className="border p-3">
                  <select
                    className="border p-1 mt-1 bg-gray-100"
                    value={
                      selectedShiftData[`${day.week}-${day.weekday}`]
                        ?.shiftName || ""
                    }
                    onChange={(e) =>
                      handleShiftSelect(day.week, day.weekday, e.target.value)
                    }
                  >
                    <option value="">Select Shift</option>
                    <option value="Shift A">Shift A</option>
                    <option value="Shift B">Shift B</option>
                    <option value="Shift C">Shift C</option>
                    <option value="Off">Off</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* DATE RANGE INPUT */}
      <div className="flex space-x-4 mt-6">
        <div>
          <label className="font-semibold">Start Date:</label>
          <input
            type="date"
            className="border px-2 py-1 ml-2"
            value={startRange}
            onChange={(e) => setStartRange(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">End Date:</label>
          <input
            type="date"
            className="border px-2 py-1 ml-2"
            min={startRange}
            value={endRange}
            onChange={(e) => setEndRange(e.target.value)}
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={submitToBackend}
        className="bg-green-700 text-white px-6 py-2 rounded mt-6"
      >
        Apply & Save Shifts
      </button>
    </div>
  );
}
