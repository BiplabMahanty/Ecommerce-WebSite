import React, { useState ,useEffect} from "react";
import axios from "axios";
import { errorToast,successToast } from "../utils/toastMessage";
import { useNavigate } from "react-router-dom";
export default function LeaveTypeManagement() {
    const navigate = useNavigate();
  const [assignMode, setAssignMode] = useState("department");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Leave type form state
  const [name, setName] = useState("");
  const [totalLeaves, setTotalLeaves] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [sandwichRule, setSandwichRule] = useState(false);
  const [applicableFrom, setApplicableFrom] = useState("");
  const [applicableTo, setApplicableTo] = useState("");
  const [carryForward, setCarryForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employeesByDepartment,setEmployeesByDepartment]=useState({});
  
  const token = localStorage.getItem("adminToken");

  console.log("departments:", departments);
  console.log("selectedDepartments:", selectedDepartments);
  console.log("employeesByDepartment:", employeesByDepartment);
  // Static demo data (replace with API later)
 

   useEffect(() => {
      fetchAllDepartments();
    }, []);
  
    const fetchAllDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:9000/api/admin/getAllDepartments",{ headers: {
            Authorization: `Bearer ${token}`
          }}  );
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error("Error loading employees", err);
      }
    };

  // const employeesByDepartment = {
  //   IT: ["Rahul", "Amit", "Sneha"],
  //   HR: ["Priya", "Neha"],
  //   Finance: ["Rohit", "Anjali"],
  // };
  
    useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9000/api/admin/getEmployeeByDepartment/${selectedDepartments}`,{ headers: {
            Authorization: `Bearer ${token}`
          }
          }
        );

        if (res.data.success) {
          setEmployeesByDepartment(res.data.employees);
        } else {
          setEmployeesByDepartment([]);
        }
      } catch (error) {
        console.log("Error loading employees", error);
        setEmployeesByDepartment([]);
      }
    };

    fetchEmployees();
  }, [selectedDepartments]);



 


  /* ------------------ helpers ------------------ */

  const toggleDepartment = (dept) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept)
        ? prev.filter((d) => d !== dept)
        : [...prev, dept]
    );
  };

  const toggleEmployee = (emp) => {
    setSelectedEmployees((prev) =>
      prev.includes(emp)
        ? prev.filter((e) => e !== emp)
        : [...prev, emp]
    );
  };

  const resetForm = () => {
    setName("");
    setTotalLeaves("");
    setIsPaid(true);
    setSandwichRule(false);
    setApplicableFrom("");
    setApplicableTo("");
    setCarryForward(false);
    setAssignMode("department");
    setSelectedDepartments([]);
    setSelectedEmployees([]);
  };

  /* ------------------ API ------------------ */

  const handleCreateLeaveType = async () => {
    try {
      if (!name || !totalLeaves || !applicableFrom || !applicableTo) {
        errorToast("Please fill all required fields");
        return;
      }

      if (new Date(applicableFrom) > new Date(applicableTo)) {
        errorToast("Applicable From date cannot be after Applicable To date");
        return;
      }

      if (assignMode === "department" && selectedDepartments.length === 0) {
        errorToast("Select at least one department");
        return;
      }

      if (assignMode === "employee" && selectedEmployees.length === 0) {
        errorToast("Select at least one employee");
        return;
      }

      setLoading(true);

      const payload = {
        name,
        totalLeaves: Number(totalLeaves),
        isPaid,
        sandwichRule,
        applicableFrom,
        applicableTo,
        assignMode,
        departments: assignMode === "department" ? selectedDepartments : [],
        employees: assignMode === "employee" ? selectedEmployees : [],
        carryForward,
      };

      await axios.post(
        "http://localhost:9000/api/admin/createLeaveType",
        payload
      );
      successToast("Leave type created successfully");
      resetForm();
     navigate("/admin/attendance/leaveType");
    } catch (error) {
      console.error(error);
      errorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 w-full">
     
      


     

      {/* Create Modal */}
    
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Create Leave Type</h2>

            {/* Name */}
            <input
              type="text"
              placeholder="Leave Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4"
            />

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                />
                Paid Leave
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sandwichRule}
                  onChange={(e) => setSandwichRule(e.target.checked)}
                />
                Sandwich Rule
              </label>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Applicable Date Range</p>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={applicableFrom}
                  onChange={(e) => setApplicableFrom(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <input
                  type="date"
                  value={applicableTo}
                  onChange={(e) => setApplicableTo(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {/* Leave Count */}
            <input
              type="number"
              placeholder="Leave Count"
              value={totalLeaves}
              onChange={(e) => setTotalLeaves(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4"
            />

            {/* Assign Mode */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Assign To</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setAssignMode("department")}
                  className={`px-4 py-2 rounded-lg ${
                    assignMode === "department"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Department
                </button>
                <button
                  onClick={() => setAssignMode("employee")}
                  className={`px-4 py-2 rounded-lg ${
                    assignMode === "employee"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Employee
                </button>
              </div>
            </div>

            {/* Department / Employee Selection */}
            {assignMode === "department" ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {departments.map((dept) => (
                  <label
                    key={dept}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept)}
                      onChange={() => toggleDepartment(dept)}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            ) : (
              departments.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4 border p-3 rounded-lg max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                {departments.map((dept) => (
                  <label
                    key={dept}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    <input
                      type="checkbox"
                      // checked={selectedDepartments.includes(dept)}
                      onChange={() => setSelectedDepartments(dept)}
                    />
                    {dept}
                  </label>
                ))}
              </div>
                
                  {employeesByDepartment.map((emp) => (
                      <label key={`${emp._id}`} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp._id)}
                          onChange={() => toggleEmployee(emp._id)}
                        />
                        {emp.name} 
                      </label>
                    ))
                  }
                </div>
              )
            )}

            {/* Carry Forward */}
            <label className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                checked={carryForward}
                onChange={(e) => setCarryForward(e.target.checked)}
              />
              Carry Forward
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  resetForm();
                 navigate("/admin/attendance/leaveType");
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLeaveType}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {loading ? "Creating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
  
    </div>
  );
}
