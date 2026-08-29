import axios from "axios";

// Mirrors services/api.js: all auth calls go through here so the storage
// mechanism (currently browser localStorage, for frontend-only development)
// can be swapped for a real FastAPI + JWT/session backend with no changes
// to consuming components. Replace the LOCAL_MODE block with the axios
// calls already sketched below once the backend exists.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const LOCAL_MODE = true; // flip to false once /api/auth/* endpoints exist on the backend
const STORAGE_KEY = "pulmoxai_users";
const SESSION_KEY = "pulmoxai_session";

export const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function toPublicUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...publicUser } = user;
  return publicUser;
}

/**
 * POST /api/auth/signup — real backend contract to implement later:
 * body: { name, email, password } -> { token, user: { id, name, email, createdAt } }
 */
export const signup = async ({ name, email, password }) => {
  if (LOCAL_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new AuthError("An account with this email already exists.");
    }
    const user = { id: crypto.randomUUID(), name, email, password, createdAt: new Date().toISOString() };
    users.push(user);
    writeUsers(users);
    const publicUser = toPublicUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    return publicUser;
  }

  try {
    const response = await client.post("/api/auth/signup", { name, email, password });
    localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  } catch (err) {
    throw new AuthError(err.response?.data?.detail || "Unable to create account. Please try again.");
  }
};

/**
 * POST /api/auth/login — body: { email, password } -> { token, user }
 */
export const login = async ({ email, password }) => {
  if (LOCAL_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new AuthError("Incorrect email or password.");
    const publicUser = toPublicUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    return publicUser;
  }

  try {
    const response = await client.post("/api/auth/login", { email, password });
    localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  } catch (err) {
    throw new AuthError(err.response?.data?.detail || "Incorrect email or password.");
  }
};

export const logout = async () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export default { signup, login, logout, getSession };
