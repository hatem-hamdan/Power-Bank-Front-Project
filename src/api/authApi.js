import { api } from "./client";

export function getAuthConfig() {
  return api.get("/api/auth/config");
}

export function registerAccount(body) {
  return api.post("/api/auth/register", body);
}

export function loginAccount(body) {
  return api.post("/api/auth/login", body);
}

export function loginWithGoogle(idToken) {
  return api.post("/api/auth/google", { idToken });
}

export function getMe() {
  return api.get("/api/auth/me");
}
