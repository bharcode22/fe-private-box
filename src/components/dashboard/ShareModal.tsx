import React, { useState, useEffect } from 'react';
import { Share2, Copy, Folder, FileText, Link, ShieldCheck, ShieldAlert, RefreshCw, Save, X } from 'lucide-react';

interface ShareModalProps {
  modalData: {
    id: string;
    name: string;
    type?: 'file' | 'folder';
    code?: string;
    isActive?: boolean;
  } | null;
  onClose: () => void;
  onUpdateShare: (id: string, options: { customCode?: string; isActive?: boolean }) => Promise<void>;
  onRandomizeCode: (id: string) => Promise<void>;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  modalData,
  onClose,
  onUpdateShare,
  onRandomizeCode,
  onShowToast,
}) => {
  if (!modalData) return null;

  const isFolder = modalData.type === 'folder';
  const [code, setCode] = useState(modalData.code || '');
  const [isActive, setIsActive] = useState(modalData.isActive !== false);
  const [saving, setSaving] = useState(false);
  const [randomizing, setRandomizing] = useState(false);

  useEffect(() => {
    if (modalData) {
      setCode(modalData.code || '');
      setIsActive(modalData.isActive !== false);
    }
  }, [modalData]);

  const publicUrl = `${window.location.origin}/share?code=${code || ''}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateShare(modalData.id, { customCode: code, isActive });
    } finally {
      setSaving(false);
    }
  };

  const handleRandomize = async () => {
    setRandomizing(true);
    try {
      await onRandomizeCode(modalData.id);
    } finally {
      setRandomizing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 sm:space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={saving}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" /> Manajemen Akses {isFolder ? 'Folder' : 'File'}
          </h3>
          <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
            {isFolder ? <Folder className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
            <span>{isFolder ? 'Folder' : 'File'}:</span> <strong className="text-slate-200">{modalData.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Status Toggle Switch */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                {isActive ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                )}
                Status Akses Pembagian:
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isActive ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {isActive ? (
                <span className="text-emerald-400 font-semibold">
                  Aktif — Siapapun dengan kode di bawah ini dapat mengunduh.
                </span>
              ) : (
                <span className="text-red-400 font-semibold">
                  Nonaktif / Locked — Akses di-lock. Pengunduh akan ditolak walaupun membawa kode ini.
                </span>
              )}
            </p>
          </div>

          {/* Custom Code Input */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-semibold">Kode Unik Akses:</label>
              <button
                type="button"
                onClick={handleRandomize}
                disabled={randomizing}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${randomizing ? 'animate-spin' : ''}`} />
                <span>Acak Kode Baru</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MYCODE123"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 font-mono text-lg font-bold text-indigo-400 uppercase tracking-wider focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(code || '');
                  if (onShowToast) onShowToast('Kode berhasil disalin!', 'success');
                }}
                className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition cursor-pointer"
                title="Salin Kode"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Link Preview */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="truncate text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/60 flex-1">
                {publicUrl}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  if (onShowToast) onShowToast('Link publik berhasil disalin!', 'success');
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                title="Salin Tautan Publik"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Akses'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
