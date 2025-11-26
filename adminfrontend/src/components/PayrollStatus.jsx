import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function PayrollStatus() {
  const [selectedMonth, setSelectedMonth] = useState("January 2025");

  const payrollData = [
    {
      id: 1,
      employee: "John Doe",
      month: "January 2025",
      workingDays: 26,
      presentDays: 24,
      leaves: 2,
      overtime: "5h",
      salary: "₹32,000",
      status: "Paid",
    },
    {
      id: 2,
      employee: "Amit Sharma",
      month: "January 2025",
      workingDays: 26,
      presentDays: 22,
      leaves: 4,
      overtime: "2h",
      salary: "₹28,500",
      status: "Pending",
    },
  ];
  const data = [
{ name: "Paid", value: 70 },
{ name: "Pending", value: 30 },
];
  return (
    <div className="p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Payroll Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-md hover:scale-[1.02] transition">
          <h2 className="text-lg">Total Employees</h2>
          <p className="text-3xl font-bold mt-2">52</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-md hover:scale-[1.02] transition">
          <h2 className="text-lg">Salary Paid</h2>
          <p className="text-3xl font-bold mt-2">₹12,20,000</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-md hover:scale-[1.02] transition">
          <h2 className="text-lg">Pending Salary</h2>
          <p className="text-3xl font-bold mt-2">₹1,80,000</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-700">Payroll Report</h2>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 p-3 rounded-xl"
        >
          <option>January 2025</option>
          <option>December 2024</option>
          <option>November 2024</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 w-full md:w-1/2">

  <h2 className="text-xl font-bold mb-4 text-gray-800">Payroll Status</h2>

  <PieChart width={350} height={300}>
    <Pie
      data={data}
      cx={160}
      cy={130}
      outerRadius={100}
      dataKey="value"
      label
    >
      {data.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={index === 0 ? "#4ade80" : "#fb7185"}  // green, red
        />
      ))}
    </Pie>

    <Tooltip />
    <Legend />
  </PieChart>

</div>


      {/* Payroll Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Payroll Status</h3>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Employee</th>
              <th className="p-3 border">Working Days</th>
              <th className="p-3 border">Present</th>
              <th className="p-3 border">Leaves</th>
              <th className="p-3 border">Overtime</th>
              <th className="p-3 border">Salary</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {payrollData.map((item, index) => (
              <tr
                key={item.id}
                className={
                  (index % 2 === 0 ? "bg-gray-50" : "bg-white") +
                  " hover:bg-blue-50 transition"
                }
              >
                <td className="p-3 border">{item.employee}</td>
                <td className="p-3 border">{item.workingDays}</td>
                <td className="p-3 border">{item.presentDays}</td>
                <td className="p-3 border">{item.leaves}</td>
                <td className="p-3 border">{item.overtime}</td>
                <td className="p-3 border font-semibold">{item.salary}</td>
                <td className="p-3 border font-semibold">
                  {item.status === "Paid" ? (
                    <span className="text-green-600">Paid</span>
                  ) : (
                    <span className="text-red-600">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
