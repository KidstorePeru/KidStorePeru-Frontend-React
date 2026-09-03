import axios from "axios";
import Cookies from "js-cookie";

/** Base URL of the backend API (from VITE_API_URL). */
export const API_URL: string = import.meta.env.VITE_API_URL ?? "";

if (!API_URL) {
  // Surfaces a misconfigured deployment instead of silently hitting "/undefined".
  console.error("VITE_API_URL is not set — API requests will fail.");
}

/** Name of the cookie holding the session JWT. */
export const SESSION_COOKIE = "session";

export const getToken = () => Cookies.get(SESSION_COOKIE);
export const clearSession = () => Cookies.remove(SESSION_COOKIE);

/** Stores the session JWT. `secure` is only set over HTTPS so local dev works. */
export const setSessionToken = (token: string) =>
  Cookies.set(SESSION_COOKIE, token, {
    expires: 1, // matches the backend's 24h token lifetime
    secure: window.location.protocol === "https:",
    sameSite: "Strict",
  });

/**
 * Shared axios instance. Automatically attaches the session token and, on a
 * 401, clears the session and bounces the user to the login screen.
 */
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
