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

// Interceptor untuk menangkap error penolakan syarat & ketentuan
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.requiresTerms || (error.response?.status === 403 && error.response?.data?.error?.includes('Syarat'))) {
      window.dispatchEvent(new CustomEvent('pb:require-terms'));
    }
    return Promise.reject(error);
  }
);

export default api;
