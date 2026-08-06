import React from 'react';
import { Share2, Copy } from 'lucide-react';

interface ShareModalProps {
  modalData: { fileId: string; fileName: string; code?: string } | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ modalData, onClose }) => {
  if (!modalData) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-6 rounded-2xl border border-slate-800 space-y-4 relative">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-400" /> Bagikan File
        </h3>
        <p className="text-slate-400 text-xs">
          File: <strong className="text-slate-200">{modalData.fileName}</strong>
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Kode Unik Akses:</span>
          <div className="flex items-center justify-between font-mono text-2xl font-extrabold text-indigo-400 tracking-wider">
            <span>{modalData.code}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(modalData.code || '');
                alert('Kode berhasil disalin!');
              }}
              className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition"
              title="Salin Kode"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Penerima dapat membuka laman <strong className="text-slate-300">/share</strong> dan memasukkan Kode Unik di atas beserta email mereka untuk mengunduh file.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
