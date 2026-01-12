// 🚀 ResQLink API Client v4.0 - ERROR-FIXED Production Ready (2026 Standards)
// Clean, vanilla JS - No TypeScript errors, duplicate exports, or type issues

import axios from 'axios';

// 🛠️ API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 15000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔄 Request Interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-Timestamp'] = Date.now().toString();
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛡️ Response Interceptor - Smart error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 🔐 Auto-logout on 401
    if (error.response?.status === 401 && !originalRequest?._retry) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // 🔄 Retry network errors once
    if (
      (error.code === 'ECONNABORTED' || !error.response) && 
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// 🆘 EMERGENCY REPORTS API
const reportsApi = {
  createReport: async (reportData) => {
    const payload = {
      ...reportData,
      timestamp: new Date().toISOString(),
      clientId: localStorage.getItem('deviceId') || 'anonymous',
      status: 'pending',
    };
    return apiClient.post('/reports', payload);
  },

  getReports: async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      status: filters.status || 'all',
      sort: filters.sort || '-timestamp',
    };
    if (filters.location) params.location = JSON.stringify(filters.location);
    if (filters.dateRange) params.dateRange = JSON.stringify(filters.dateRange);
    
    return apiClient.get('/reports', { params });
  },

  getReportById: (id) => apiClient.get(`/reports/${id}`),
  
  updateReportStatus: (id, status, notes = '') => 
    apiClient.patch(`/reports/${id}/status`, { status, notes }),

  deleteReport: (id) => apiClient.delete(`/reports/${id}`),

  bulkUpdateStatus: (ids, status) =>
    apiClient.patch('/reports/bulk-status', { ids, status }),
};

// 🗺️ LIVE MAP API
const mapApi = {
  getLiveIncidents: async (options = {}) => {
    return apiClient.get('/map/live', {
      params: {
        limit: options.limit || 100,
        radius: options.radius || 50000,
      }
    });
  },

  getIncidentsByBounds: (bounds) => 
    apiClient.get('/map/bounds', { params: bounds }),

  updateIncidentLocation: (id, coordinates) => 
    apiClient.patch(`/map/incidents/${id}/location`, { coordinates }),
};

// 👤 AUTH API
const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userProfile', JSON.stringify(user));
    
    return response;
  },

  register: (userData) => apiClient.post('/auth/register', userData),
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    localStorage.setItem('authToken', response.data.token);
    return response;
  },

  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  getProfile: () => apiClient.get('/auth/profile'),
};

// 📊 DASHBOARD API
const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  
  getAnalytics: (params) => apiClient.get('/dashboard/analytics', { params }),
  
  exportReports: (filters) => apiClient.get('/dashboard/export/csv', {
    params: filters,
    responseType: 'blob'
  }),
};

// 🔔 NOTIFICATIONS API
const notificationsApi = {
  getNotifications: (options = {}) => 
    apiClient.get('/notifications', { 
      params: { 
        page: options.page || 1, 
        limit: options.limit || 50 
      } 
    }),

  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () => apiClient.post('/notifications/read-all'),
};

// 🔧 UTILITY API
const utilsApi = {
  uploadFile: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: options.onUploadProgress,
    });
  },

  healthCheck: () => apiClient.get('/health', { timeout: 5000 }),
};

// 🛡️ API UTILS
const apiUtils = {
  isAuthenticated: () => !!localStorage.getItem('authToken'),
  
  getAuthToken: () => localStorage.getItem('authToken') || '',
  
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('refreshToken');
  },
};

// 📡 CLEAN MAIN EXPORT - Fixed duplicate "utils"
const api = {
  reports: reportsApi,
  map: mapApi,
  auth: authApi,
  dashboard: dashboardApi,
  notifications: notificationsApi,
  utils: utilsApi,        // File upload/health
  helpers: apiUtils,     // Auth state helpers
};

// 🪝 REACT HOOKS
export const useApi = () => api;

export const useAuthStatus = () => ({
  isAuthenticated: apiUtils.isAuthenticated(),
  token: apiUtils.getAuthToken(),
});

export default api;
