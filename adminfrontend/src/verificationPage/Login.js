import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { generateError, generateSuccess } from "../util";
import "../verificationCss/login.css";
import { Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Decode JWT token to extract admin data
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return generateError("Please fill all fields!");
    }

    setLoading(true);

    try {
      console.log("📤 Sending admin login request...");

      const res = await axios.post(
        "http://localhost:9000/api/admin/login",
        formData
      );

      console.log("✅ Admin login response:", res.data);

      if (res.data.success) {
        const token = res.data.token || res.data.jwtToken;
        
        if (!token) {
          generateError("Login failed - No token received");
          console.error("❌ No token in response");
          return;
        }

        console.log("🔑 Token received:", token);

        // Decode JWT to get admin ID
        const decodedToken = decodeJWT(token);
        console.log("🔓 Decoded token:", decodedToken);
        const adminId = decodedToken?._id || decodedToken?.id || decodedToken?.adminId;
        console.log("admin",adminId)

        // Create admin info object
        let adminInfo = {
          _id: decodedToken?._id || decodedToken?.id || decodedToken?.userId,
          email: res.data.email || formData.email,
          name: res.data.name || res.data.admin?.name || "Admin",
          role: decodedToken?.role || "admin",
        };

        // If admin data is provided in response, use it
        if (res.data.admin) {
          adminInfo = {
            ...adminInfo,
            ...res.data.admin
          };
        }

        console.log("👤 Admin info to store:", adminInfo);

        // Store token and admin info in localStorage
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminInfo", JSON.stringify(adminInfo));
        localStorage.setItem("adminId", adminId);

        // Verify storage
        console.log("💾 Verification - Stored in localStorage:");
        console.log("  - adminToken:", localStorage.getItem("adminToken") ? "✓" : "✗");
        console.log("  - adminInfo:", localStorage.getItem("adminInfo") ? "✓" : "✗");
        console.log("  - adminId:", localStorage.getItem("adminId") ? "✓" : "✗");
        
        const storedAdminInfo = localStorage.getItem("adminInfo");
        if (storedAdminInfo) {
          const parsedAdmin = JSON.parse(storedAdminInfo);
          console.log("  - Verified adminInfo:", parsedAdmin);
          console.log("  - Admin ID:", parsedAdmin._id);
        }

        generateSuccess("Login successful!");
        console.log("🎉 Admin login successful! Redirecting to dashboard...");
        
        setTimeout(() => navigate("/admin/"), 500);
      } else {
        generateError(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      if (error.response) {
        console.error("Backend error:", error.response.data);
        generateError(error.response.data.message || "Invalid credentials");
      } else {
        generateError("Server connection error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <li className="signup">
            <p>create new account for ADMIN
            <Link to="/signup">Signup</Link></p>
          </li>
        </form>
      </div>
    </div>
  );
}

export default Login;