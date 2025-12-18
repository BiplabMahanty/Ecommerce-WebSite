// ============================================
// Frontend: CheckInOut Component with Face Detection
// employeefrontend/src/components/EmployeePanel.jsx
// ============================================

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import "../componentsCss/CheckInOut.css";
import { useNavigate } from "react-router-dom";

export default function CheckInOut() {
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  
  // 🔥 Face detection states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [cameraError, setCameraError] = useState("");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const employeeId = localStorage.getItem("employeeId");

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // Put models in public/models folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("✅ Face detection models loaded");
      } catch (error) {
        console.error("❌ Error loading models:", error);
        alert("Failed to load face detection models");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!employeeId) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    fetchAttendance();
    checkFaceRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  useEffect(() => {
    let timer;
    if (isCheckedIn) {
      timer = setInterval(() => setCurrentDate(new Date()), 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn]);

  // Check if face is registered
  const checkFaceRegistration = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9000/api/employee/getEmployee/${employeeId}`
      );
      if (res.data && res.data.employee) {
        setFaceRegistered(res.data.employee.faceRegistered || false);
      }
    } catch (err) {
      console.error("Error checking face registration:", err);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API not supported in this browser.");
        return;
      }

      // Check for available video input devices first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some((d) => d.kind === "videoinput");
      if (!hasVideoInput) {
        setCameraError("No video input device found. Check your camera or drivers.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      // Save stream immediately so it can be stopped even if video ref isn't mounted yet
      streamRef.current = stream;

      // Show the modal first so video element mounts, then attach the stream
      setShowCamera(true);

      // Wait a short moment for the video element to mount, then attach stream
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video play() failed:", playErr);
          }
        }
      }, 150);
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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setFaceDetected(false);
    // clear canvas overlay
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Detect face and get descriptor
  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded) return null;

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        setFaceDetected(true);
        
        // Draw detection on canvas
        if (canvasRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }

        return Array.from(detections.descriptor);
      } else {
        setFaceDetected(false);
        return null;
      }
    } catch (error) {
      console.error("Face detection error:", error);
      return null;
    }
  };

  // Register face
  const handleRegisterFace = async () => {
    if (!modelsLoaded) {
      alert("Face detection models are still loading. Please wait.");
      return;
    }

    setIsRegistering(true);
    await startCamera();

    // Wait for camera to initialize
    setTimeout(async () => {
      const faceDescriptor = await detectFace();

      if (!faceDescriptor) {
        alert("❌ No face detected. Please position your face in the camera.");
        setIsRegistering(false);
        stopCamera();
        return;
      }

      try {
        const res = await axios.post("http://localhost:9000/api/employee/registerFace", {
          employeeId,
          faceDescriptor,
        });

        if (res.data && res.data.success) {
          alert("✅ Face registered successfully!");
          setFaceRegistered(true);
          stopCamera();
        } else {
          alert(res.data?.message || "Face registration failed");
        }
      } catch (err) {
        console.error("Face registration error:", err);
        alert(err.response?.data?.message || "Face registration failed");
      } finally {
        setIsRegistering(false);
      }
    }, 2000);
  };

  // Handle Check-In with face verification
  const handleCheckIn = async () => {
    if (!faceRegistered) {
      alert("⚠️ Please register your face first before checking in.");
      return;
    }

    if (!modelsLoaded) {
      alert("Face detection models are still loading. Please wait.");
      return;
    }

    setLoading(true);
    await startCamera();

    setTimeout(async () => {
      const faceDescriptor = await detectFace();

      if (!faceDescriptor) {
        alert("❌ No face detected. Please position your face in the camera.");
        setLoading(false);
        stopCamera();
        return;
      }

      try {
        const res = await axios.post("http://localhost:9000/api/employee/checkIn", {
          employeeId,
          faceDescriptor,
        });

        if (res.data && res.data.success) {
          alert(`✅ Check-in successful! Face verified (distance: ${res.data.distance})`);
          const checkInVal = res.data.attendance?.checkIn || null;
          setIsCheckedIn(true);
          setCheckInTime(checkInVal);
          setCheckOutTime(null);
          await fetchAttendance();
          stopCamera();
        } else {
          alert(res.data?.message || "Check-in failed");
        }
      } catch (err) {
        console.error("Check-in error:", err);
        alert(err.response?.data?.message || "Check-in failed");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  // Handle Check-Out with face verification
  const handleCheckOut = async () => {
    if (!modelsLoaded) {
      alert("Face detection models are still loading. Please wait.");
      return;
    }

    setLoading(true);
    await startCamera();

    setTimeout(async () => {
      const faceDescriptor = await detectFace();

      if (!faceDescriptor) {
        alert("❌ No face detected. Please position your face in the camera.");
        setLoading(false);
        stopCamera();
        return;
      }

      try {
        const res = await axios.post("http://localhost:9000/api/employee/checkOut", {
          employeeId,
          faceDescriptor,
        });

        if (res.data && res.data.success) {
          alert(`✅ Check-out successful! Face verified (distance: ${res.data.distance})`);
          const checkOutVal = res.data.attendance?.checkOut || null;
          setIsCheckedIn(false);
          setCheckOutTime(checkOutVal);
          await fetchAttendance();
          stopCamera();
        } else {
          alert(res.data?.message || "Check-out failed");
        }
      } catch (err) {
        console.error("Check-out error:", err);
        alert(err.response?.data?.message || "Check-out failed");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:9000/api/employee/getAttendance", {
        employeeId,
      });

      if (res.data && res.data.success) {
        setRecords(res.data.attendance || []);

        const today = new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });
        const todayRecord = (res.data.attendance || []).find(
          (record) => record.dateKey === today
        );

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
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "--:--:--";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString({
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) =>
    date.toLocaleDateString({
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="flex min-h-screen bg-[#E8F0F8]">
      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-8">Employee Attendance Panel (Face Recognition)</h2>

        {/* Face Registration Card */}
        {!faceRegistered && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">⚠️ Face Not Registered</h3>
            <p className="mb-4">Please register your face to enable attendance tracking.</p>
            <button
              onClick={handleRegisterFace}
              disabled={isRegistering || !modelsLoaded}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
            >
              {isRegistering ? "📸 Registering..." : "📷 Register Face"}
            </button>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl max-w-2xl">
              <h3 className="text-xl font-bold mb-4">
                {isRegistering ? "📸 Registering Face" : "👤 Face Verification"}
              </h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  width="640"
                  height="480"
                  className="rounded-lg"
                  style={{ zIndex: 0, background: "#000" }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0"
                  width="640"
                  height="480"
                  style={{ zIndex: 1, pointerEvents: "none", background: "transparent" }}
                />
              </div>
              <div className="mt-4 text-center">
                {faceDetected ? (
                  <p className="text-green-600 font-semibold">✅ Face Detected</p>
                ) : (
                  <p className="text-red-600 font-semibold">❌ No Face Detected</p>
                )}
                {cameraError && <p className="text-red-600 mt-2">{cameraError}</p>}
                <button
                  onClick={stopCamera}
                  className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
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
                      : "--:--:--"}
                  </p>
                </div>
              </div>
              <div className={`status-badge ${isCheckedIn ? "in" : "out"}`}>
                {isCheckedIn ? "Checked In" : "Checked Out"}
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
              <button
                onClick={handleCheckIn}
                disabled={isCheckedIn || loading || !modelsLoaded || !faceRegistered}
                className="btn btn-primary"
              >
                {loading ? "⏳ Processing..." : "✅ Check In (Face)"}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!isCheckedIn || loading || !modelsLoaded}
                className="btn btn-outline"
              >
                {loading ? "⏳ Processing..." : "🚪 Check Out (Face)"}
              </button>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="card bg-white p-8 rounded-2xl shadow-md overflow-auto max-h-[400px]">
          <div className="card-header mb-4">
            <h3 className="text-xl font-semibold mb-2">Attendance History</h3>
            <p className="text-sm text-gray-500">Your recent check-in and check-out records</p>
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
                      <td>{r.totalHours || "--"}</td>
                      <td>
                        <span className={`status-badge-table ${r.status || ""}`}>
                          {r.status || "-"}
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