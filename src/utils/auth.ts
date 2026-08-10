/**
 * Utility fungsi autentikasi — akses token & data user melalui fungsi ini,
 * bukan localStorage langsung, agar key terpusat dan mudah diubah.
 */
import { STORAGE_KEYS } from '../constants/storage';

// ─── Token ────────────────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.TOKEN);

export const setToken = (token: string): void =>
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);

export const removeToken = (): void =>
  localStorage.removeItem(STORAGE_KEYS.TOKEN);

// ─── User ─────────────────────────────────────────────────────────────────────

export const getStoredUser = (): Record<string, unknown> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: Record<string, unknown>): void =>
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

export const removeStoredUser = (): void =>
  localStorage.removeItem(STORAGE_KEYS.USER);

// ─── Logout / Clear All ───────────────────────────────────────────────────────

/** Hapus semua data autentikasi dari localStorage sekaligus */
export const clearAuth = (): void => {
  removeToken();
  removeStoredUser();
};

// ─── View Mode ────────────────────────────────────────────────────────────────

export const getViewMode = (): 'table' | 'grid' =>
  (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as 'table' | 'grid') || 'table';

export const setViewMode = (mode: 'table' | 'grid'): void =>
  localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);

// ─── Last Search ──────────────────────────────────────────────────────────────

export const getLastSearch = (): string =>
  localStorage.getItem(STORAGE_KEYS.LAST_SEARCH) || '';

export const setLastSearch = (search: string): void =>
  localStorage.setItem(STORAGE_KEYS.LAST_SEARCH, search);
