import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Key, Download, ToggleLeft, ToggleRight, Calendar, Save, CheckCircle, AlertCircle, Loader2, RefreshCw, Copy, Link as LinkIcon, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { ConfirmModal } from '../common/Popups';

export interface ShareData {
  id: string;
  uniqueCode: string;
  allowDownload: boolean;
  isActive: boolean;
  expiresAt: string | null;
}

interface ManageShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  share: ShareData | null;
  fileName?: string;
  onSuccess?: () => void;
}

export const ManageShareModal: React.FC<ManageShareModalProps> = ({
  isOpen,
  onClose,
  share,
  fileName,
  onSuccess,
}) => {
  const [uniqueCode, setUniqueCode] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (share && isOpen) {
      setUniqueCode(share.uniqueCode || '');
      setAllowDownload(share.allowDownload ?? true);
      setIsActive(share.isActive ?? true);
      if (share.expiresAt) {
        const dateObj = new Date(share.expiresAt);
        const dateStr = dateObj.toISOString().split('T')[0];
        setExpiresAt(dateStr);
      } else {
        setExpiresAt('');
      }
      setErrorMsg('');
      setSuccessMsg('');
      setShowDeleteConfirm(false);
    }
  }, [share, isOpen]);

  if (!isOpen || !share) return null;

  const handleGenerateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUniqueCode(result);
  };

  const handleCopyCode = () => {
    if (uniqueCode) {
      navigator.clipboard.writeText(uniqueCode);
      setSuccessMsg('Kode unik berhasil disalin ke clipboard!');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const publicUrl = `${window.location.origin}/share?code=${uniqueCode || ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!uniqueCode || uniqueCode.trim() === '') {
      setErrorMsg('Kode akses tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/share/${share.id}`, {
        uniqueCode: uniqueCode.trim().toUpperCase(),
        allowDownload,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      setSuccessMsg('Pengaturan link pembagian berhasil diperbarui!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to update share settings:', err);
      const msg = err.response?.data?.error || 'Gagal memperbarui pengaturan link.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteShare = async () => {
    setShowDeleteConfirm(false);
    if (!share) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await api.delete(`/api/share/${share.id}`);
      setSuccessMsg('Link pembagian dan izin pengunduhan berhasil dihapus!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to delete share link:', err);
      setErrorMsg(err.response?.data?.error || 'Gagal menghapus link pembagian');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Consistent Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 flex-shrink-0 shadow-md shadow-purple-500/10">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white truncate">
                Kelola Link Pembagian
              </h3>
              {fileName && (
                <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5" title={fileName}>
                  {fileName}
                </p>
              )}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Edit Kode Akses & Salin */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> Kode Akses Pembagian
              </label>
              <button
                type="button"
                onClick={handleGenerateRandomCode}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Generate Random Code"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Acak Kode Baru</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                placeholder="Contoh: MYCODE123"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-indigo-300 font-mono text-sm font-bold uppercase placeholder:font-sans placeholder:text-slate-600 focus:outline-none tracking-wider"
              />
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition cursor-pointer border border-indigo-500/20 active:scale-95"
                title="Salin Kode Akses"
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
                  setSuccessMsg('Link publik berhasil disalin!');
                  setTimeout(() => setSuccessMsg(''), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                title="Salin Tautan Publik"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </button>
            </div>
          </div>

          {/* Toggle Allow Download */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-lg ${allowDownload ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Izinkan Pengunduhan</h4>
                  <p className="text-[11px] text-slate-400">
                    {allowDownload
                      ? 'Penerima link dapat melihat pratinjau & mengunduh file'
                      : '🔒 Hanya Pratinjau (Pengunduhan dilarang / dinonaktifkan)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAllowDownload(!allowDownload)}
                className={`p-1 rounded-xl transition-colors cursor-pointer ${allowDownload ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                {allowDownload ? (
                  <ToggleRight className="w-8 h-8 text-indigo-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Toggle Active Status */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Status Link Akses</h4>
                  <p className="text-[11px] text-slate-400">
                    {isActive ? 'Link aktif dan dapat diakses publik' : 'Link dinonaktifkan sementara'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`p-1 rounded-xl transition-colors cursor-pointer ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}
              >
                {isActive ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Expiration Date */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Tanggal Kadaluarsa (Opsional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white text-xs focus:outline-none"
            />
          </div>

          {/* Consistent Footer Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 sticky bottom-0 bg-slate-900">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              title="Hapus Link & Cabut Semua Izin Pengunduhan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Link</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 hover:text-white font-bold text-xs border border-slate-700/80 transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <X className="w-2.5 h-2.5 text-slate-400" />
                <span className='btn'>Batal</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>

        {/* Custom Confirmation Popup Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Hapus Link Pembagian"
          message={`Apakah Anda yakin ingin menghapus link pembagian "${uniqueCode}"? Semua izin pengunduhan akan dicabut dan log pembagian akan dibersihkan.`}
          confirmText="Ya, Hapus Link"
          cancelText="Batal"
          isDanger={true}
          onConfirm={handleConfirmDeleteShare}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>,
    document.body
  );
};
