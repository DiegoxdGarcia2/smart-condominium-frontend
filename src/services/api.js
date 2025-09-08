import axios from 'axios';

// En desarrollo usar proxy de Vite ('/api'); en producción usar <BASE>/api
const isDev = import.meta.env.DEV;
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const baseURL = isDev ? '/api' : `${API_BASE}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para inyectar el token JWT si existe
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignorar errores de acceso a localStorage
  }
  return config;
});

export default api;
