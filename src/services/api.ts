import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

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
