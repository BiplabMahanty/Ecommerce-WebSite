import React, { useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../utils/toastMessage";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem("adminToken");
    

    // Redirect after a short delay
    setTimeout(() => {
      errorToast("please logIn")
      navigate("/login");
    }, 1500);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <LogOut size={50} className="mx-auto text-red-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Logging Out...</h2>
        <p className="text-gray-600">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
