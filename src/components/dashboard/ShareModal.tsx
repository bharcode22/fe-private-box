import React from 'react';
import { Share2, Copy, Folder, FileText, Link } from 'lucide-react';

interface ShareModalProps {
  modalData: { id: string; name: string; type?: 'file' | 'folder'; code?: string } | null;
  onClose: () => void;
  onRegenerate: (id: string, customCode?: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ modalData, onClose, onRegenerate }) => {
  if (!modalData) return null;

  const isFolder = modalData.type === 'folder';
  const publicUrl = `${window.location.origin}/share?code=${modalData.code || ''}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-6 rounded-2xl border border-slate-800 space-y-4 relative shadow-2xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-400" /> Bagikan {isFolder ? 'Folder' : 'File'}
        </h3>
        <p className="text-slate-400 text-xs flex items-center gap-1.5">
          {isFolder ? <Folder className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
          <span>{isFolder ? 'Folder' : 'File'}:</span> <strong className="text-slate-200">{modalData.name}</strong>
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Kode Unik Akses:</span>
            <div className="flex items-center gap-2 font-mono text-xl font-extrabold text-indigo-400 tracking-wider">
              <span>{modalData.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(modalData.code || '');
                  alert('Kode berhasil disalin!');
                }}
                className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition cursor-pointer"
                title="Salin Kode"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="truncate text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/60 flex-1">
              {publicUrl}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                alert('Link publik berhasil disalin!');
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
              title="Salin Tautan Publik"
            >
              <Link className="w-3.5 h-3.5" />
              <span>Salin Link</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Penerima yang mengklik <strong className="text-slate-300">Link Publik</strong> akan otomatis terisi kode aksesnya dan hanya perlu mengisikan email untuk mengunduh.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRegenerate(modalData.id)}
            className="flex-1 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-sm font-semibold transition cursor-pointer"
          >
            Generate Ulang
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
