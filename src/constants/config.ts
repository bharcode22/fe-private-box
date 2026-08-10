/**
 * Konstanta konfigurasi aplikasi dari environment variables.
 * Gunakan ini sebagai sumber tunggal kebenaran, bukan import.meta.env langsung.
 */

/** Base URL backend API */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/** Kuota penyimpanan gratis per pengguna (bytes). Default: 20 GB */
export const FREE_QUOTA_BYTES = Number(import.meta.env.VITE_FREE_USER_QUOTA_BYTES) || 21_474_836_480;

/** Jumlah maksimum pengguna gratis. Default: 100 */
export const MAX_FREE_USERS = Number(import.meta.env.VITE_MAX_FREE_USERS) || 100;

/** Lama aktif akun gratis (hari). Default: 150 */
export const FREE_ACTIVE_DAYS = Number(import.meta.env.VITE_FREE_USER_ACTIVE_DAYS) || 150;

/** Google OAuth Client ID */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
