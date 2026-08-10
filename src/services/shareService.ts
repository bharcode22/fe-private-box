import api from './api';

// Tipe ShareModalData dikelola di types/index.ts
export type { ShareModalData } from '../types';
import type { ShareModalData } from '../types';


export const shareService = {
  /**
   * Membuat atau mengambil kode unik pembagian file/folder
   */
  async getOrCreateShareCode(
    type: 'file' | 'folder',
    id: string,
    name: string,
    existingShares?: any[]
  ): Promise<ShareModalData> {
    const existingShare = existingShares && existingShares.length > 0 ? existingShares[0] : null;
    if (existingShare) {
      return {
        id,
        shareId: existingShare.id,
        name,
        type,
        code: existingShare.uniqueCode,
        isActive: existingShare.isActive !== false,
        allowDownload: existingShare.allowDownload !== false,
        expiresAt: existingShare.expiresAt || null,
      };
    }

    const endpoint = type === 'folder' ? `/api/folders/${id}/share` : `/api/files/${id}/share`;
    const res = await api.post(endpoint);
    return {
      id,
      shareId: res.data.shareId,
      name,
      type,
      code: res.data.uniqueCode,
      isActive: res.data.isActive !== false,
      allowDownload: res.data.allowDownload !== false,
      expiresAt: res.data.expiresAt || null,
    };
  },

  /**
   * Memperbarui kode unik pembagian, status unduh, status aktif, atau tanggal kadaluarsa
   */
  async updateShareCode(
    type: 'file' | 'folder',
    id: string,
    options: { customCode?: string; isActive?: boolean; allowDownload?: boolean; expiresAt?: string | null }
  ) {
    const endpoint = type === 'folder' ? `/api/folders/${id}/share` : `/api/files/${id}/share`;
    const res = await api.put(endpoint, options);
    return {
      code: res.data.uniqueCode as string,
      isActive: res.data.isActive !== false,
      allowDownload: res.data.allowDownload !== false,
      expiresAt: res.data.expiresAt || null,
    };
  },

  /**
   * Mengacak ulang kode unik pembagian file/folder
   */
  async randomizeShareCode(type: 'file' | 'folder', id: string) {
    const endpoint = type === 'folder' ? `/api/folders/${id}/share` : `/api/files/${id}/share`;
    const res = await api.post(endpoint);
    return {
      code: res.data.uniqueCode as string,
      isActive: res.data.isActive !== false,
      allowDownload: res.data.allowDownload !== false,
      expiresAt: res.data.expiresAt || null,
    };
  },
};
