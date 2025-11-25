import React, { useState, useEffect } from "react";
import "../verificationCss/otpVerification.css";
import { ToastContainer } from "react-toastify";
import { generateError, generateSuccess } from "../util";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyOTP() {
  const navigate = useNavigate();
  const [otpInfo, setOtpInfo] = useState({ email: "", otp: "" });
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [otpExpired, setOtpExpired] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOtpInfo({ ...otpInfo, [name]: value });
  };


  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setOtpExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  
  const handleVerify = async(e) => {
    e.preventDefault();
    if (otpExpired) {
      generateError("OTP has expired. Please request a new one.");
      return;
    }

    const { email, otp } = otpInfo;
    if (!email || !otp) {
      generateError("Please fill all fields");
      return;
    }

    if (otp.length !== 6) {
      generateError("OTP must be 6 digits");
      return;
    }

    
    try {
      // Send signup data to backend
      const res = await axios.post("http://localhost:9000/api/admin/verifyOtp", {
        email,
        otp,
      });

      if (res.data.success) {
        generateSuccess(res.data.message);
        // Redirect to OTP verification page
        navigate("/login", { state: { email } });
      } else {
        generateError(res.data.message);
      }
    } catch (error) {
      console.error(error);
      generateError("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="otp-container">
      <h1>OTP Verification</h1>
      <form className="otp-form" onSubmit={handleVerify}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email..."
            value={otpInfo.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="otp">OTP</label>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otpInfo.otp}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Verify OTP</button>
      </form>

      <div className="timer">
        {otpExpired ? (
          <p className="expired">OTP expired. Please request a new one.</p>
        ) : (
          <p>Time remaining: {formatTime(timeLeft)}</p>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}

export default VerifyOTP;
