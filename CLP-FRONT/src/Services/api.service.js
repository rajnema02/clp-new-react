import axios from 'axios';
import environment from '../environments/environments';

const apiService = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
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

// Response interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiService;



// // src/services/api.service.js
// import axios from 'axios';
// import environment from '../environments/environments';

// class ApiService {
//   constructor() {
//     this.axiosInstance = axios.create({
//       baseURL: environment.url,
//       // You can add default headers here
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     // Add request interceptor for auth tokens if needed
//     this.axiosInstance.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('accessToken');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );

//     // Add response interceptor for error handling
//     this.axiosInstance.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         if (error.response && error.response.status === 401) {
//           // Handle unauthorized access
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('refreshToken');
//           window.location.href = '/login';
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   get(apiRoute, query = {}) {
//     return this.axiosInstance.get(`/${apiRoute}`, { params: query });
//   }

//   count(apiRoute, query = {}) {
//     return this.axiosInstance.get(`/${apiRoute}/count`, { params: query });
//   }

//   getById(apiRoute, id) {
//     return this.axiosInstance.get(`/${apiRoute}/${id}`);
//   }

//   post(apiRoute, data) {
//     return this.axiosInstance.post(`/${apiRoute}`, data);
//   }

//   put(apiRoute, id, data) {
//     return this.axiosInstance.put(`/${apiRoute}/${id}`, data);
//   }

//   delete(apiRoute, id) {
//     return this.axiosInstance.delete(`/${apiRoute}/${id}`);
//   }

//   allotBatch(apiRoute, id, data) {
//     return this.axiosInstance.put(`/${apiRoute}/${id}`, data);
//   }

//   removeBatch(apiRoute, id, data) {
//     return this.axiosInstance.put(`/${apiRoute}/${id}`, data);
//   }

//   getsub(apiRoute, query = {}) {
//     return this.axiosInstance.get(`/${apiRoute}/sub`, { params: query });
//   }
// }

// // Create a singleton instance
// const apiService = new ApiService();

// export default apiService;


