import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import "../componentsCss/CheckInOut.css";

import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../utils/toastMessage";
//if checkin is true then show checkout  else show checkin 
export default function CheckInOut() {
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Face detection states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [verificationMode, setVerificationMode] = useState(null); // 'checkin' or 'checkout'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Get employeeId from localStorage
  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("employeeToken");
  console.log("Employee ID:", employeeId);
  console.log("Token:", token);
  console.log("TODAY ATTENDANCE:", todayAttendance);
  console.log("button", todayAttendance?.buttonCheckIn);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("Face-api models loaded");
      } catch (err) {
        console.error("Error loading face-api models", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!employeeId) {
      errorToast("Please login first");
      navigate("/login");
      return;
    }
    fetchAttendance();
  }, [employeeId, navigate]);

  useEffect(() => {
    let timer;
    if (isCheckedIn) {
      timer = setInterval(() => setCurrentDate(new Date()), 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn]);

  // Start camera
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API not supported in this browser.");
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some((d) => d.kind === "videoinput");
      if (!hasVideoInput) {
        setCameraError("No video input device found. Check your camera or drivers.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 240, height: 180 } 
      });
      streamRef.current = stream;
      setShowCamera(true);

      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          try { 
            await videoRef.current.play(); 
          } catch (e) { 
            console.warn('video play failed', e); 
          }
        }
      }, 50);

      setCameraError("");
    } catch (error) {
      console.error("Camera error:", error);
      const msg =
        error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError"
          ? "Permission denied. Please allow camera access in the browser."
          : error?.name === "NotFoundError"
          ? "No camera found."
          : "Unable to access camera.";
      setCameraError(msg);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setFaceDetected(false);
    setVerificationMode(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Detect face and return descriptor
  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded) return null;
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceDetected(false);
        return null;
      }

      setFaceDetected(true);
      if (canvasRef.current) {
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resized = faceapi.resizeResults(detection, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resized);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      }

      return Array.from(detection.descriptor);
    } catch (err) {
      console.error('Face detection error', err);
      return null;
    }
  };

// Replace your handleCheckInFace function with this fixed version

