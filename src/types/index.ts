/**
 * Tipe domain terpusat untuk seluruh aplikasi Private Box.
 * Impor semua tipe dari sini, bukan dari file komponen individual.
 */

// ─── File & Folder ────────────────────────────────────────────────────────────

export interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
  shares?: { uniqueCode: string; isActive: boolean }[];
}

export interface FileItem {
  id: string;
  fileName: string;
  fileSize: string;
  storageAccountId: string;
  createdAt: string;
  category?: string;
  mimeType?: string;
  shares?: { uniqueCode: string; isActive: boolean }[];
}

// ─── Share / Akses ────────────────────────────────────────────────────────────

export interface ShareData {
  id: string;
  uniqueCode: string;
  allowDownload: boolean;
  isActive: boolean;
  expiresAt: string | null;
}

export interface AccessorLogItem {
  id: string;
  accessorEmail: string;
  accessedAt: string;
}

export interface GroupedLog {
  id: string;
  fileId: string;
  fileName: string;
  uniqueCode: string;
  downloadCount: number;
  lastAccessedAt: string;
  file?: { id: string; fileName: string };
  share?: ShareData | null;
  accessors: AccessorLogItem[];
}

/** Alias untuk kompatibilitas */
export type AccessLog = GroupedLog;

// ─── UI / Toast ───────────────────────────────────────────────────────────────

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface ShareModalData {
  id: string;
  shareId?: string;
  name: string;
  type: 'file' | 'folder';
  code?: string;
  isActive?: boolean;
  allowDownload?: boolean;
  expiresAt?: string | null;
}
