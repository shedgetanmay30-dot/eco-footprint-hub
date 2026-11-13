
import axios from "axios";

// ============================================
// API CONFIGURATION
// ============================================

const API = axios.create({
  baseURL: "https://eco-footprint-hub-2.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

// ============================================
// AUTOMATICALLY ATTACH LOGIN TOKEN
// ============================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
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
  (response) => {
    return response;
  },
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
