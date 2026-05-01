import axios from "axios";

// 🔗 Dynamic base URL (DEV + PROD)
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://team-task-manager-production-dc9c.up.railway.app/api",
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
