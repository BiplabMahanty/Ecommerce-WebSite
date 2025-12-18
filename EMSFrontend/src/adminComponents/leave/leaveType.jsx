import React, { useState ,useEffect} from "react";
import axios from "axios";
import { errorToast,successToast } from "../../utils/toastMessage";
import { NavLink, Outlet } from "react-router-dom";

export default function LeaveTypeManagement() {


  
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState(null);
  
  const token = localStorage.getItem("adminToken");


  // Static demo data (replace with API later)
 



  
 

  useEffect(() => {
       fetchLeaveType();
  }, []);
    const fetchLeaveType = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9000/api/admin/getLeaveType", {
            headers: {
              Authorization: `Bearer ${token}`
            }
        }
        );
        setLeaveTypes(res.data.leaveTypes);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

 



  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leave Types</h1>
        <NavLink
          to="create-Leave-Type"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          + Create Leave Type
        </NavLink>
      </div>

      {/* Leave Type Cards (static for now) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cursor-pointer">
        {leaveTypes.map((type) => (
          <div
            key={type._id}
            value={type._id}
            className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg cursor-pointer"
            onClick={()=>setLeaveTypeId(type)}
          >
            <h2 className="text-xl font-semibold mb-2 cursor-pointer" >{type.name} Leave</h2>
            <p className="text-gray-600">Policy based leave type</p>
          </div>
        ))}
      </div>

     {leaveTypeId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative">

      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">
          {leaveTypeId.name}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Leave Type Details
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">

        <div className="flex justify-between">
          <span className="font-medium">Total Leaves</span>
          <span>{leaveTypeId.totalLeaves}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Paid Leave</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              leaveTypeId.isPaid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {leaveTypeId.isPaid ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Sandwich Rule</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              leaveTypeId?.sandwichRule
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {leaveTypeId?.sandwichRule ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Carry Forward</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              leaveTypeId?.carryForward
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {leaveTypeId?.carryForward ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Applicable From</span>
          <span>
            {new Date(leaveTypeId?.applicableFrom).toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Applicable To</span>
          <span>
            {new Date(leaveTypeId?.applicableTo).toLocaleDateString()}
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setLeaveTypeId(false)}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}


      {/* Create Modal */}
            <Outlet />
    </div>
  );
}
