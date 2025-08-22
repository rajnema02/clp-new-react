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

// Response interceptor: handle auth errors and normalize response
apiService.interceptors.response.use(
  (response) => {
    // Normalize the response to match Angular's expected structure
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config
    };
  },
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

// Helper methods
apiService.get = function(url, params = {}, config = {}) {
  return this.request({
    method: 'get',
    url,
    params,
    ...config
  });
};

apiService.post = function(url, data = {}, config = {}) {
  return this.request({
    method: 'post',
    url,
    data,
    ...config
  });
};

apiService.put = function(url, data = {}, config = {}) {
  return this.request({
    method: 'put',
    url,
    data,
    ...config
  });
};

apiService.delete = function(url, config = {}) {
  return this.request({
    method: 'delete',
    url,
    ...config
  });
};

export default apiService;