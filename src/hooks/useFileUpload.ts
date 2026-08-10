import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [actualProgress, setActualProgress] = useState(0);
  const [uploadFileCount, setUploadFileCount] = useState(0);
  const [uploadTargetFolderName, setUploadTargetFolderName] = useState('Root');

  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [fileProgressPercent, setFileProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Smooth Interpolation Stepper for progress bar
  useEffect(() => {
    if (!uploading) {
      setUploadProgress(0);
      setActualProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (actualProgress > prev) {
          const diff = actualProgress - prev;
          const step = Math.max(1, Math.ceil(diff / 3));
          return Math.min(99, prev + step);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [uploading, actualProgress]);

  const handleCancelUpload = (onShowToast: (msg: string, type: 'info') => void) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    setActualProgress(0);
    setCurrentFileIndex(0);
    setCurrentFileName('');
    setStatusMessage('');
    setSelectedFiles(null);
    onShowToast('Unggahan file dibatalkan.', 'info');
  };

  const handleFileUpload = async (
    e: React.FormEvent,
    currentFolder: { id: string; name: string } | null,
    onSuccess: () => void,
    onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void,
    onCloseModal: () => void
  ) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    const count = selectedFiles.length;
    setUploadFileCount(count);
    setUploadTargetFolderName(currentFolder?.name || 'Root');

    const formData = new FormData();
    for (let i = 0; i < count; i++) {
      formData.append('files', selectedFiles[i]);
      const relPath = (selectedFiles[i] as any).webkitRelativePath || selectedFiles[i].name;
      formData.append('relativePaths', relPath);
    }
    if (currentFolder) {
      formData.append('folderId', currentFolder.id);
    }

    // Immediately close modal so user can work in background
    onCloseModal();

    setUploading(true);
    setUploadProgress(0);
    setActualProgress(0);
    setCurrentFileIndex(1);
    setCurrentFileName(selectedFiles[0]?.name || '');
    setStatusMessage('Memulai koneksi ke server...');

    const uploadJobId = 'job-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    formData.append('jobId', uploadJobId);

    const token = localStorage.getItem('pb_token');
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const sseUrl = `${apiBaseUrl}/api/files/upload-progress/${uploadJobId}?token=${token}`;

    try {
      const eventSource = new EventSource(sseUrl);
      sseRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.currentFileIndex) setCurrentFileIndex(data.currentFileIndex);
          if (data.currentFileName) setCurrentFileName(data.currentFileName);
          if (data.statusMessage) setStatusMessage(data.statusMessage);
          if (typeof data.progressPercent === 'number') setActualProgress(data.progressPercent);
          if (typeof data.fileProgressPercent === 'number') setFileProgressPercent(data.fileProgressPercent);
        } catch (err) { }
      };
    } catch (err) {
      console.warn('SSE progress connection error:', err);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB per chunk (always under 100MB Cloudflare limit)

    try {
      for (let fIndex = 0; fIndex < count; fIndex++) {
        const file = selectedFiles[fIndex];
        const relPath = (file as any).webkitRelativePath || file.name;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileNumber = fIndex + 1;

        setCurrentFileIndex(fileNumber);
        setCurrentFileName(file.name);
        setFileProgressPercent(0);

        if (totalChunks <= 1 && count === 1) {
          // Standard upload for single small file <= 15MB
          const singleFormData = new FormData();
          singleFormData.append('files', file);
          singleFormData.append('relativePaths', relPath);
          if (currentFolder) singleFormData.append('folderId', currentFolder.id);
          singleFormData.append('jobId', uploadJobId);

          await api.post(`/api/files/upload?uploadJobId=${uploadJobId}`, singleFormData, {
            signal: controller.signal,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setActualProgress(percentCompleted);
              }
            },
          });
        } else {
          // Chunked Upload for large files or multiple files
          const initRes = await api.post(
            '/api/files/upload-chunk/init',
            {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || 'application/octet-stream',
              folderId: currentFolder?.id || null,
              totalChunks,
              chunkSize: CHUNK_SIZE,
              jobId: uploadJobId,
              relativePath: relPath,
            },
            { signal: controller.signal }
          );

          const { uploadId } = initRes.data;

          for (let cIndex = 0; cIndex < totalChunks; cIndex++) {
            if (controller.signal.aborted) break;

            const start = cIndex * CHUNK_SIZE;
            const end = Math.min(file.size, (cIndex + 1) * CHUNK_SIZE);
            const chunkBlob = file.slice(start, end);

            const chunkFormData = new FormData();
            chunkFormData.append('uploadId', uploadId);
            chunkFormData.append('chunkIndex', cIndex.toString());
            chunkFormData.append('totalChunks', totalChunks.toString());
            chunkFormData.append('chunk', chunkBlob, file.name);

            await api.post('/api/files/upload-chunk', chunkFormData, {
              signal: controller.signal,
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const chunkFraction = progressEvent.loaded / progressEvent.total;
                  const fileProgress = Math.min(99, Math.round(((cIndex + chunkFraction) / totalChunks) * 100));
                  setFileProgressPercent(fileProgress);

                  const overallProgress = Math.min(99, Math.round(
                    ((fIndex + (cIndex + chunkFraction) / totalChunks) / count) * 100
                  ));
                  setActualProgress(overallProgress);
                  setUploadProgress(overallProgress);
                  setStatusMessage(`Mengunggah ${file.name} (${fileProgress}%)`);
                }
              },
            });

            // Calculate final progress for completed chunk
            const completedFileProgress = Math.round(((cIndex + 1) / totalChunks) * 100);
            setFileProgressPercent(completedFileProgress);

            const completedOverallProgress = Math.round(
              ((fIndex + (cIndex + 1) / totalChunks) / count) * 100
            );
            setActualProgress(completedOverallProgress);
            setUploadProgress(completedOverallProgress);
          }

          // Trigger Complete Chunk Upload (Merge & GDrive Upload)
          await api.post(
            '/api/files/upload-chunk/complete',
            { uploadId, jobId: uploadJobId },
            { signal: controller.signal }
          );
        }
      }

      // Complete to 100% smoothly and hold for 450ms
      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 450));

      setSelectedFiles(null);
      onSuccess();
      onShowToast(`${count} File berhasil diunggah!`, 'success');
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      if (err.response?.status === 413) {
        onShowToast('Ukuran request terlalu besar (Status 413). Pengunggahan telah dipecah menjadi potongan 15 MB.', 'error');
      } else {
        onShowToast(err.response?.data?.error || 'Gagal mengunggah file', 'error');
      }
    } finally {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      setUploading(false);
      setUploadProgress(0);
      setActualProgress(0);
      setCurrentFileIndex(0);
      setCurrentFileName('');
      setStatusMessage('');
      abortControllerRef.current = null;
    }
  };

  return {
    selectedFiles,
    setSelectedFiles,
    uploading,
    uploadProgress,
    actualProgress,
    uploadFileCount,
    uploadTargetFolderName,
    currentFileIndex,
    currentFileName,
    fileProgressPercent,
    statusMessage,
    handleFileUpload,
    handleCancelUpload,
  };
};
