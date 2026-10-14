import axios from "axios";

const SESSION_KEY = "tinyvolt_session";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
});

api.interceptors.request.use((config) => {
  const session = readStoredSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthCall = url.includes("/api/auth/");

    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event("tinyvolt-signed-out"));
    }

    return Promise.reject(error);
  }
);

export function readStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));

    if (!session?.token || new Date(session.expiresAt) <= new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function writeStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function errorMessage(error, fallback) {
  const data = error?.response?.data;

  if (data?.message) {
    return data.message;
  }

  if (data?.errors) {
    const first = Object.values(data.errors)[0];

    if (first?.[0]) {
      return first[0];
    }
  }

  if (!error?.response) {
    return "Cannot reach the server. Please try again.";
  }

  return fallback;
}
