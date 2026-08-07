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
    const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
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

    try {
      await api.post(`/api/files/upload?uploadJobId=${uploadJobId}`, formData, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setActualProgress(percentCompleted);
          }
        },
      });

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
      onShowToast(err.response?.data?.error || 'Gagal mengunggah file', 'error');
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