const handleCheckInFace = async () => {
  if (!modelsLoaded) {
    errorToast("Face models still loading");
    return;
  }

  setVerificationMode("checkin");
  setLoading(true);
  await startCamera();

  setTimeout(async () => {
    const descriptor = await detectFace();
    if (!descriptor) {
      errorToast("No face detected. Please position your face.");
      setLoading(false);
      stopCamera();
      return;
    }

    // Get location before sending request
    if (!navigator.geolocation) {
      errorToast("Geolocation is not supported by your browser");
      setLoading(false);
      stopCamera();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        try {
          console.log("Sending check-in with location:", location);
          
          const res = await axios.post(
            "http://localhost:9000/api/employee/checkIn",
            {
              employeeId,
              faceDescriptor: descriptor,
              location,
            },{
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (res.data?.success) {
            successToast(`Check-in successful!`);
            setIsCheckedIn(true);
            setCheckInTime(res.data.attendance?.checkIn || null);
            await fetchAttendance();
          } else {
            errorToast(res.data?.message || "Check-in failed");
          }
        } catch (err) {
          console.error("Check-in error:", err);
          const errorMsg = err.response?.data?.message || "Check-in failed. Please try again.";
          errorToast(errorMsg);
        } finally {
          setLoading(false);
          stopCamera();
        }
      },
      (err) => {
        console.error("Location error:", err);
        let errorMsg = "Location access required for check-in.";
        
        if (err.code === 1) {
          errorMsg = "Location permission denied. Please enable location access in your browser settings.";
        } else if (err.code === 2) {
          errorMsg = "Location unavailable. Please check your device settings.";
        } else if (err.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }
        
        errorToast(errorMsg);
        setLoading(false);
        stopCamera();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, 100);
};


  // Check-out using face verification
 // Replace your handleCheckOutFace function with this version

const handleCheckOutFace = async () => {
  if (!modelsLoaded) {
    errorToast('Face models still loading');
    return;
  }

  setVerificationMode('checkout');
  setLoading(true);
  await startCamera();

  setTimeout(async () => {
    const descriptor = await detectFace();
    if (!descriptor) {
      errorToast('No face detected. Please position your face clearly in the camera.');
      setLoading(false);
      stopCamera();
      return;
    }

    // Get location before checkout
    if (!navigator.geolocation) {
      errorToast("Geolocation is not supported by your browser");
      setLoading(false);
      stopCamera();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        try {
          console.log("Sending check-out with location:", location);

          const res = await axios.post(
            'http://localhost:9000/api/employee/checkOut',
            {
              employeeId,
              faceDescriptor: descriptor,
              location,
            },{
              headers: { Authorization: `Bearer ${token}`}         
           }
          );

          if (res.data?.success) {
            successToast(`Check-out successful! Match confidence: ${res.data.matchConfidence || 'verified'}`);
            setIsCheckedIn(false);
            setCheckOutTime(res.data.attendance?.checkOut || null);
            await fetchAttendance();
          } else {
            errorToast(res.data?.message || 'Check-out failed');
          }
        } catch (err) {
          console.error('Check-out error:', err);
          errorToast(err.response?.data?.message || 'Check-out failed. Please try again.');
        } finally {
          setLoading(false);
          stopCamera();
        }
      },
      (err) => {
        console.error("Location error:", err);
        let errorMsg = "Location access required for check-out.";
        
        if (err.code === 1) {
          errorMsg = "Location permission denied. Please enable location access in your browser settings.";
        } else if (err.code === 2) {
          errorMsg = "Location unavailable. Please check your device settings.";
        } else if (err.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }
        
        errorToast(errorMsg);
        setLoading(false);
        stopCamera();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, 100);
};
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:9000/api/employee/getAttendance' ,
       { employeeId },{
              headers: { Authorization: `Bearer ${token}`}         
           }
      );
      
      if (res.data && res.data.success) {
        setRecords(res.data.attendance || []);
        setTodayAttendance(res.data.todayAttendance || null);
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const todayRecord = (res.data.attendance || []).find(r => r.dateKey === today);
        
        if (todayRecord) {
          setTodayAttendance(todayRecord);
          setIsCheckedIn(Boolean(todayRecord.checkIn && !todayRecord.checkOut));
          setCheckInTime(todayRecord.checkIn || null);
          setCheckOutTime(todayRecord.checkOut || null);
        } else {
          setTodayAttendance(null); 
          setIsCheckedIn(false); 
          setCheckInTime(null); 
          setCheckOutTime(null);
        }
      }
    } catch (err) { 
      console.error('Error fetching attendance', err); 
    } finally { 
      setLoading(false); 
    }
  };
  const attendanceStatus = todayAttendance?.buttonCheckIn || null;
  console.log("Attendance Status:", attendanceStatus);
  console.log("Records:", records);

  const formatTime = (date) => {
    if (!date) return "--:--:--";
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString({ 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (date) => date.toLocaleDateString({ 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex min-h-screen bg-[#E8F0F8]">
      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-8">
           Employee Attendance Panel (Face Recognition)
        </h2>

        {/* Camera Modal */}
        {showCamera && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white shadow-2xl rounded-2xl p-6 w-[380px] text-center">

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">
        {verificationMode === "checkin"
          ? "✅ Check-In Verification"
          : "🚪 Check-Out Verification"}
      </h2>

      <p className="text-gray-500 mb-4 text-sm">
        Please align your face within the frame
      </p>

      {/* Camera Frame */}
      <div className="relative w-full h-[260px] bg-black rounded-xl overflow-hidden border-4 border-blue-500">

        {/* Camera Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          style={{ background: "#000" }}
        />

        {/* Canvas Overlay (Face Detection) */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Face Alignment Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 border-4 border-dashed border-white rounded-full"></div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4">
        {faceDetected ? (
          <p className="text-green-600 font-semibold">
            ✅ Face Detected – Verifying...
          </p>
        ) : (
          <p className="text-red-600 font-semibold">
            ❌ No Face Detected
          </p>
        )}

        {cameraError && (
          <p className="text-red-600 text-sm mt-2">
            {cameraError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <button
          onClick={stopCamera}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-xl transition"
        >
          Cancel
        </button>

        <button
          disabled={!faceDetected}
          className={`w-full py-2 rounded-xl text-white transition
            ${faceDetected
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
            }`}
        >
          Verify Face
        </button>
      </div>

    </div>
  </div>
)}


        {/* Check In / Check Out Card */}
        <div className="bg-white p-8 rounded-2xl shadow-md mb-10">
          <h3 className="text-xl font-semibold mb-6">Check In / Check Out</h3>

          <div className="card-content">
            <div className="time-section">
              <div className="time-info">
                <div className="clock-icon">🕒</div>
                <div>
                  <p className="label">Current Time</p>
                  <p className="current-time">
                    {isCheckedIn 
                      ? formatTime(new Date()) 
                      : checkOutTime 
                      ? formatTime(checkOutTime) 
                      : '--:--:--'}
                  </p>
                </div>
              </div>
              <div className={`status-badge ${isCheckedIn ? 'in' : 'out'}`}>
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </div>
            </div>

            <div className="time-grid mt-6">
              <div className="time-card">
                <p className="label">Check-In Time</p>
                <p className="time-value">{formatTime(checkInTime)}</p>
              </div>
              <div className="time-card">
                <p className="label">Check-Out Time</p>
                <p className="time-value">{formatTime(checkOutTime)}</p>
              </div>
            </div>

            <div className="button-row mt-6">
              {attendanceStatus ===1 ? (
                  <button
                    onClick={handleCheckOutFace}
  
                    className="btn btn-primary"
                 >
    
                       "🚪 Check Out (Face)"
                  </button>
                 
                ) : (
                  <button
                    onClick={handleCheckInFace}
 
                   className="btn btn-primary"
                  >
                    "✅ Check In (Face)"
                  </button>
                  
                )}

            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="card bg-white p-8 rounded-2xl shadow-md overflow-auto max-h-[400px]">
          <div className="card-header mb-4">
            <h3 className="text-xl font-semibold mb-2">Attendance History</h3>
            <p className="text-sm text-gray-500">
              Your recent check-in and check-out records
            </p>
          </div>

          <div className="card-content">
            {loading && records.length === 0 ? (
              <p className="loading">Loading attendance...</p>
            ) : records.length === 0 ? (
              <div className="empty-state">
                <div className="clock-large">🕓</div>
                <p>No attendance records yet</p>
                <span>Check in to start tracking your attendance</span>
              </div>
            ) : (
              <table className="history-table w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr key={r._id || idx}>
                      <td>{r.dateKey}</td>
                      <td>{formatTime(r.checkIn)}</td>
                      <td>{formatTime(r.checkOut)}</td>
                      <td>{r.totalHours || '--'}</td>
                      <td>
                        <span className={`status-badge-table ${r.status || ''}`}>
                          {r.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}