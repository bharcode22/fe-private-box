import api from './api';

export interface ShareModalData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  code?: string;
  isActive?: boolean;
}

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
        name,
        type,
        code: existingShare.uniqueCode,
        isActive: existingShare.isActive,
      };
    }

    const endpoint = type === 'folder' ? `/api/folders/${id}/share` : `/api/files/${id}/share`;
    const res = await api.post(endpoint);
    return {
      id,
      name,
      type,
      code: res.data.uniqueCode,
      isActive: res.data.isActive !== false,
    };
  },

  /**
   * Memperbarui kode unik pembagian atau status aktif file/folder
   */
  async updateShareCode(
    type: 'file' | 'folder',
    id: string,
    options: { customCode?: string; isActive?: boolean }
  ) {
    const endpoint = type === 'folder' ? `/api/folders/${id}/share` : `/api/files/${id}/share`;
    const res = await api.put(endpoint, options);
    return {
      code: res.data.uniqueCode as string,
      isActive: res.data.isActive as boolean,
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
      isActive: res.data.isActive as boolean,
    };
  },
};
