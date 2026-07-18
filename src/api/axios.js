import axios from 'axios';

// All backend routes live under /api. Normalize the configured base URL so a
// value that omits the /api suffix (e.g. a misconfigured deploy env var) still
// resolves correctly instead of 404-ing on /auth/register etc.
const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = /\/api\/?$/.test(RAW_BASE)
  ? RAW_BASE.replace(/\/$/, '')
  : `${RAW_BASE.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
