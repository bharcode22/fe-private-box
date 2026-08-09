import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Copy, Folder, FileText, Link as LinkIcon, ShieldCheck, ShieldAlert, RefreshCw, Save, X, Download, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { ShareModalData } from '../../services/shareService';

interface ShareModalProps {
  modalData: ShareModalData | null;
  onClose: () => void;
  onUpdateShare: (
    id: string,
    options: { customCode?: string; isActive?: boolean; allowDownload?: boolean; expiresAt?: string | null }
  ) => Promise<void>;
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
  const [allowDownload, setAllowDownload] = useState(modalData.allowDownload !== false);
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [randomizing, setRandomizing] = useState(false);

  useEffect(() => {
    if (modalData) {
      setCode(modalData.code || '');
      setIsActive(modalData.isActive !== false);
      setAllowDownload(modalData.allowDownload !== false);
      if (modalData.expiresAt) {
        const dateObj = new Date(modalData.expiresAt);
        const dateStr = dateObj.toISOString().split('T')[0];
        setExpiresAt(dateStr);
      } else {
        setExpiresAt('');
      }
    }
  }, [modalData]);

  const publicUrl = `${window.location.origin}/share?code=${code || ''}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateShare(modalData.id, {
        customCode: code,
        isActive,
        allowDownload,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      onClose();
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Consistent Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex-shrink-0 shadow-md shadow-indigo-500/10">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white truncate">
                Bagikan & Kelola Akses
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5" title={modalData.name}>
                {isFolder ? <Folder className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /> : <FileText className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                <span>{isFolder ? 'Folder' : 'File'}:</span> <strong className="text-slate-200 truncate">{modalData.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Active Toggle Switch */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                {isActive ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                Status Akses Link:
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="p-0.5 rounded-xl transition-colors cursor-pointer"
              >
                {isActive ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {isActive ? (
                <span className="text-emerald-400 font-semibold">
                  Aktif — Link terbuka dan dapat diakses publik.
                </span>
              ) : (
                <span className="text-rose-400 font-semibold">
                  Nonaktif — Link dikunci. Pengakses tidak akan dapat masuk.
                </span>
              )}
            </p>
          </div>

          {/* Toggle Allow Download */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-400" />
                Izinkan Pengunduhan File:
              </span>
              <button
                type="button"
                onClick={() => setAllowDownload(!allowDownload)}
                className="p-0.5 rounded-xl transition-colors cursor-pointer"
              >
                {allowDownload ? (
                  <ToggleRight className="w-8 h-8 text-indigo-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {allowDownload ? (
                <span className="text-indigo-300 font-medium">
                  Bisa Diunduh — Pengakses dapat mengunduh & pratinjau.
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  🔒 Hanya Pratinjau — Fitur pengunduhan dilarang / dinonaktifkan.
                </span>
              )}
            </p>
          </div>

          {/* Expiration Date Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" /> Tanggal Kadaluarsa (Opsional):
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Custom Code Input */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-bold">Kode Unik Akses:</label>
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 font-mono text-base font-bold text-indigo-300 uppercase tracking-wider focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(code || '');
                  if (onShowToast) onShowToast('Kode berhasil disalin!', 'success');
                }}
                className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition cursor-pointer border border-indigo-500/20 active:scale-95"
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
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                title="Salin Tautan Publik"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </button>
            </div>
          </div>

          {/* Consistent Footer Action Bar */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800/80 sticky bottom-0 bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 hover:text-white font-bold text-xs border border-slate-700/80 transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Akses'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
