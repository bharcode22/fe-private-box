import React, { useState } from 'react';
import { UploadCloud, ChevronDown, ChevronUp, X, Folder, FileCheck, Loader2, CloudUpload } from 'lucide-react';

interface BackgroundUploadWidgetProps {
  uploading: boolean;
  uploadProgress: number;
  fileCount: number;
  currentFileIndex?: number;
  currentFileName?: string;
  fileProgressPercent?: number;
  statusMessage?: string;
  targetFolderName?: string;
  onCancelUpload: () => void;
}

export const BackgroundUploadWidget: React.FC<BackgroundUploadWidgetProps> = ({
  uploading,
  uploadProgress,
  fileCount,
  currentFileIndex,
  currentFileName,
  fileProgressPercent,
  statusMessage,
  targetFolderName,
  onCancelUpload,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!uploading) return null;

  const isProcessingCloud = uploadProgress >= 100;
  const activePercent = fileProgressPercent !== undefined && fileProgressPercent > 0 ? fileProgressPercent : uploadProgress;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
      {isMinimized ? (
        /* Minimized Floating Pill Badge */
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center justify-between gap-3 px-5 py-3 rounded-full bg-slate-900/95 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-md hover:bg-slate-800 transition cursor-pointer active:scale-95 group min-w-[280px] sm:min-w-[360px] max-w-[90vw]"
          title="Klik untuk membuka detail unggahan"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center flex-shrink-0">
              {isProcessingCloud ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4 text-indigo-400 animate-bounce" />
              )}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-bold text-slate-200 truncate">
              {currentFileIndex && fileCount > 1
                ? `File ${currentFileIndex}/${fileCount} (${activePercent}%)`
                : isProcessingCloud
                  ? `Menyimpan ke Cloud ${fileCount} File (${activePercent}%)...`
                  : `Mengunggah ${fileCount} File (${activePercent}%)`}
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition flex-shrink-0" />
        </button>
      ) : (
        /* Expanded Floating Card Popup */
        <div className="w-[90vw] max-w-lg sm:w-[480px] rounded-2xl glass-card border border-indigo-500/30 p-4 sm:p-5 space-y-3.5 shadow-2xl backdrop-blur-xl relative bg-slate-950/90">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                {isProcessingCloud ? (
                  <CloudUpload className="w-4 h-4 text-purple-400 animate-pulse" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-indigo-400 animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-white">Proses Upload...</h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <Folder className="w-3 h-3 text-indigo-400 inline flex-shrink-0" />
                  <span className="truncate max-w-[240px]">Target: {targetFolderName || 'Root'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                title="Kecilkan (Minimize)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelUpload}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                title="Batalkan Unggahan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Progress Bar & Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5 truncate max-w-[300px]">
                <FileCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>
                  {currentFileIndex && fileCount > 1
                    ? `File ${currentFileIndex} dari ${fileCount}`
                    : `${fileCount} File Diproses`}
                </span>
              </span>

              <span className="text-indigo-400 font-mono font-bold text-xs bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex-shrink-0 flex items-center gap-1">
                {isProcessingCloud && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
                {activePercent}%
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                style={{ width: `${Math.max(5, activePercent)}%` }}
              />
            </div>

            {/* Explanatory Status Description */}
            <p className="text-[10px] text-slate-400 leading-tight truncate" title={currentFileName || statusMessage}>
              {statusMessage ? (
                <span className="text-indigo-300 font-medium">{statusMessage}</span>
              ) : currentFileName ? (
                <span className="text-indigo-300 font-medium">Mengunggah: {currentFileName} ({activePercent}%)</span>
              ) : isProcessingCloud ? (
                <span className="text-purple-300/90 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
                  Mengunggah berkas ke cloud ({activePercent}%)...
                </span>
              ) : (
                <span>Mengirim berkas file ke server ({activePercent}%)...</span>
              )}
            </p>
          </div>

          {/* Footer Action Tip */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
            <span>Mohon tunggu hingga proses selesai, jangan reload haaman</span>
            <button
              onClick={onCancelUpload}
              className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

