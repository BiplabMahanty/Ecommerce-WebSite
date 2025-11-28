import React, { useState, useEffect } from "react";

export default function PaymentPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);

  const [basicSalary, setBasicSalary] = useState(20000);
  const [allowances, setAllowances] = useState(2000);

  const [calculated, setCalculated] = useState(null);

  // ----------------------------
  // Fetch All Employees
  // ----------------------------
  useEffect(() => {
    // Replace with your API
    setEmployees([
      { _id: "1", name: "John Doe", designation: "Developer" },
      { _id: "2", name: "Priya Sharma", designation: "Designer" },
    ]);
  }, []);

  // ----------------------------
  // Fetch Attendance + Leave Data when employee changes
  // ----------------------------
  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee);
      fetchLeaves(selectedEmployee);
    }
  }, [selectedEmployee]);

  // Dummy fetch functions (replace with API)
  const fetchAttendance = async (empId) => {
    setAttendanceData([
      {
        date: "2025-01-02",
        status: "present",
        checkIn: "09:00",
        checkOut: "18:30", // overtime 30min
        totalHours: "9h 30m",
      },
      {
        date: "2025-01-03",
        status: "absent",
      },
      {
        date: "2025-01-04",
        status: "present",
        checkIn: "10:15", // LATE
        checkOut: "18:00",
        totalHours: "7h 45m",
      },
    ]);
  };

  const fetchLeaves = async (empId) => {
    setLeaveData([
      {
        startDate: "2025-01-05",
        endDate: "2025-01-05",
        type: "Sick Leave",
        approved: true,
      },
    ]);
  };

  // ----------------------------
  // MAIN SALARY CALCULATION
  // ----------------------------
  const calculateSalary = () => {
    const totalDays = attendanceData.length;

    const presentDays = attendanceData.filter(
      (a) => a.status === "present"
    ).length;

    const absentDays = attendanceData.filter(
      (a) => a.status === "absent"
    ).length;

    const leaveDays = leaveData.length;

    // ----------------------
    // Leave Deduction
    // ----------------------
    const perDaySalary = basicSalary / 30;
    const leaveDeductions = leaveDays * perDaySalary;

    // ----------------------
    // Attendance Deduction
    // ----------------------
    const absentDeductions = absentDays * perDaySalary;

    // ----------------------
    // Overtime Calculation
    // ----------------------
    let overtimeMinutes = 0;
    attendanceData.forEach((item) => {
      if (item.checkIn && item.checkOut) {
        // Expected shift end time = 18:00
        const shiftEnd = 18 * 60; // in minutes

        const [h, m] = item.checkOut.split(":");
        const checkoutMin = Number(h) * 60 + Number(m);

        if (checkoutMin > shiftEnd) overtimeMinutes += checkoutMin - shiftEnd;
      }
    });

    const overtimeHours = overtimeMinutes / 60;
    const overtimePay = overtimeHours * 100; // ₹100/hr

    // ----------------------
    // FINAL SALARY
    // ----------------------
    const netSalary =
      basicSalary +
      allowances +
      overtimePay -
      absentDeductions -
      leaveDeductions;

    setCalculated({
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      overtimeHours: overtimeHours.toFixed(2),
      overtimePay,
      leaveDeductions,
      absentDeductions,
      netSalary,
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Employee Payroll Calculation</h1>

      {/* Panel */}
      <div className="bg-white p-6 rounded-xl shadow-md border">

        {/* Select Employee */}
        <label className="block font-semibold mb-2">Select Employee</label>
        <select
          className="p-3 border rounded-lg w-full mb-4"
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">-- Choose Employee --</option>
          {employees.map((emp) => (
            <option value={emp._id} key={emp._id}>
              {emp.name} ({emp.designation})
            </option>
          ))}
        </select>

        {/* Salary Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Basic Salary</label>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(Number(e.target.value))}
              className="p-3 border rounded-lg w-full"
            />
          </div>

          <div>
            <label className="font-semibold">Allowances</label>
            <input
              type="number"
              value={allowances}
              onChange={(e) => setAllowances(Number(e.target.value))}
              className="p-3 border rounded-lg w-full"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          onClick={calculateSalary}
        >
          Calculate Salary
        </button>
      </div>

      {/* Result Section */}
      {calculated && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border">

          <h2 className="text-2xl font-bold mb-4 text-green-600">Salary Breakdown</h2>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">

            <div className="p-4 bg-gray-50 border rounded-lg">
              <p>Total Days: <b>{calculated.totalDays}</b></p>
              <p>Present Days: <b>{calculated.presentDays}</b></p>
              <p>Absent Days: <b>{calculated.absentDays}</b></p>
              <p>Leave Days: <b>{calculated.leaveDays}</b></p>
            </div>

            <div className="p-4 bg-gray-50 border rounded-lg">
              <p>Overtime Hours: <b>{calculated.overtimeHours}</b></p>
              <p>Overtime Pay: ₹<b>{calculated.overtimePay}</b></p>
              <p>Absent Deductions: ₹<b>{calculated.absentDeductions}</b></p>
              <p>Leave Deductions: ₹<b>{calculated.leaveDeductions}</b></p>
            </div>
          </div>

          {/* Final Salary */}
          <div className="bg-green-100 p-4 mt-6 rounded-lg border border-green-300">
            <h2 className="text-xl font-bold text-green-800">Net Salary: ₹{calculated.netSalary}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
