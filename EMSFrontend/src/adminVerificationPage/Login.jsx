import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { generateError, generateSuccess } from "../utils";

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

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
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
      const res = await axios.post(
        "http://localhost:9000/api/admin/login",
        formData
      );

      if (res.data.success) {
        const token = res.data.token || res.data.jwtToken;
        const decodedToken = decodeJWT(token);

        const adminId =
          decodedToken?._id ||
          decodedToken?.id ||
          decodedToken?.adminId;

        const adminInfo = {
          _id: adminId,
          email: res.data.email || formData.email,
          name: res.data.name || "Admin",
          role: decodedToken?.role || "admin"
        };

        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminInfo", JSON.stringify(adminInfo));
        localStorage.setItem("adminId", adminId);

        generateSuccess("Login successful!");
        setTimeout(() => navigate("/admin/"), 500);
      } else {
        generateError(res.data.message || "Login failed");
      }
    } catch (error) {
      generateError(
        error.response?.data?.message || "Server connection error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-rose-100">
      <div className="w-full max-w-md bg-rose-300 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-rose-900 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-md border-b-2 border-orange-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 text-rose-900 placeholder-red-600"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-md border-b-2 border-orange-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 text-rose-900 placeholder-red-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-rose-900 mt-4">
            Create new account for ADMIN?{" "}
            <Link
              to="/signup"
              className="text-blue-700 font-semibold hover:underline"
            >
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
