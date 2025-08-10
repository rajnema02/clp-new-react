import axios from 'axios';
import environment from '../environments/environments';

const apiService = axios.create({
  baseURL: environment.apiUrl,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and refresh token available → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${environment.apiUrl}/auth/refresh-token`, { refreshToken });

          if (data?.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);

            // Update Authorization header and retry original request
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiService(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }

    // If still unauthorized → logout and redirect
    if (error.response?.status === 401) {
      ['accessToken', 'refreshToken', 'user', 'admin'].forEach(key => localStorage.removeItem(key));

      // Avoid redirect loop if already on login/admin-login
      const publicPaths = ['/login', '/admin-login'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiService;
