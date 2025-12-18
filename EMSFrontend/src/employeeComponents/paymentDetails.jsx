import React, { useState } from "react";
import axios from "axios";
import {errorToast,successToast} from "../utils/toastMessage";

export default function EmployeeInvoicePage() {
  const [month, setMonth] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
    const employeeId = localStorage.getItem("employeeId");
    const token = localStorage.getItem("employeeToken");
  console.log("Selected month:", month);
  console.log("Selected invoice:", invoice);
  console.log("Selected employee:", employeeId);
  console.log("Selected token:", token);



  const fetchInvoice = async () => {
    if (!month) return errorToast("Please select month");
    try {
      setLoading(true);
      const res = await axios.get(
       `http://localhost:9000/api/employee/getInvoiceByMonth/${employeeId}?month=${month}`,{
            headers: { Authorization: `Bearer ${token}` }
       }
      );
      if (res.data.invoice) {
  setInvoice(res.data.invoice);
  successToast("Invoice found");
} else {
  errorToast("No invoice found");
  setInvoice(null);
}

      
    } catch (err) {
      console.error(err);
      errorToast("Error fetching invoice");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/employee/invoice/download/${invoice._id}`,{
            headers: { Authorization: `Bearer ${token}`
        }},
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Salary Invoice</h1>

      {/* Month Picker */}
      <div className="flex items-center gap-4 mb-8">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-3 rounded-lg"
        />
        <button
          onClick={fetchInvoice}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Find Invoice
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* Invoice Details */}
      {invoice && (
        <div className="bg-white shadow-xl rounded-2xl p-6 border">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
            <p><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Employee:</strong> {invoice.employeeName}</p>
            <p><strong>Department:</strong> {invoice.department}</p>
            <p><strong>Designation:</strong> {invoice.designation}</p>
            <p><strong>Salary Month:</strong> {invoice.salaryMonth}</p>
          </div>

          {/* Salary Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Earnings</h3>
              <ul className="space-y-2">
                <li>Basic Salary: ₹{invoice.basicSalary}</li>
                <li>Total Allowances: ₹{invoice.totalAllowances}</li>
                <li>HRA: ₹{invoice.hraAllowances}</li>
                <li>DA: ₹{invoice.daAllowances}</li>
                <li>TA: ₹{invoice.taAllowances}</li>
                <li>Medical: ₹{invoice.maAllowances}</li>
                <li>Special: ₹{invoice.spAllowances}</li>
                <li>Overtime Pay: ₹{invoice.overtimePay}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Deductions</h3>
              <ul className="space-y-2">
                <li>PF: ₹{invoice.pf}</li>
                <li>ESIC: ₹{invoice.esic}</li>
                <li>Professional Tax: ₹{invoice.professionalTex}</li>
                <li>Leave Deduction: ₹{invoice.leaveDeductions}</li>
                <li>Absent Deduction: ₹{invoice.absentDeductions}</li>
                <li>Late Deduction: ₹{invoice.lateTimeDeductions}</li>
              </ul>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 border-t pt-4 grid grid-cols-2 gap-4">
            <p><strong>Gross Salary:</strong> ₹{invoice.grossSalary}</p>
            <p><strong>Total Deductions:</strong> ₹{invoice.totalDeductions}</p>
            <p className="text-xl font-bold text-green-700">
              Net Salary: ₹{invoice.netSalary}
            </p>
            <p><strong>Status:</strong> {invoice.paymentStatus}</p>
          </div>

          {/* Download */}
          <div className="mt-8 text-right">
            <button
              onClick={downloadInvoice}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
