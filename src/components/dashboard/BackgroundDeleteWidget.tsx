import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BackgroundDeleteWidgetProps {
  deleting: boolean;
  deleteProgress: number;
  itemCount: number;
  currentItemIndex?: number;
  currentItemName?: string;
  statusMessage?: string;
}

export const BackgroundDeleteWidget: React.FC<BackgroundDeleteWidgetProps> = ({
  deleting,
  deleteProgress,
  itemCount,
  currentItemIndex,
  currentItemName,
  statusMessage,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!deleting) return null;

  const isDone = deleteProgress >= 100;
  const activePercent = Math.min(100, Math.max(0, deleteProgress));

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
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-slate-900/95 border border-rose-500/40 text-white shadow-2xl backdrop-blur-md hover:bg-slate-800 transition cursor-pointer active:scale-95 group"
            title="Klik untuk melihat detail proses penghapusan"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-0.5" />
            ) : (
              <Trash2 className="w-5 h-5 text-rose-400 animate-pulse mb-0.5" />
            )}
            <span className="text-[10px] font-bold text-slate-200 leading-none">{activePercent}%</span>
            <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full" />
          </button>
        ) : (
          /* Expanded Floating Card Popup */
          <div className="w-[95vw] max-w-2xl sm:w-[600px] min-h-[300px] sm:min-h-[350px] flex flex-col justify-between gap-8 rounded-3xl glass-card border border-rose-500/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative bg-slate-950/90">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8.5 h-8.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-rose-400 animate-pulse" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white">Proses Penghapusan Berkas</h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <AlertCircle className="w-3 h-3 text-rose-400 inline flex-shrink-0" />
                    <span className="truncate">Membersihkan data</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer flex-shrink-0"
                title="Kecilkan (Minimize)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Live Progress Bar & Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5 truncate max-w-[300px]">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>
                    {currentItemIndex && itemCount > 1
                      ? `Item ${currentItemIndex} dari ${itemCount}`
                      : `${itemCount} Item Diproses`}
                  </span>
                </span>

                <span className="text-rose-400 font-mono font-bold text-xs bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex-shrink-0 flex items-center gap-1">
                  {!isDone && <Loader2 className="w-3 h-3 animate-spin text-rose-400" />}
                  {activePercent}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 h-2.5 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                  style={{ width: `${Math.max(5, activePercent)}%` }}
                />
              </div>

              {/* Explanatory Status Description */}
              <p className="text-[10px] text-slate-400 leading-tight break-words" title={currentItemName || statusMessage}>
                {statusMessage ? (
                  <span className="text-rose-300 font-medium">{statusMessage}</span>
                ) : currentItemName ? (
                  <span className="text-rose-300 font-medium">Menghapus: {currentItemName} ({activePercent}%)</span>
                ) : isDone ? (
                  <span className="text-emerald-400 font-medium">Item berhasil dihapus! Memperbarui kuota...</span>
                ) : (
                  <span>Menghapus berkas dari storage ({activePercent}%)...</span>
                )}
              </p>
            </div>

            {/* Footer Note */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
              <span>Mohon tunggu hingga proses selesai</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
