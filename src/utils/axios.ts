import axios from 'axios';

// ----------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

const instance = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const endpoints = {
  get: (url: string) => instance.get(url),
  post: (url: string, data: any) => instance.post(url, data),
  put: (url: string, data: any) => instance.put(url, data),
  patch: (url: string, data: any) => instance.patch(url, data),
  delete: (url: string) => instance.delete(url),
};
