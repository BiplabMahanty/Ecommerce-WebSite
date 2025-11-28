import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeePayment = () => {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null); // Fixed: should be null, not []
  const [loading, setLoading] = useState(false);

  console.log("paymentDetails", paymentDetails);
  console.log("selectedMonth", selectedMonth);
  console.log("selectedEmployee", selectedEmployee);
  console.log("payments", payments);
  
  const [paymentForm, setPaymentForm] = useState({
    method: 'Cash',
    note: '',
  });

  const API_BASE = 'http://localhost:9000/api/admin';

  // Fetch all employees on mount
  useEffect(() => {
    fetchEmployees();
    fetchAllPayments();
  }, []);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/getAllEmployee`);
      if (response.data.success) {
        setEmployees(response.data.employee || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to load employees');
    }
  };

  // Fetch all payment history
  const fetchAllPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/getAllPayments`);
      if (response.data.success) {
        setPayments(response.data.payment || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Handle employee selection
  const handleEmployeeChange = async (employeeId) => {
    setSelectedEmployee(employeeId);
    setEmployeeDetails(null);
    setPaymentDetails(null);
    setSelectedMonth(''); // Reset month when changing employee
    
    if (!employeeId) return;

    // Find employee details
    const emp = employees.find(e => e._id === employeeId);
    if (emp) {
      setEmployeeDetails(emp);
    }
  };

  // Handle month selection and fetch payment details
  const handleMonthChange = async (month) => {
    setSelectedMonth(month);
    setPaymentDetails(null);

    if (!selectedEmployee || !month) return;

    setLoading(true);
    try {
      // Convert "2025-01" to "2025/01" format for backend
      const formattedMonth = month;
      console.log("month",formattedMonth)
      
      // Correct API call: GET request with params and query
      const response = await axios.get(
        `${API_BASE}/getPayment/${selectedEmployee}?month=${formattedMonth}`
      );

      console.log("API Response:", response.data);

      if (response.data.success && response.data.payment) {
        // Check if payment is an empty array (backend returns [] when no record found)
        if (Array.isArray(response.data.payment) && response.data.payment.length === 0) {
          alert('No payment record found for this month');
          setPaymentDetails(null);
        } else {
          setPaymentDetails(response.data.payment);
        }
      } else {
        alert('No payment record found for this month');
        setPaymentDetails(null);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Failed to fetch payment details: ' + (error.response?.data?.message || error.message));
      setPaymentDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedMonth || !paymentDetails) {
      alert('Please select employee and month first');
      return;
    }

    if (paymentDetails.paymentStatus === 'paid') {
      alert('This salary has already been paid!');
      return;
    }

    const confirmPay = window.confirm(
      `Pay ₹${paymentDetails.netSalary} to ${employeeDetails.name} for ${selectedMonth}?`
    );

    if (!confirmPay) return;

    setLoading(true);
    try {
      const formattedMonth = selectedMonth;
      
      const response = await axios.post(`${API_BASE}/paySalary`, {
        employeeId: selectedEmployee,
        amount: paymentDetails.netSalary,
        method: paymentForm.method,
        remarks: paymentForm.note,
        month: formattedMonth
      });

      if (response.data.success) {
        alert('✅ Payment successful!');
        setPaymentDetails(response.data.payment);
        setPaymentForm({ method: 'Cash', note: '' });
        fetchAllPayments(); // Refresh payment history
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Employee Payment</h1>

      {/* PAYMENT FORM */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Make a Payment</h2>

        {/* Select Employee and Month */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-700">Select Employee</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedEmployee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-700">Select Month</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              disabled={!selectedEmployee}
            >
              <option value="">-- Choose Month --</option>
              {[
                "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
                "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
              ].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* EMPLOYEE DETAILS CARD */}
        {employeeDetails && !loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200 rounded-xl mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Employee Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <p className="text-gray-700"><strong>Name:</strong> {employeeDetails.name}</p>
              <p className="text-gray-700"><strong>Department:</strong> {employeeDetails.department}</p>
              <p className="text-gray-700"><strong>Basic Salary:</strong> ₹{employeeDetails.salary}</p>
              <p className="text-gray-700"><strong>Account:</strong> {employeeDetails.account || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* PAYMENT DETAILS CARD */}
        {paymentDetails && !loading && (
          <div className="bg-gray-50 p-6 border rounded-xl mb-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Salary Breakdown - {selectedMonth}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Basic Salary</p>
                <p className="font-bold text-lg text-gray-800">₹{paymentDetails.basicSalary || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Working Days</p>
                <p className="font-bold text-lg text-gray-800">{paymentDetails.totalWorkingDays || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Present Days</p>
                <p className="font-bold text-lg text-green-600">{paymentDetails.presentDays || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Absent Days</p>
                <p className="font-bold text-lg text-red-600">{paymentDetails.absentDays || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Overtime (mins)</p>
                <p className="font-bold text-lg text-blue-600">{paymentDetails.overtimeMinites || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Late Time (mins)</p>
                <p className="font-bold text-lg text-orange-600">{paymentDetails.overLateTime || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Gross Salary</p>
                <p className="font-bold text-lg text-gray-800">₹{paymentDetails.grossSalary || 0}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-gray-500 text-xs">Total Deductions</p>
                <p className="font-bold text-lg text-red-600">-₹{paymentDetails.totalDeductions || 0}</p>
              </div>
              
              <div className="bg-green-100 p-3 rounded-lg shadow-sm border-2 border-green-500">
                <p className="text-green-700 text-xs font-semibold">NET SALARY</p>
                <p className="font-bold text-2xl text-green-700">₹{paymentDetails.netSalary || 0}</p>
              </div>
            </div>

            {/* Payment Status Badge */}
            <div className="mt-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                paymentDetails.paymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {paymentDetails.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}
              </span>
              
              {paymentDetails.paymentStatus === 'paid' && paymentDetails.paidAt && (
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Paid on:</strong> {new Date(paymentDetails.paidAt).toLocaleDateString()}</p>
                  <p><strong>Method:</strong> {paymentDetails.paymentMethod}</p>
                  <p><strong>Transaction ID:</strong> {paymentDetails.transactionId}</p>
                  {paymentDetails.remarks && <p><strong>Remarks:</strong> {paymentDetails.remarks}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAYMENT FORM */}
        {paymentDetails && paymentDetails.paymentStatus !== 'paid' && !loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Method */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Payment Method</label>
                <select
                  name="method"
                  value={paymentForm.method}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                </select>
              </div>

              {/* Amount Display */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Amount to Pay</label>
                <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-xl font-bold text-green-700">
                  ₹{paymentDetails.netSalary}
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Remarks (optional)</label>
              <textarea
                name="note"
                value={paymentForm.note}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add any payment notes or remarks..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl shadow-md text-lg transition font-semibold"
              >
                {loading ? 'Processing...' : '💰 Pay Now'}
              </button>
            </div>
          </form>
        )}

        {/* No Payment Record Message */}
        {selectedEmployee && selectedMonth && !paymentDetails && !loading && (
          <div className="text-center py-8 text-gray-500 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-lg font-semibold">⚠️ No payment record found</p>
            <p className="text-sm mt-2">No salary record exists for <strong>{employeeDetails?.name}</strong> in <strong>{selectedMonth}</strong>.</p>
            <p className="text-sm mt-1">The employee needs to check in/out to generate attendance and salary data.</p>
          </div>
        )}
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Payment History</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                <th className="p-3 border font-semibold">Date</th>
                <th className="p-3 border font-semibold">Employee</th>
                <th className="p-3 border font-semibold">Salary Month</th>
                <th className="p-3 border font-semibold">Net Salary</th>
                <th className="p-3 border font-semibold">Method</th>
                <th className="p-3 border font-semibold">Status</th>
                <th className="p-3 border font-semibold">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No Payment Records Available
                  </td>
                </tr>
              )}

              {payments.map((p, i) => (
                <tr
                  key={p._id}
                  className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                >
                  <td className="p-3 border text-sm">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-3 border font-medium">{p.employee?.name || 'N/A'}</td>
                  <td className="p-3 border">{p.salaryMonth || '-'}</td>
                  <td className="p-3 border font-bold text-green-700">₹{p.netSalary || 0}</td>
                  <td className="p-3 border">{p.paymentMethod || '-'}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td className="p-3 border text-sm text-gray-600">{p.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayment;