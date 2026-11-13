
import axios from "axios";

// ============================================
// API CONFIGURATION
// Both local and deployed websites use
// the same Render backend and Atlas database.
// ============================================

const API = axios.create({
  baseURL: "https://eco-footprint-hub-2.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// ============================================
// AUTOMATICALLY ATTACH LOGIN TOKEN
// ============================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// HANDLE API RESPONSES
// ============================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.data?.message || error.message
    );

    return Promise.reject(error);
  }
);

// ============================================
// EXPORT API
// ============================================

export default API;
