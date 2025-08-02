import axios from 'axios';

const API_URL = 'http://localhost:3000/auth'; // Update if needed

const handleResponse = (response) => {
  return {
    success: true,
    message: response?.data?.message || "Success",
    data: response.data
  };
};

const handleError = (error) => {
  return {
    success: false,
    message:
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong",
    error: error.response?.data || error
  };
};

const authService = {
  // Admin Login
  adminLogin: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/adminlogin`, {
        authid: email,
        password
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // User Login
  userLogin: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/userlogin`, {
        authid: email,
        password
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin Signup
  adminSignup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/adminsignup`, userData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // User Signup
  userSignup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/usersignup`, userData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update Password
  updatePassword: async (userId, currentPassword, newPassword, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/reset-password`,
        {
          id: userId,
          currentPassword,
          password: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forget-password`, { email });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Send OTP
  sendOtp: async (email, mobile) => {
    try {
      const response = await axios.post(`${API_URL}/sendotp`, { email, mobile });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Verify OTP
  verifyOtp: async (otp) => {
    try {
      const response = await axios.post(`${API_URL}/getOtpVerification`, { otp });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};

export default authService;
