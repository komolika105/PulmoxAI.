import axios from "axios";
import { buildMockPrediction } from "./mockData";

// All backend communication is centralized here. Components should never
// call axios directly — they go through this service so the mock layer
// can be swapped for the real FastAPI + PyTorch backend with zero UI changes.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 20000;

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulmoxai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

export const analyzeXrayDemo = async (caseIndex = 0) => {
  await new Promise((resolve) => setTimeout(resolve, 1400 + Math.random() * 600));
  return buildMockPrediction(caseIndex);
};

export const checkBackendHealth = async () => {
  try {
    const response = await client.get("/api/health", { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const fetchHistory = async () => {
  try {
    const response = await client.get("/api/history");
    return response.data;
  } catch {
    return null;
  }
};

export const exportReport = async (reportData) => {
  try {
    const response = await client.post("/api/report/export", {
      patient_name: reportData.patient_name || "Patient Scan",
      prediction: reportData.prediction,
      confidence: reportData.confidence,
      probabilities: reportData.probabilities,
      gradcam_image: reportData.gradcam_image,
    }, {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PulmoXAI_Report_${reportData.prediction.replace(/\s+/g, "_")}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (error) {
    console.error("Failed to export PDF report:", error);
    throw error;
  }
};
export const fetchGeminiExplanation = async (data) => {
  const response = await client.post("/api/explain", data);
  return response.data;
};

export const sendGeminiChat = async (data) => {
  const response = await client.post("/api/explain/chat", data);
  return response.data;
};

export default {
  client,
  post: (url, data, config) => client.post(url, data, config),
  get: (url, config) => client.get(url, config),
  analyzeXray,
  analyzeXrayDemo,
  checkBackendHealth,
  fetchHistory,
  exportReport,
  fetchGeminiExplanation,
  sendGeminiChat,
};
