import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { errorToast,successToast } from "../utils/toastMessage";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth data

    localStorage.removeItem("adminToken");

    localStorage.removeItem("adminInfo");
    successToast("Logout Successful !");
    navigate("/admin/login");

  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page (Dashboard)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center w-[350px]">
        <LogOut size={55} className="mx-auto text-red-600 mb-5" />

        <h2 className="text-2xl font-bold mb-2">Are you sure?</h2>
        <p className="text-gray-600 mb-6">Do you really want to log out?</p>

        {/* Button Row */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="w-1/2 py-2 bg-gray-300 text-black font-semibold rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            className="w-1/2 py-2 bg-red-600 text-white font-semibold rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
