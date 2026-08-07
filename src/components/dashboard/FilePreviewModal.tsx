import React, { useEffect, useState } from 'react';
import { X, Download, Share2, Eye, FileText, Music, AlertCircle, Loader2, Calendar, HardDrive, Tag } from 'lucide-react';
import api from '../../services/api';
import { FileItem } from './FileListTable';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileId: string, fileName: string) => void;
  onShare: (fileId: string, fileName: string, shares?: any[]) => void;
  formatBytes: (bytes: number) => string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
  onShare,
  formatBytes,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setPreviewUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    let active = true;
    let createdUrl: string | null = null;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      setPreviewUrl(null);
      setTextContent(null);

      try {
        const response = await api.get(`/api/files/${file.id}/preview`, {
          responseType: 'blob',
        });

        if (!active) return;

        const blob = response.data as Blob;
        const mime = file.mimeType || blob.type || '';
        const ext = file.fileName.substring(file.fileName.lastIndexOf('.')).toLowerCase();

        // If text file
        if (mime.startsWith('text/') || ['.txt', '.json', '.md', '.js', '.ts', '.css', '.html', '.xml', '.csv'].includes(ext)) {
          const text = await blob.text();
          if (active) {
            setTextContent(text);
          }
        } else {
          createdUrl = URL.createObjectURL(blob);
          if (active) {
            setPreviewUrl(createdUrl);
          }
        }
      } catch (err: any) {
        if (active) {
          console.error('Failed to load preview:', err);
          setError('Gagal memuat pratinjau file dari server.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const category = file.category || 'document';
  const ext = file.fileName.substring(file.fileName.lastIndexOf('.')).toLowerCase();
  const isImage = category === 'image' || file.mimeType?.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
  const isVideo = category === 'video' || file.mimeType?.startsWith('video/') || ['.mp4', '.webm', '.ogg', '.mkv'].includes(ext);
  const isAudio = category === 'audio' || file.mimeType?.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.m4a'].includes(ext);
  const isPdf = file.mimeType === 'application/pdf' || ext === '.pdf';
  const isText = textContent !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-100 truncate" title={file.fileName}>
                {file.fileName}
              </h3>
              <p className="text-xs text-slate-400">
                {formatBytes(Number(file.fileSize))} • {new Date(file.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onShare(file.id, file.fileName, file.shares)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all"
              title="Bagikan File"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Bagikan
            </button>
            <button
              onClick={() => onDownload(file.id, file.fileName)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-all"
              title="Unduh File"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Unduh
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center min-h-[350px] bg-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Memuat pratinjau file...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-center max-w-md py-12">
              <AlertCircle className="w-12 h-12 text-rose-400/80" />
              <p className="text-slate-300 text-sm">{error}</p>
              <button
                onClick={() => onDownload(file.id, file.fileName)}
                className="mt-2 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-md shadow-indigo-600/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh Langsung
              </button>
            </div>
          ) : isImage && previewUrl ? (
            <div className="flex items-center justify-center w-full h-full max-h-[65vh]">
              <img
                src={previewUrl}
                alt={file.fileName}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg border border-slate-800/60"
              />
            </div>
          ) : isVideo && previewUrl ? (
            <div className="w-full max-w-3xl flex items-center justify-center">
              <video
                src={previewUrl}
                controls
                autoPlay
                className="max-w-full max-h-[65vh] rounded-xl shadow-xl border border-slate-800/80"
              >
                Browser Anda tidak mendukung pemutaran video langsung.
              </video>
            </div>
          ) : isAudio && previewUrl ? (
            <div className="flex flex-col items-center justify-center w-full max-w-lg p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                <Music className="w-10 h-10" />
              </div>
              <div className="text-center w-full">
                <h4 className="text-base font-medium text-slate-200 truncate">{file.fileName}</h4>
                <p className="text-xs text-slate-400 mt-1">{formatBytes(Number(file.fileSize))}</p>
              </div>
              <audio src={previewUrl} controls autoPlay className="w-full">
                Browser Anda tidak mendukung pemutaran audio langsung.
              </audio>
            </div>
          ) : isPdf && previewUrl ? (
            <iframe
              src={previewUrl}
              title={file.fileName}
              className="w-full h-[65vh] rounded-lg border border-slate-800/80 bg-white"
            />
          ) : isText ? (
            <div className="w-full h-full max-h-[65vh] overflow-auto p-4 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {textContent}
            </div>
          ) : (
            /* Fallback Metadata Card */
            <div className="flex flex-col items-center justify-center w-full max-w-md p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-100">{file.fileName}</h4>
                <p className="text-xs text-slate-400 mt-1">Pratinjau visual langsung tidak tersedia untuk format file ini.</p>
              </div>

              <div className="w-full pt-4 border-t border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 flex items-center"><HardDrive className="w-3.5 h-3.5 mr-1.5" /> Ukuran File</span>
                  <span className="text-slate-200 font-medium">{formatBytes(Number(file.fileSize))}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5" /> Kategori</span>
                  <span className="text-slate-200 font-medium capitalize">{file.category || 'Lainnya'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> Tanggal Dibuat</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(file.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onDownload(file.id, file.fileName)}
                className="w-full py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh File Ini
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
