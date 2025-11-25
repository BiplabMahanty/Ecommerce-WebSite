import React from "react";
import "../index.css";
import "../verificationCss/signup.css";
import { ToastContainer } from "react-toastify";
import { generateError, generateSuccess } from "../util";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();

  const [signupInfo, setSignupInfo] = React.useState({
    name: "",
    email: "",
    password: "",
    address: "",
    number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo({ ...signupInfo, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, address, number } = signupInfo;

    // Check if all fields are filled
    if (!name || !email || !password || !address || !number) {
      generateError("Please fill all fields");
      return;
    }

    try {
      // Send signup data to backend
      const res = await axios.post("http://localhost:9000/api/admin/signup", {
        name,
        email,
        password,
        address,
        number,
      });

      if (res.data.success) {
        generateSuccess(res.data.message);
        // Redirect to OTP verification page
        navigate("/verify-otp", { state: { email } });
      } else {
        generateError(res.data.message);
      }
    } catch (error) {
      console.error(error);
      generateError("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="container">
      <h1>Signup</h1>

      <form className="form" onSubmit={handleSignup}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name..."
            value={signupInfo.name}
            onChange={handleChange}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email..."
            value={signupInfo.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password..."
            value={signupInfo.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter your address..."
            value={signupInfo.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="number">Number</label>
          <input
            type="text"
            name="number"
            placeholder="Enter your number..."
            value={signupInfo.number}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit</button>

        <span>
          Already have an account? <Link to="/login">Login</Link>
        </span>

        <ToastContainer />
      </form>
    </div>
    </div>
  );
}

export default Signup;
