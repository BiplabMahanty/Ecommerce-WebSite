import React, { useEffect, useState } from "react";
import axios from "axios";
import { successToast, errorToast } from "../utils/toastMessage";


export default function AllowancesPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [allowanceValues, setAllowanceValues] = useState({});
  const [paymentDetails,setPaymentDetails]=useState([])
  const[calculated,setCalculated]=useState([])
  const token = localStorage.getItem("adminToken");
  console.log("Admin Token in AllowancesPage:", token);
  console.log("Paymentdetails",paymentDetails)
  const months = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, "0")}`);

  useEffect(() => {
    fetchEmployees();
    fetchEPayments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/admin/getAllEmployee",{ headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setEmployees(res.data.employee);
      }
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const fetchEPayments = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/admin/getAllPayments",{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setPaymentDetails(res.data.payment);
      }
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const handleInputChange = (empId, field, value) => {
    setAllowanceValues((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value,
      },
    }));
  };
  console.log("allowanceValues",allowanceValues.hra || 0)

  const handleCalculate = async (emp) => {
    if (!selectedMonth) {
      errorToast("Please select a month first");
    }

    const body = {
      employeeId: emp._id,
      month: selectedMonth,
      basicSalary: Number(allowanceValues[emp._id]?.basic || 0),
      hraAllowances: Number(allowanceValues[emp._id]?.hra || 0),
      daAllowances: Number(allowanceValues[emp._id]?.da || 0),
      taAllowances: Number(allowanceValues[emp._id]?.ta || 0),
      maAllowances: Number(allowanceValues[emp._id]?.ma || 0),
      spAllowances: Number(allowanceValues[emp._id]?.sp || 0),
      pfcal: Number(allowanceValues[emp._id]?.pf || 0),
    };

    try {
      const res = await axios.post("http://localhost:9000/api/admin/payAllowances", body,{
        headers: {
          Authorization: `Bearer ${token}`
        }
          
      });
      if (res.data.success) {
        successToast("Allowances calculated successfully");
        fetchEPayments();
      }
    } catch (err) {
      console.error("Error calculating allowances", err);
      errorToast("Error processing request");
    }
  };

  const handleTryCalculate = (emp) => {
  const data = allowanceValues[emp._id];

  const basic = Number(data?.basic || 0);
  const hra = Number(data?.hra || 0);
  const da = Number(data?.da || 0);
  const ta = Number(data?.ta || 0);
  const ma = Number(data?.ma || 0);
  const sp = Number(data?.sp || 0);
  const pfcal = Number(data?.pf || 0);

  // Deductions
  const pf = (basic * pfcal) / 100;
  const esic = basic <= 21000 ? (basic * 0.75) / 100 : 0;
  const professionalTex = 200;

  // Allowance - Deductions
  const totalAllowances =
    hra + da + ta + ma + sp - (pf + esic + professionalTex);

  const basicSalary=basic+totalAllowances

  // store results in state
  setCalculated((prev) => ({
    ...prev,
    [emp._id]: {
      pf,
      esic,
      professionalTex,
      totalAllowances,
      basicSalary,
    },
  }));
};


return (
  <div className="p-6 w-full">

    <h1 className="text-2xl font-bold mb-6">Allowance Management</h1>
    
    {/* Month Selector */}
    <div className="mb-6">
      <label className="font-semibold mr-3 text-lg">Select Month:</label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="border p-2 rounded-lg shadow"
      >
        <option value="">-- Select Month --</option>
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>

    {/* Employee Allowance Table */}
    <div className="bg-white shadow-xl rounded-2xl p-1 border border-gray-200 ">
      <table className="w-100 h-100 border-collapse ">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left w-100">
            <th className="p-1 border">Employee Name</th>
            <th className="p-1 border">Basic Salary</th>
            <th className="p-1 border">HRA </th>
            <th className="p-1 border">DA </th>
            <th className="p-1 border">TA </th>
            <th className="p-1 border">Medical </th>
            <th className="p-1 border">Special </th>
            <th className="p-1 border">Pf</th>
            <th className="p-1 border">PFCalculate</th>
            <th className="p-1 border">ESIC</th>
            <th className="p-1 border">professionalTex</th>
            <th className="p-1 border">TotalAllowances</th>
            <th className="p-1 border">GrossSalary</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp, idx) => (
            <tr
              key={emp._id}
              className={`hover:bg-blue-50 ${idx % 2 === 0 ? "bg-gray-50" : ""}`}
            >
              <td className="p-1 border font-semibold">{emp.name}</td>
             <td className="p-1 border">
                <input
                 placeholder="Basic Salary"
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.basic || ""}
                  onChange={(e) => handleInputChange(emp._id, "basic", e.target.value)}
                />
                  
                
              </td>

              {/* HRA */}
              <td className="p-1 border">
                <input
                 placeholder="HRA"
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.hra || ""}
                  onChange={(e) => handleInputChange(emp._id, "hra", e.target.value)}
                />
                  
                
              </td>

              {/* DA */}
              <td className="p-1 border">
                <input
                placeholder="DA"
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.da || ""}
                  onChange={(e) => handleInputChange(emp._id, "da", e.target.value)}
                />
                 
              </td>

              {/* TA */}
              <td className="p-1 border">
                <input
                  placeholder="TA"
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.ta || ""}
                  onChange={(e) => handleInputChange(emp._id, "ta", e.target.value)}
                />
                 
              </td>

              {/* Medical */}
              <td className="p-1 border">
                <input
                  placeholder="MA"
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.ma || ""}
                  onChange={(e) => handleInputChange(emp._id, "ma", e.target.value)}
                />
                 
              </td>

              {/* Special */}
              <td className="p-1 border">
                <input
                  placeholder="SP"
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.sp || ""}
                  onChange={(e) => handleInputChange(emp._id, "sp", e.target.value)}
                />
                 
              </td>

               {/* Special */}
              <td className="p-1 border">
                <select
                  className="border p-2 rounded"
                  value={allowanceValues[emp._id]?.sp || ""}
                  onChange={(e) => handleInputChange(emp._id, "pf", e.target.value)}
                >
                  <option value="">%</option>
                  <option value="5">5%</option>
                  <option value="7">7%</option>
                  <option value="10">10%</option>
                  <option value="12">12%</option>
                  <option value="13">13%</option>
                </select>
              </td>
              <td className="p-1 border">{calculated[emp._id]?.pf ?? "--"}</td>
              <td className="p-1 border">{calculated[emp._id]?.esic ?? "--"}</td>
              <td className="p-1 border">{calculated[emp._id]?.professionalTex ?? "--"}</td>
              <td className="p-1 border font-bold">{calculated[emp._id]?.totalAllowances ?? "--"}</td>
              <td className="p-1 border font-bold">{calculated[emp._id]?.basicSalary?? "--"}</td>
              
              <td className="p-1 border">
                <button
                  onClick={() => handleTryCalculate(emp)}
                  className="bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700"
              >
                 Calculate
               </button>
              </td>

              {/* Calculate Button */}
              <td className="p-1 border text-center">
                <button
                  onClick={() => handleCalculate(emp)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                  Update
                </button>   

              </td>
              

            </tr>
          ))}
        </tbody>

      </table>
    </div>

    {/* Results Table */}
    <div className="mt-10 bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Calculated Allowance Details</h2>

      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr className="bg-green-100 text-gray-700 text-left">
            <th className="p-1 border">Employee</th>
            <th className="p-1 border">Month</th>
            <th className="p-1 border">HRA</th>
            <th className="p-1 border">DA</th>
            <th className="p-1 border">TA</th>
            <th className="p-1 border">MA</th>
            <th className="p-1 border">SP</th>
            <th className="p-1 border">PF</th>
            <th className="p-1 border">ESIC</th>
            <th className="p-1 border">ProfessionalTex</th>
            <th className="p-1 border">TotalAllowances</th>
            <th className="p-1 border">GrossSalary</th>
          </tr>
        </thead>

        <tbody>
          {paymentDetails.map((r) => (
            <tr key={r._id}>
              <td className="p-1 border">{r.name}</td>
              <td className="p-1 border">{r.salaryMonth}</td>
              <td className="p-1 border">{r.hraAllowances}</td>
              <td className="p-1 border">{r.daAllowances}</td>
              <td className="p-1 border">{r.taAllowances}</td>
              <td className="p-1 border">{r.maAllowances}</td>
              <td className="p-1 border">{r.spAllowances}</td>
              <td className="p-1 border">{r.pf}</td>
              <td className="p-1 border">{r.esic}</td>
              <td className="p-1 border">{r.professionalTex}</td>
              <td className="p-1 border font-bold">{r.totalAllowances}</td>
              <td className="p-1 border font-bold">{r.grossSalary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);
}   