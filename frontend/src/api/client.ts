import axios from 'axios';

const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT token injection
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hospital_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config?.url?.includes('/api/auth/login');
      const isPublicUrl = error.config?.url?.includes('/api/public');
      if (!isAuthUrl && !isPublicUrl) {
        localStorage.removeItem('hospital_auth_token');
        localStorage.removeItem('hospital_auth_user');
        if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/committee')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
