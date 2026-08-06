import axios from 'axios';

// Base URL diprioritaskan dari .env VITE_API_BASE_URL, fallback ke relative url (Vite proxy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor untuk menyisipkan Token JWT secara otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
