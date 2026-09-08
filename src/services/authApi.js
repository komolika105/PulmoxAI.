import axios from "axios";

// Mirrors services/api.js: all auth calls go through here so the storage
// mechanism (currently browser localStorage, for frontend-only development)
// can be swapped for a real FastAPI + JWT/session backend with no changes
// to consuming components. Replace the LOCAL_MODE block with the axios
// calls already sketched below once the backend exists.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const LOCAL_MODE = false;
const SESSION_KEY = "pulmoxai_session";
const TOKEN_KEY = "pulmoxai_token";

export const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// Attach JWT token to requests if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

export const signup = async ({ name, email, password }) => {
  try {
    const response = await client.post("/api/auth/signup", { name, email, password });
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  } catch (err) {
    throw new AuthError(err.response?.data?.detail || "Unable to create account. Please try again.");
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await client.post("/api/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  } catch (err) {
    throw new AuthError(err.response?.data?.detail || "Incorrect email or password.");
  }
};

export const logout = async () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export default { signup, login, logout, getSession };
