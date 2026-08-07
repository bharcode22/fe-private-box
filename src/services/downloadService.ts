import api from './api';

export const downloadService = {
  /**
   * Mengunduh file individual dari server
   */
  async downloadFile(
    fileId: string,
    fileName: string,
    onShowToast: (msg: string, type: 'info' | 'error' | 'success') => void
  ) {
    try {
      onShowToast(`Mengunduh "${fileName}"...`, 'info');
      const res = await api.get(`/api/files/${fileId}/download`, {
        responseType: 'blob',
      });

      const contentType = typeof res.headers['content-type'] === 'string' ? res.headers['content-type'] : 'application/octet-stream';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      onShowToast('Gagal mengunduh file', 'error');
    }
  },

  /**
   * Mengunduh seluruh isi folder sebagai berkas kompresi ZIP
   */
  async downloadFolder(
    folderId: string,
    folderName: string,
    onShowToast: (msg: string, type: 'info' | 'error' | 'success') => void
  ) {
    try {
      onShowToast(`Mempersiapkan unduhan folder "${folderName}"...`, 'info');
      const res = await api.get(`/api/folders/${folderId}/download`, {
        responseType: 'blob',
      });

      const zipFileName = `${folderName}.zip`;
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', zipFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onShowToast(`Berhasil mengunduh folder "${zipFileName}"!`, 'success');
    } catch (err: any) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          onShowToast(json.error || 'Gagal mengunduh folder', 'error');
          return;
        } catch (e) { }
      }
      onShowToast('Gagal mengunduh folder atau folder masih kosong', 'error');
    }
  },
};
