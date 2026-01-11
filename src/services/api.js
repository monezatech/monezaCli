// Production backend URL
const BASE_URL = "https://moneza-backend.onrender.com";
// For development/testing:
// For Android emulator, use 10.0.2.2 to reach host machine
// For physical device, use your computer's local IP address
// Updated BASE_URL - make sure this matches your backend server IP
// const BASE_URL = 'http://192.168.1.23:8000';
import axios from "axios"; // Keep axios import here for direct usage

const apiCall = async (endpoint, options = {}) => {
  const {
    method = "GET",
    data = null,
    body = null, // Support both data and body for backward compatibility
    params = {},
    headers = {},
    token = null,
    ignoreAuthError = false, // New option to ignore 401 for specific calls
  } = options;

  // Use data if provided, otherwise use body
  const requestData = data !== null ? data : body;

  const apiHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const axiosConfig = {
      url: `${BASE_URL}${endpoint}`,
      method,
      params,
      timeout: 10000,
      headers: apiHeaders,
      ...(requestData !== null ? { data: requestData } : {}),
    };

    const response = await axios(axiosConfig);
    return response.data;
  } catch (error) {
    // If ignoreAuthError is true, we add a custom property to the error
    // so the global interceptor in App.tsx can identify and ignore it.
    // If ignoreAuthError is true, we add a custom property to the error's config
    // so the global interceptor in App.tsx can identify and ignore it.
    if (ignoreAuthError && error.response && error.response.status === 401) {
      error.config._ignoreAuthError = true; // Set on error.config instead of error.response.config
    }

    console.error("API Call Error in api.js:", error.message);

    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Status Code:", error.response.status);
      console.error("Headers:", error.response.headers);
      throw error.response.data;
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("No response received from the server.");
    } else {
      console.error("Error Message:", error.message);
      throw new Error("Error in setting up the request.");
    }
  }
};

export default apiCall;
