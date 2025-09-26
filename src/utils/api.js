import axios from 'axios';

// Centralized axios instance for the app
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

const instance = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token provider function — by default reads from localStorage
let tokenProvider = () => localStorage.getItem('accessToken');

export function setTokenProvider(fn) {
  tokenProvider = fn;
}

// Request interceptor to add Authorization header
instance.interceptors.request.use(
  (config) => {
    const token = tokenProvider?.();
    if (!token) {
      // If there's no token, reject so callers can handle auth flow
      return Promise.reject({ message: 'No access token available' });
    }
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
