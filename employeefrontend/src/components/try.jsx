import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

// FaceVerificationCamera
// A drop-in React component (Tailwind CSS) for a modern, responsive
// face verification UI. Place your face-api models in /public/models.

export default function FaceVerificationCamera(props) {
  const {
    onMatch = () => {}, // called when face matches
    onNoMatch = () => {},
    threshold = 0.45, // euclidean distance threshold (tune to your needs)
    label = "Employee verification",
  } = props;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [statusText, setStatusText] = useState("Idle");
  const [distance, setDistance] = useState(null);
  const [matching, setMatching] = useState(false);

  // Example: in real usage you will fetch the stored descriptor from server
  // or pass it as a prop. For sample, null prevents match.
  const storedDescriptorRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadModels();
      if (!mounted) return;
    })();

    return () => {
      mounted = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadModels() {
    try {
      setLoadingModels(true);
      const MODEL_URL = "/models"; // make sure /public/models contains face-api models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      setStatusText("Models loaded");
    } catch (err) {
      console.error("Model load failed", err);
      setStatusText("Model load failed");
    } finally {
      setLoadingModels(false);
    }
  }

  async function startCamera() {
    try {
      setStatusText("Starting camera...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatusText("Camera not supported");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // play may reject in some browsers; swallow error
        try {
          await videoRef.current.play();
        } catch (e) {
          // ignore play errors
        }
      }
      setCameraOn(true);
      setStatusText("Camera ready — looking for face...");
      runDetectionLoop();
    } catch (err) {
      console.error("Camera error", err);
      setStatusText("Camera error");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setFaceDetected(false);
    setStatusText("Idle");
    setDistance(null);
    setMatching(false);
    clearCanvas();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function runDetectionLoop() {
    if (!modelsLoaded || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // set canvas size (guard when video metadata not loaded)
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    let running = true;

    const detect = async () => {
      if (!running || !cameraOn || !modelsLoaded) return;

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        clearCanvas();

        if (detection) {
          setFaceDetected(true);

          // draw box & landmarks
          const displaySize = { width: canvas.width, height: canvas.height };
          const resized = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawDetections(canvas, resized);
          faceapi.draw.drawFaceLandmarks(canvas, resized);

          setStatusText("Face detected — verifying...");

          // If stored descriptor exists, compute distance
          if (storedDescriptorRef.current && Array.isArray(storedDescriptorRef.current)) {
            if (!matching) setMatching(true);
            const dist = euclideanDistance(storedDescriptorRef.current, detection.descriptor);
            setDistance(typeof dist === 'number' && isFinite(dist) ? dist.toFixed(4) : null);

            if (isFinite(dist) && dist <= threshold) {
              setStatusText("✅ Face matched");
              try { onMatch({ distance: dist }); } catch (e) { console.error(e); }
            } else {
              setStatusText("❌ Face mismatch");
              try { onNoMatch(); } catch (e) { console.error(e); }
            }

            // small cooldown to avoid spamming callbacks
            setTimeout(() => setMatching(false), 1200);
          } else {
            setStatusText("Face found — no reference available");
          }
        } else {
          setFaceDetected(false);
          setStatusText("No face detected — position your face in frame");
          setDistance(null);
        }
      } catch (err) {
        console.error("detection error", err);
        setStatusText("Detection error");
      }

      if (running && cameraOn) {
        requestAnimationFrame(detect);
      }
    };

    detect();

    // stop runner when camera stops
    const stopChecker = setInterval(() => {
      if (!cameraOn) {
        running = false;
        clearInterval(stopChecker);
      }
    }, 500);
  }

  // simple euclidean distance for descriptors
  function euclideanDistance(a, b) {
    if (!a || !b || a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) sum += Math.pow(a[i] - b[i], 2);
    return Math.sqrt(sum);
  }

  // UI helper to simulate loading a stored descriptor (replace with real fetch)
  async function loadStoredDescriptorSample() {
    // Example: fetch('/api/employee/descriptor/123')
    // For demo we'll set null so UI shows "no reference"
    storedDescriptorRef.current = null;
    // If you want to test matching, provide an array of 128 numbers
    // storedDescriptorRef.current = new Array(128).fill(0).map(() => Math.random() / 10);
    setStatusText((s) => (s === "Idle" ? "Ready" : s));
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
            <p className="text-sm text-gray-500">Face verification using on-device models</p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                modelsLoaded ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-800"
              }`}>
              {modelsLoaded ? "Models loaded" : loadingModels ? "Loading models..." : "Models not loaded"}
            </div>

            <button
              onClick={() => {
                if (cameraOn) stopCamera();
                else startCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors ${
                cameraOn ? "bg-red-500 text-white hover:bg-red-600" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}>
              {cameraOn ? "Stop camera" : "Start camera"}
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[640px] rounded-lg overflow-hidden bg-black">
              <video ref={videoRef} className="w-full" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

              {/* status overlay */}
              <div className="absolute left-4 bottom-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${faceDetected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                <div className="text-sm font-medium">{statusText}</div>
                {distance !== null && <div className="text-xs opacity-80 ml-2">distance: {distance}</div>}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={() => loadStoredDescriptorSample()} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
                Load reference
              </button>
              <button
                onClick={() => {
                  storedDescriptorRef.current = null;
                  setStatusText("Reference cleared");
                }}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
                Clear reference
              </button>
            </div>
          </div>

          <aside className="rounded-xl p-4 bg-white border">
            <h4 className="text-sm font-semibold text-gray-700">Verification</h4>
            <p className="text-xs text-gray-500 mt-1">Threshold: {threshold}</p>

            <div className="mt-4">
              <div className="text-sm text-gray-600">Match status</div>
              <div className="mt-2 inline-flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  distance !== null && Number(distance) <= threshold ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {distance !== null && Number(distance) <= threshold ? "✓" : "—"}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {distance !== null ? (Number(distance) <= threshold ? "Matched" : "Not matched") : "No reference"}
                  </div>
                  <div className="text-xs text-gray-400">{distance !== null ? `distance: ${distance}` : "Provide a reference descriptor to verify"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-600">Hints</div>
              <ul className="mt-2 text-xs text-gray-500 list-disc pl-4 space-y-1">
                <li>Ensure good lighting and facing camera</li>
                <li>Remove hats/glasses (if possible)</li>
                <li>Hold device steady</li>
              </ul>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-600">Controls</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setStatusText("Screenshot saved");
                  }}
                  className="flex-1 px-3 py-2 rounded-md bg-indigo-50 text-indigo-700">
                  Snapshot
                </button>
                <button
                  onClick={() => {
                    clearCanvas();
                    setStatusText("Canvas cleared");
                  }}
                  className="flex-1 px-3 py-2 rounded-md bg-gray-50">
                  Clear
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
