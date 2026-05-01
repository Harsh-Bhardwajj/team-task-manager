import axios from "axios";

// 🔗 Backend base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api", // ⚠️ deploy ke time change hoga
});

// 🔐 Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
