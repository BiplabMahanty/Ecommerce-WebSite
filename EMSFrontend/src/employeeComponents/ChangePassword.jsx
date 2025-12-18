import React, { useState } from "react";
import axios from "axios";
import { generateError, generateSuccess } from "../util";
import { head } from "../../../backend/router/adminRouter";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("employeeToken");
  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("STEP 1: Submit clicked"); 
  console.log("Employee ID:", employeeId);

  if (!oldPassword || !newPassword || !confirmPassword) {
    console.log("STEP 2: Missing fields");
    return generateError("All fields are required");
  }

  console.log("STEP 3: Fields OK");

  if (newPassword !== confirmPassword) {
    console.log("STEP 4: Password Mismatch");
    return generateError("Passwords do not match");
  }

  console.log("STEP 5: Passwords match");

  console.log("STEP 6: Before try");

  try {
    console.log("STEP 7: Inside try");

    const res = await axios.post("http://localhost:9000/api/employee/change-password",{
      header: { Authorization: `Bearer ${token}` }
    }, {
      employeeId,
      oldPassword,
      newPassword,
    });

    console.log("STEP 8: Response received:", res.data);

    if (res.data.success) {
      generateSuccess("Password Updated Successfully");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 1500);
    } else {
      generateError(res.data.message || "Failed to update password");
    }
  } catch (error) {
    console.log("STEP 9: Axios error", error);
    generateError("Something went wrong");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
        <h2 className="text-3xl font-bold text-center mb-6">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-semibold">Old Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-lg"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">New Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-lg"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Confirm Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-lg"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Update Password
          </button>
        </form>

        <button
          className="w-full mt-4 text-blue-600 font-semibold underline"
          onClick={() => (window.location.href = "/Sidebar")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
