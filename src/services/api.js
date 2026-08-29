import axios from "axios";
import { buildMockPrediction } from "./mockData";

// All backend communication is centralized here. Components should never
// call axios directly — they go through this service so the mock layer
// can be swapped for the real FastAPI + PyTorch backend with zero UI changes.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 20000;

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

export class BackendUnavailableError extends Error {
  constructor(message = "Unable to connect to the analysis server. Please verify that the FastAPI backend is running.") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

export class InvalidImageError extends Error {
  constructor(message = "This file could not be processed. Upload a JPG or PNG chest X-ray image.") {
    super(message);
    this.name = "InvalidImageError";
  }
}

/**
 * POST /api/predict
 * Sends a chest X-ray image to the backend and returns the structured
 * prediction, explainability artifacts, and performance metrics.
 *
 * Expected response shape (see README / backend contract):
 * {
 *   prediction, confidence, probabilities, classes,
 *   segmentation_image, gradcam_image, gradcam_plus_image, lime_image,
 *   inference_time, timings_ms, model_size_mb,
 *   uncertainty, calibration_status, explanation_quality
 * }
 */
export const analyzeXray = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await client.post("/api/predict", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ...response.data, demo: false };
  } catch (error) {
    if (error.response?.status === 422 || error.response?.status === 400) {
      throw new InvalidImageError(error.response?.data?.detail);
    }
    throw new BackendUnavailableError();
  }
};

/**
 * Runs the same shape of response as analyzeXray, but entirely client-side,
 * for UI development and for DEMO MODE when the backend cannot be reached.
 * caseIndex cycles through a small set of representative demo cases.
 */
export const analyzeXrayDemo = async (caseIndex = 0) => {
  // Simulate network + inference latency so loading states are exercised.
  await new Promise((resolve) => setTimeout(resolve, 1400 + Math.random() * 600));
  return buildMockPrediction(caseIndex);
};

/**
 * GET /api/health — lightweight backend availability check.
 */
export const checkBackendHealth = async () => {
  try {
    const response = await client.get("/api/health", { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * GET /api/history — analysis history (if the backend persists it).
 * Falls back to null so the UI can use local/demo history instead.
 */
export const fetchHistory = async () => {
  try {
    const response = await client.get("/api/history");
    return response.data;
  } catch {
    return null;
  }
};

export default {
  analyzeXray,
  analyzeXrayDemo,
  checkBackendHealth,
  fetchHistory,
};
