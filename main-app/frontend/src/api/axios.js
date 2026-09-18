import axios from "axios";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:5000";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export const authApi = axios.create({ baseURL: AUTH_URL });
export const api = axios.create({ baseURL: BACKEND_URL });

// attach access token to every backend request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// on 401, try to refresh the access token once, then retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await authApi.post("/refresh-token", { refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
