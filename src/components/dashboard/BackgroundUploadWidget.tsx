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
    <>
      {!isMinimized && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setIsMinimized(true)}
        />
      )}
      <div className={`fixed bottom-40 sm:bottom-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300 ${isMinimized ? 'right-5' : 'left-1/2 -translate-x-1/2'}`}>
        {isMinimized ? (
        /* Minimized Floating Circle Badge */
        <button
          onClick={() => setIsMinimized(false)}
          className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-slate-900/95 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-md hover:bg-slate-800 transition cursor-pointer active:scale-95 group"
          title="Klik untuk membuka detail unggahan"
        >
          {isProcessingCloud ? (
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin mb-0.5" />
          ) : (
            <UploadCloud className="w-5 h-5 text-indigo-400 animate-bounce mb-0.5" />
          )}
          <span className="text-[10px] font-bold text-slate-200 leading-none">{activePercent}%</span>
          <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full" />
        </button>
      ) : (
        /* Expanded Floating Card Popup */
        <div className="w-[95vw] max-w-2xl sm:w-[600px] min-h-[300px] sm:min-h-[350px] flex flex-col justify-between gap-8 rounded-3xl glass-card border border-indigo-500/30 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative bg-slate-950/90">
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
            <p className="text-[10px] text-slate-400 leading-tight break-words" title={currentFileName || statusMessage}>
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
    </>
  );
};

