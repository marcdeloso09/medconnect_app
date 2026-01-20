import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api/"
    : "https://medconnect-app-aee6.onrender.com/api/";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("doctorToken");

  const isPublic =
    config.url.includes("login") ||
    config.url.includes("register");

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default api;
