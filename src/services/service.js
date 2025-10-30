import axios from "axios";
import apiCall from "./api";

export const apiService = {
  registerUser: (data) =>
    apiCall(
      '/api/user/register', { method: "POST", data }),

  loginUser: (data) => apiCall("/api/user/login", { method: "POST", data }),

  changePassword: (data) =>
    apiCall('/api/user/changepassword', { method: "POST", data }),

  getLoggedUser: async ({ token }) => {
    try {
      const response = await apiCall("/api/user/loggeduser", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error('Error fetching logged user:', error);
      throw error;
    }
  },

  getCourses: async ({ token }) => {
    try {
      const response = await apiCall('/api/course/courseswithcatrgory', {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getCourse: async ({ token, courseId }) => {
    try {
      const response = await apiCall(`/api/course/course/${courseId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getLessonById: async ({ token, refCourse }) => {
    try {
      const response = await apiCall(`/api/course/getlesson/${refCourse}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      throw error;
    }
  },

  createOrder: async ({ token, courseId }) => {
    try {
      const response = await apiCall("/api/payment/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // ✅ Add this line
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      return response;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // sendOtp: (data) =>
  //   apiCall("/api/otp/send-otp", {
  //     method: "POST",
  //     body: data,
  //   }),

  verifyOtp: async ({ email, otp }) => {
    try {
      const response = await apiCall("/api/otp/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { email, otp }, // ✅ Make sure both are included
      });

      return response;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },

  // changePassword: (data) =>
  //   apiCall("/api/auth/change-password", {
  //     method: "POST",
  //     body: data,
  //   }),

  sendOtp: async ({ email }) => {
    try {
      console.log("Sending OTP to:", email);

      const response = await apiCall("/api/otp/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { email },
      });

      return response;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  },

  markLessonWatched: async ({ token, courseId, lessonId }) => {
    return await apiCall("/api/course/progress/mark-watched", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId, lessonId }),
    });
  },

  getCategories: async ({ token }) => {
    const res = await apiCall("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getCoursesByCategoryId: async ({ categoryId }) => {
    const res = await apiCall(`/api/course/category/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  deleteAccountById: async ({ token, userId }) => {
    try {
      const res = await apiCall(`/api/user/delete-account/${userId}`, {
        method: "DELETE",
        token,
      });

      if (res.status !== "success") {
        throw new Error(res.message || "Failed to delete account");
      }

      return res;
    } catch (error) {
      console.error("Delete account error:", error);
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: error.message || "Something went wrong",
      });
      throw error;
    }
  },
};
