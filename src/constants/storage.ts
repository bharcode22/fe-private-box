/**
 * Kunci localStorage terpusat — gunakan ini, bukan string literal langsung.
 * Dengan ini, perubahan nama key cukup dilakukan di satu tempat.
 */
export const STORAGE_KEYS = {
  /** JWT token pengguna */
  TOKEN: 'pb_token',
  /** Data profil pengguna (JSON) */
  USER: 'pb_user',
  /** Mode tampilan daftar file: 'table' | 'grid' */
  VIEW_MODE: 'pb_view_mode',
  /** Pencarian dashboard terakhir (untuk navigasi balik dari /account) */
  LAST_SEARCH: 'pb_last_dashboard_search',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
