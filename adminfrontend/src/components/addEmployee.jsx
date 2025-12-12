import React, { useState } from "react";
import axios from "axios";

export default function AddEmployeePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    salary: "",
    department: "",
    dateOfJoining: "",
    status: "active",
    // ❌ REMOVED createdBy - it's added separately from localStorage
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const adminId = localStorage.getItem("adminId");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // ✅ Validate adminId exists
    if (!adminId) {
      setMessage({ 
        type: "error", 
        text: "Admin ID not found. Please login again." 
      });
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // ✅ Append only non-empty form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // ✅ Append image if selected
      if (image) {
        submitData.append("image", image);
      }

      // ✅ Append createdBy ONLY ONCE
      submitData.append("createdBy", adminId);

      // Debug log
      console.log("Admin ID being sent:", adminId);

      const res = await axios.post(
        "http://localhost:9000/api/admin/addEmployee", 
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({ 
        type: "success", 
        text: res.data.message || "Employee added successfully!" 
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        position: "Employee",
        salary: "",
        department: "IT Department",
        dateOfJoining: "",
        status: "active",
      });
      setImage(null);
      setPreview(null);
      
    } catch (err) {
      console.error("Error:", err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Error occurred" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 flex justify-center items-start">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Add New Employee
        </h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-center text-white ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          
          <input
            type="number"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          
          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          
          <input
            type="date"
            name="dateOfJoining"
            value={formData.dateOfJoining}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="col-span-2 flex flex-col items-center">
            <label className="text-gray-600 font-semibold mb-2">
              Upload Employee Image (Auto Face Registration)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border p-2 rounded w-full"
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-32 h-32 object-cover rounded-full mt-3 shadow-md"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`col-span-2 mt-4 p-3 rounded-xl text-lg font-semibold shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Adding Employee..." : "Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}