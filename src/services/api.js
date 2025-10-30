import axios from "axios";

// const BASE_URL = "http://192.168.1.50:8000";
// const BASE_URL = "https://moneza-backend.onrender.com";
const BASE_URL = "https://moneza-backend.onrender.com";

const apiCall = async (endpoint, options = {}) => {
  const {
    method = "GET",
    data = null,
    params = {},
    headers = {},
    token = null,
  } = options;

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
      ...(data !== null ? { data } : {}),
    };

    const response = await axios(axiosConfig);
    return response.data;
  } catch (error) {
    console.error("API Call Error:", error.message);

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
