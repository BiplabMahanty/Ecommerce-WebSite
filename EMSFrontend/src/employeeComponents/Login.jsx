import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { errorToast,successToast } from "../utils/toastMessage";

function LoginForm({ onSwitchToSignup, onSwitchToOTP }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:9000/api/employee/login",
        { email: email.trim().toLowerCase(), password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        const token = res.data.jwtToken || res.data.token;
        if (!token) {
          setServerError("Login failed: No authentication token received.");
          setLoading(false);
          return;
        }

        const decodedToken = decodeJWT(token);
        const employeeId = decodedToken?._id || decodedToken?.id || decodedToken?.employeeId;

        if (!employeeId) {
          setServerError("Login failed: employee ID not found in token.");
          setLoading(false);
          return;
        }

        const employeeData = {
          _id: employeeId,
          email: res.data.email || email.trim().toLowerCase(),
          name: res.data.name || "",
          phone: res.data.phone || "",
          role: decodedToken?.role || "employee",
        };

        localStorage.setItem("employeeToken", token);
        localStorage.setItem("employeeInfo", JSON.stringify(employeeData));
        localStorage.setItem("employeeId", employeeId);

        successToast("Login !");
        console.log("Login successful:", res.data);
         setTimeout(() => {
        
        window.location.href = "/employee";
      }, 500);
        console.log("Logged in employee ID:", employeeId);
      } else {
        setServerError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const errorMsg = err.response.data?.message || "Login failed";

        if (status === 403 && errorMsg.includes("verify your email")) {
          setServerError(errorMsg);
          if (onSwitchToOTP) {
            setTimeout(() => onSwitchToOTP(email.trim().toLowerCase()), 2000);
          }
        } else if (status === 400) {
          setServerError(errorMsg);
        } else {
          setServerError(`Error: ${errorMsg}`);
        }
      } else if (err.request) {
        setServerError("No response from server. Please check your connection.");
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 my-6 font-inter">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your account</p>
      </div>

      {serverError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <strong className="block font-medium">Error:</strong>
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div className="flex justify-end mb-1">
          <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => {/* handle forgot */}}>
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="flex items-center my-5">
        <hr className="flex-grow border-t border-gray-200" />
        <span className="px-3 text-sm text-gray-400">Or</span>
        <hr className="flex-grow border-t border-gray-200" />
      </div>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
