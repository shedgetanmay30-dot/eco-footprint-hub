
import axios from "axios";

const API = axios.create({
  baseURL: "https://eco-footprint-hub-2.onrender.com/api"
});

// Automatically attach login token to every request
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

export default API;
