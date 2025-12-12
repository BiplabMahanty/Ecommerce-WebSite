const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData, loadImage } = canvas;
const path = require("path");

// Patch environment for face-api.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_URL = path.join(__dirname, "/models"); // place models folder inside backend/models

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
}
loadModels();

async function getFaceDescriptorFromImage(imagePath) {
  const img = await loadImage(imagePath);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return Array.from(detection.descriptor);
}

module.exports = { getFaceDescriptorFromImage };
