import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para inyectar el token JWT si existe
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('[API] Request to:', config.url, 'Token:', token ? 'Present' : 'None');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('[API] Error accessing localStorage:', e);
  }
  return config;
}, error => {
  console.error('[API] Request interceptor error:', error);
  return Promise.reject(error);
});

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (!originalRequest) return Promise.reject(error);

    // Si el error es 401 y no es una request de refresh token
    if (error.response?.status === 401 && 
        !originalRequest.url?.includes('token/refresh') && 
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si ya está refrescando, encola la request
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Limpiar tokens si el refresh falla
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Redirigir a login
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
