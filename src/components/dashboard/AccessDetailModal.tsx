import React from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Key, Download, Clock, UserCheck, ShieldCheck } from 'lucide-react';

export interface AccessorLogItem {
  id: string;
  accessorEmail: string;
  accessedAt: string;
}

interface AccessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  uniqueCode: string;
  downloadCount: number;
  accessors: AccessorLogItem[];
}

export const AccessDetailModal: React.FC<AccessDetailModalProps> = ({
  isOpen,
  onClose,
  fileName,
  uniqueCode,
  downloadCount,
  accessors,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Consistent Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex-shrink-0 shadow-md shadow-indigo-500/10">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white truncate" title={fileName}>
                Detail Pengunduh (Accessor)
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                <span>Item:</span> <strong className="text-slate-200">{fileName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" /> Kode Akses
              </span>
              <p className="text-base font-mono font-bold text-purple-300">{uniqueCode}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Total Diunduh
              </span>
              <p className="text-base font-extrabold text-indigo-300">{downloadCount} Kali</p>
            </div>
          </div>

          {/* Accessors Table / List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Riwayat Email Pengunduh
            </h4>

            {accessors.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Belum ada publik yang mengunduh item ini.</p>
                <p className="text-[11px] text-slate-500">
                  Saat penerima link memasukkan email mereka untuk mengunduh, daftarnya akan tercatat di sini.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                {accessors.map((item, idx) => (
                  <div key={item.id || idx} className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-semibold text-indigo-300 truncate max-w-[220px]">
                        {item.accessorEmail}
                      </span>
                    </div>

                    <div className="flex items-center text-[11px] text-slate-400 space-x-1 flex-shrink-0 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        {new Date(item.accessedAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Consistent Footer Action Bar */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800/80 bg-slate-900/90 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
