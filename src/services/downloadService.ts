import api from './api';

export const downloadService = {
  /**
   * Mengunduh file individual dari server
   */
  /**
   * Mengunduh file individual dari server (dengan dukungan Range Chunked Download)
   */
  async downloadFile(
    fileId: string,
    fileName: string,
    onShowToast: (msg: string, type: 'info' | 'error' | 'success') => void
  ) {
    try {
      onShowToast(`Mengunduh "${fileName}"...`, 'info');

      // 1. Dapatkan ukuran total file terlebih dahulu dengan request pertama
      const initialRes = await api.get(`/api/files/${fileId}/download`, {
        headers: { Range: 'bytes=0-0' },
        responseType: 'blob',
      });

      const contentRange = initialRes.headers['content-range'];
      let totalSize = 0;
      if (contentRange) {
        const parts = contentRange.split('/');
        if (parts.length > 1) {
          totalSize = parseInt(parts[1], 10);
        }
      }

      const contentType = typeof initialRes.headers['content-type'] === 'string'
        ? initialRes.headers['content-type']
        : 'application/octet-stream';

      const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB chunks

      if (totalSize && totalSize > 20 * 1024 * 1024) {
        // Range Chunked Download untuk file besar > 20MB
        const blobs: Blob[] = [];
        let downloaded = 0;

        while (downloaded < totalSize) {
          const start = downloaded;
          const end = Math.min(downloaded + CHUNK_SIZE - 1, totalSize - 1);
          const chunkRes = await api.get(`/api/files/${fileId}/download`, {
            headers: { Range: `bytes=${start}-${end}` },
            responseType: 'blob',
          });

          blobs.push(chunkRes.data);
          downloaded += (end - start + 1);
        }

        const finalBlob = new Blob(blobs, { type: contentType });
        const url = window.URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        onShowToast(`Berhasil mengunduh "${fileName}"!`, 'success');
      } else {
        // Standard Download untuk file kecil
        const res = await api.get(`/api/files/${fileId}/download`, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
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
