// frontend/src/utils/apiUtils.js
import axios from "axios";
import { API_URL, BASE_URL } from "../config";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("beekeeper_auth_token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API connection errors gracefully
    if (error.code === "ECONNABORTED" || !error.response) {
      console.error("API connection error:", error.message);
      return Promise.reject({
        response: {
          status: 503,
          data: {
            success: false,
            message:
              "Unable to connect to the API. Please check your connection or try again later.",
          },
        },
      });
    }

    return Promise.reject(error);
  }
);

// Helper function to check if API is available
export const checkApiStatus = async () => {
  try {
    // Try multiple endpoints to check API availability
    let response;

    // First try the API root
    try {
      console.log("Checking API at:", API_URL);
      response = await axios.get(API_URL, { timeout: 5000 });
      if (response.data && response.data.success === true) {
        console.log("API is available at API_URL");
        return true;
      }
    } catch (error) {
      console.log("API not available at API_URL, trying BASE_URL");
    }

    // If that fails, try the base URL
    try {
      console.log("Checking API at base URL:", BASE_URL);
      response = await axios.get(BASE_URL, { timeout: 5000 });
      if (response.data) {
        console.log("Base URL is available");
        return true;
      }
    } catch (error) {
      console.log("Base URL not available, trying health endpoint");
    }

    // Finally try the health endpoint
    try {
      console.log("Checking API health endpoint");
      response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      if (response.data && response.data.success === true) {
        console.log("Health endpoint is available");
        return true;
      }
    } catch (error) {
      console.log("Health endpoint not available");
    }

    // If all checks fail, API is not available
    return false;
  } catch (error) {
    console.error("All API health checks failed:", error);
    return false;
  }
};

export default api;
