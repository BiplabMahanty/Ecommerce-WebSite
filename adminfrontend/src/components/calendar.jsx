import React, { useState, useMemo } from "react";
import axios from "axios";
import { successToast, errorToast } from "../utils/toastMessage";

export default function MonthlyCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [selectedDate, setSelectedDate] = useState(null);

  const [shiftData, setShiftData] = useState({
    shiftName: null,
    startTime: null,
    endTime: null,
  });
  const [savedDates, setSavedDates] = useState([]); // highlight saved dates

  const adminId = localStorage.getItem("adminId");

  // ------------------ CALENDAR GENERATOR ------------------
  const calendar = useMemo(() => {
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const startDay = firstOfMonth.getDay();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const weeks = [];
    let dayCounter = 1;
    let nextMonthDay = 1;

    for (let week = 0; week < 6; week++) {
      const days = [];

      for (let weekday = 0; weekday < 7; weekday++) {
        const cellIndex = week * 7 + weekday;

        if (cellIndex < startDay) {
          const day = prevMonthDays - (startDay - 1) + cellIndex;
          days.push({
            day,
            inMonth: false,
            date: new Date(currentYear, currentMonth - 1, day),
          });
        } else if (dayCounter <= daysInMonth) {
          days.push({
            day: dayCounter,
            inMonth: true,
            date: new Date(currentYear, currentMonth, dayCounter),
          });
          dayCounter++;
        } else {
          days.push({
            day: nextMonthDay,
            inMonth: false,
            date: new Date(currentYear, currentMonth + 1, nextMonthDay),
          });
          nextMonthDay++;
        }
      }

      weeks.push(days);
      if (dayCounter > daysInMonth && nextMonthDay > 7) break;
    }

    return { weeks };
  }, [currentYear, currentMonth]);

  // ------------------ HANDLE DAY CLICK ------------------
  const handleDayClick = (dateObj) => {
    const formattedDate = dateObj.toISOString().split("T")[0]; // 2025-11-14
    setSelectedDate(formattedDate);
  };

  // ------------------ SHIFT SELECT ------------------
  const handleShiftChange = (shift) => {
    const shiftMappings = {
      "Shift A": { startTime: "06:00 AM", endTime: "02:00 PM" },
      "Shift B": { startTime: "02:00 PM", endTime: "10:00 PM" },
      "Shift C": { startTime: "10:00 PM", endTime: "06:00 AM" },
    };

    setShiftData({
      shiftName: shift,
      ...shiftMappings[shift],
    });
  };

  // ------------------ SEND TO BACKEND ------------------
  const handleSubmit = async () => {
    if (!selectedDate || !shiftData.shiftName) {
      errorToast("Select a date and shift first");
      return;
    }

    const dateKey = selectedDate// YYYY-MM

    const payload = {
      shiftName: shiftData.shiftName,
      startTime: shiftData.startTime,
      endTime: shiftData.endTime,
      date: selectedDate,
      dateKey: dateKey,
      supervisor: adminId,
    };

    try {
      const res = await axios.post(
        "http://localhost:9000/api/admin/addShift",
        payload
      );

      successToast("Shift added successfully!");

      // highlight the saved date
      setSavedDates((prev) => [...prev, selectedDate]);

    } catch (err) {
      console.error("Error saving shift:", err);
      errorToast("Failed to save shift");
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ------------------ RENDER UI ------------------
  return (
    <div style={{ width: "350px", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>
        {monthNames[currentMonth]} {currentYear}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {calendar.weeks.map((week, i) => (
        <div
          key={i}
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}
        >
          {week.map((item, j) => {
            const formatted = item.date.toISOString().split("T")[0];
            const isSaved = savedDates.includes(formatted);

            return (
              <div
                key={j}
                onClick={() => item.inMonth && handleDayClick(item.date)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  background: isSaved
                    ? "#a8f0a8" // highlight saved date
                    : item.inMonth
                    ? "#fff"
                    : "#f0f0f0",
                  cursor: item.inMonth ? "pointer" : "default",
                }}
              >
                {item.day}
              </div>
            );
          })}
        </div>
      ))}

      {/* SHIFT SELECTOR */}
      {selectedDate && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid black",
          }}
        >
          <h4>Selected Date: {selectedDate}</h4>

          <select onChange={(e) => handleShiftChange(e.target.value)} defaultValue="">
            <option value="" disabled>
              Select Shift
            </option>
            <option value="Shift A">Shift A</option>
            <option value="Shift B">Shift B</option>
            <option value="Shift C">Shift C</option>
          </select>

          {/* SHOW SHIFT INFO */}
          {shiftData.shiftName && (
            <div style={{ marginTop: "10px" }}>
              <p>Shift: {shiftData.shiftName}</p>
              <p>Start: {shiftData.startTime}</p>
              <p>End: {shiftData.endTime}</p>
            </div>
          )}

          {/* ADD BUTTON */}
          <button
            onClick={handleSubmit}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              background: "blue",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Add Shift
          </button>
        </div>
      )}
    </div>
  );
}
