import React, { useEffect, useState, useRef } from 'react';
import { X, Download, Share2, Eye, FileText, Music, AlertCircle, Loader2, Calendar, HardDrive, Tag, Repeat, Play, Pause, Volume2, VolumeX } from 'lucide-react';
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

interface CustomAudioPlayerProps {
  src: string;
  fileName: string;
  fileSize: number;
  formatBytes: (bytes: number) => string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, fileName, fileSize, formatBytes }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 sm:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl space-y-6 my-auto">
      <audio
        ref={audioRef}
        src={src}
        autoPlay
        loop={isLooping}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
        }}
      />

      {/* Album / Icon Graphic */}
      <div className="relative">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg ${isPlaying ? 'animate-pulse scale-105' : ''} transition-all duration-300`}>
          <Music className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
      </div>

      {/* File Info */}
      <div className="text-center w-full min-w-0 px-2">
        <h4 className="text-base font-bold text-white truncate" title={fileName}>{fileName}</h4>
        <p className="text-xs text-slate-400 mt-1">{formatBytes(Number(fileSize))}</p>
      </div>

      {/* Custom Scrubber / Timeline Slider */}
      <div className="w-full space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>

      {/* Custom Player Controls Row */}
      <div className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80">
        {/* Mute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className={`p-2.5 rounded-2xl border transition cursor-pointer active:scale-95 ${isMuted
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/80'
            }`}
          title={isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Big Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 cursor-pointer active:scale-90 transition transform"
          title={isPlaying ? 'Jeda' : 'Putar'}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

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
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [loadedBytes, setLoadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setPreviewUrl(null);
      setTextContent(null);
      setError(null);
      setDownloadProgress(0);
      setLoadedBytes(0);
      setTotalBytes(0);
      return;
    }

    let active = true;
    let createdUrl: string | null = null;

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      setPreviewUrl(null);
      setTextContent(null);
      setDownloadProgress(0);
      setLoadedBytes(0);
      const initialTotal = file ? Number(file.fileSize) : 0;
      setTotalBytes(initialTotal);

      try {
        const response = await api.get(`/api/files/${file.id}/preview`, {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            if (!active) return;
            const loaded = progressEvent.loaded || 0;
            const total = progressEvent.total || (file ? Number(file.fileSize) : 0);

            setLoadedBytes(loaded);
            if (total > 0) {
              setTotalBytes(total);
              const percent = Math.min(100, Math.round((loaded * 100) / total));
              setDownloadProgress(percent);
            }
          },
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 gap-3 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center space-x-3 overflow-hidden w-full sm:w-auto pr-8 sm:pr-0 relative">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-semibold text-slate-100 truncate pr-2" title={file.fileName}>
                {file.fileName}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {formatBytes(Number(file.fileSize))} • {new Date(file.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Mobile Close Button (Top-Right) */}
            <button
              onClick={onClose}
              className="sm:hidden absolute right-0 top-0 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
            <button
              onClick={() => onShare(file.id, file.fileName, file.shares)}
              className="flex-1 sm:flex-none justify-center inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all active:scale-95"
              title="Bagikan File"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Bagikan
            </button>
            <button
              onClick={() => onDownload(file.id, file.fileName)}
              className="flex-1 sm:flex-none justify-center inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-all active:scale-95"
              title="Unduh File"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Unduh
            </button>
            <button
              onClick={onClose}
              className="hidden sm:block p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[350px] bg-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 max-w-md w-full px-4 animate-fadeIn">
              <div className="relative flex items-center justify-center">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl opacity-30 animate-pulse" />

                <div className="relative p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center text-indigo-400">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                </div>
              </div>

              <div className="text-center w-full space-y-1">
                <h4 className="text-base font-semibold text-slate-100">Memuat Pratinjau File...</h4>
                <p className="text-xs text-slate-400 truncate max-w-xs mx-auto" title={file.fileName}>
                  {file.fileName}
                </p>
              </div>

              {/* Progress Card */}
              <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-lg space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-400 text-sm">{downloadProgress}%</span>
                  <span className="text-slate-400 font-mono">
                    {formatBytes(loadedBytes)} {totalBytes > 0 ? `/ ${formatBytes(totalBytes)}` : ''}
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${Math.max(downloadProgress, 3)}%` }}
                  />
                </div>
              </div>
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
            <CustomAudioPlayer
              src={previewUrl}
              fileName={file.fileName}
              fileSize={Number(file.fileSize)}
              formatBytes={formatBytes}
            />
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
            <div className="flex flex-col items-center justify-center w-full max-w-md p-5 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-5 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="w-full min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-slate-100 break-all">{file.fileName}</h4>
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
