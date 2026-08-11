import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, AlertTriangle, ArrowRight, Loader2, FileText, Check, HardDrive, Clock, Trash2, KeyRound, AlertOctagon, LogOut } from 'lucide-react';
import api from '../../services/api';
import { setStoredUser, clearAuth } from '../../utils/auth';

interface TermsData {
  id: string;
  version: string;
  title: string;
  content: string;
}

interface TermsModalProps {
  isOpen: boolean;
  onSuccess: (updatedUser?: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

const renderMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-4 sm:pl-5 space-y-1.5 text-slate-300 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const parseInline = (inlineText: string) => {
    const parts = inlineText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-indigo-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} className="text-sm sm:text-lg font-black text-white mt-2.5 mb-1.5 border-b border-slate-800 pb-1.5 break-words">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-xs sm:text-base font-extrabold text-white mt-2.5 mb-1 break-words">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-xs sm:text-sm font-bold text-indigo-400 mt-2 mb-1 flex items-start gap-1.5 break-words">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed === '---') {
      flushList();
      elements.push(<hr key={index} className="border-slate-800/80 my-2.5" />);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(
        <li key={index} className="text-slate-300 leading-relaxed text-[11px] sm:text-sm break-words">
          {parseInline(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(
        <li key={index} className="text-slate-300 leading-relaxed text-[11px] sm:text-sm break-words">
          {parseInline(trimmed.replace(/^\d+\.\s/, ''))}
        </li>
      );
    } else if (trimmed.length > 0) {
      flushList();
      elements.push(
        <p key={index} className="text-slate-300 leading-relaxed text-[11px] sm:text-sm my-1 break-words">
          {parseInline(trimmed)}
        </p>
      );
    } else {
      flushList();
    }
  });

  flushList();
  return elements;
};

const cleanTitle = (rawTitle?: string) => {
  if (!rawTitle) return '';
  return rawTitle.replace(/^[#\s]+/, '').replace(/\*\*/g, '').trim();
};

const getHeaderTitle = (terms: TermsData | null): string => {
  if (!terms) return 'Syarat & Ketentuan Penggunaan';
  const isMarkdown =
    terms.title.includes('\n') || terms.title.startsWith('#') || terms.title.length > 80;
  if (isMarkdown) {
    return 'Syarat & Ketentuan Penggunaan';
  }
  return cleanTitle(terms.title) || 'Syarat & Ketentuan Penggunaan';
};

const getMarkdownContent = (terms: TermsData | null): string => {
  if (!terms) return '';

  const titleHasMarkdown =
    terms.title &&
    (terms.title.includes('\n') || terms.title.startsWith('#') || terms.title.length > 80);

  if (titleHasMarkdown) {
    const cleanContent = terms.content && !terms.content.includes('10 GB') ? terms.content : '';
    return `${terms.title}\n\n${cleanContent}`.trim();
  }

  return terms.content || terms.title || '';
};

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  readOnly = false,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTerms, setFetchingTerms] = useState(true);
  const [terms, setTerms] = useState<TermsData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTerms();
    }
  }, [isOpen]);

  const fetchTerms = async () => {
    setFetchingTerms(true);
    try {
      const res = await api.get('/api/auth/terms/active');
      if (res.data.terms) {
        setTerms(res.data.terms);
      }
    } catch (err) {
      console.error('Failed to fetch terms:', err);
    } finally {
      setFetchingTerms(false);
    }
  };

  const handleProceed = async () => {
    if (!agreed || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/api/auth/accept-terms', { version: terms?.version || '1.0' });
      if (res.data.user) {
        setStoredUser(res.data.user);
      }
      onSuccess(res.data.user);
    } catch (err: any) {
      console.error('Accept terms error:', err);
      const msg = err.response?.data?.error || 'Gagal menyimpan persetujuan Syarat & Ketentuan ke database';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    if (onCancel) {
      onCancel();
    } else {
      clearAuth();
      window.location.href = '/';
    }
  };

  if (!isOpen) return null;

  const markdownText = getMarkdownContent(terms);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto overflow-x-hidden animate-fadeIn min-w-0 max-w-full box-border">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[550px] aspect-square bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full min-w-0 glass-card p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-3.5 sm:space-y-5 relative my-auto box-border">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-xl font-extrabold text-white truncate leading-tight">
                {getHeaderTitle(terms)}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {terms ? `Versi ${terms.version} — Temporary Box Agreement` : 'Private Box Temporary Sharing Agreement'}
              </p>
            </div>
          </div>

          {!readOnly && (
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap flex-shrink-0">
              Persetujuan Wajib
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs break-words">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Terms Content Box */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800/90 max-h-[48vh] sm:max-h-[380px] overflow-y-auto overflow-x-hidden pr-1.5 sm:pr-2 custom-scrollbar min-w-0 max-w-full break-words">
          {fetchingTerms ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-indigo-400" />
              <span>Memuat data Syarat & Ketentuan dari database...</span>
            </div>
          ) : markdownText ? (
            <div className="space-y-1 min-w-0 max-w-full break-words">
              {renderMarkdown(markdownText)}
            </div>
          ) : (
            <div className="space-y-3 text-xs sm:text-sm min-w-0 max-w-full break-words">
              <h3 className="font-bold text-white text-xs sm:text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Aturan Penggunaan Sistem Temporary Box</span>
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-slate-200">1. Kuota Penyimpanan:</strong>
                    <span className="text-slate-400 block mt-0.5 break-words">
                      Setiap pengguna mendapatkan alokasi penyimpanan maksimal sebesar <strong className="text-indigo-300">20 GB</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-slate-200">2. Masa Aktif Akun:</strong>
                    <span className="text-slate-400 block mt-0.5 break-words">
                      Akun gratis aktif selama <strong className="text-purple-300">5 bulan</strong> sejak tanggal pendaftaran pertama kali.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-slate-200">3. Masa Kedaluwarsa & Penghapusan:</strong>
                    <span className="text-slate-400 block mt-0.5 break-words">
                      Setelah lewat 5 bulan, seluruh berkas, folder, dan riwayat akan <strong className="text-rose-300">dihapus secara permanen</strong> oleh sistem.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-slate-200">4. Pembagian File & Log Akses:</strong>
                    <span className="text-slate-400 block mt-0.5 break-words">
                      Setiap pengaksesan atau pengunduhan berkas akan dicatat ke dalam log akses secara <strong className="text-amber-300">terenkripsi</strong> demi keamanan.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-slate-200">5. Batasan Tanggung Jawab:</strong>
                    <span className="text-slate-400 block mt-0.5 break-words">
                      File atau folder yang terhapus <strong className="text-red-300">tidak dapat dikembalikan</strong>. Jangan menyimpan file penting di sistem ini. Kehilangan file tidak menjadi tanggung jawab sistem Temporary Box.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!readOnly && (
          <>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs flex items-start gap-2 sm:gap-2.5 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Persetujuan wajib: Anda tidak dapat mengakses sistem sebelum menyetujui syarat dan ketentuan.
              </span>
            </div>

            <label
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-start gap-3 sm:gap-4 cursor-pointer group select-none ${agreed
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
            >
              <div className="relative flex items-center justify-center mt-0.5 sm:mt-1 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl border transition-all flex items-center justify-center ${agreed
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 border-indigo-400 shadow-md shadow-indigo-500/40 scale-105'
                    : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
                    }`}
                >
                  {agreed && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />}
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className={`text-xs sm:text-sm font-bold transition-colors ${agreed ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}`}>
                    Centang untuk setuju
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Wajib
                  </span>
                </div>
                <p className={`text-[11px] sm:text-xs leading-relaxed transition-colors ${agreed ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'} break-words`}>
                  Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan Penggunaan Akun di atas.
                </p>
              </div>
            </label>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-0.5">
          {readOnly ? (
            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
                else onSuccess(); // Fallback
              }}
              className="w-full py-3.5 rounded-xl sm:rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              Tutup
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDecline}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Keluar dari sistem jika menolak"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                <span>Keluar Akun</span>
              </button>

              <button
                type="button"
                onClick={handleProceed}
                disabled={!agreed || loading}
                className={`w-full sm:flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${agreed && !loading
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-indigo-300" />
                    <span>Menyimpan Persetujuan...</span>
                  </>
                ) : (
                  <>
                    <span>Setujui & Masuk Sistem</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
