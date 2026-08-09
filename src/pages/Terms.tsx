import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowRight, Loader2, FileText, Check } from 'lucide-react';
import api from '../services/api';

interface TermsData {
  id: string;
  version: string;
  title: string;
  content: string;
}

export const Terms: React.FC = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTerms, setFetchingTerms] = useState(true);
  const [terms, setTerms] = useState<TermsData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

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
        localStorage.setItem('pb_user', JSON.stringify(res.data.user));
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Accept terms error:', err);
      const msg = err.response?.data?.error || 'Gagal menyimpan persetujuan Syarat & Ketentuan ke database';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Syarat & Ketentuan Penggunaan</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {terms ? `${terms.title} (v${terms.version})` : 'Private Box Free Tier Account Agreement'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-sm text-slate-300 max-h-72 overflow-y-auto pr-2">
          {fetchingTerms ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Memuat data Syarat & Ketentuan dari database...</span>
            </div>
          ) : terms ? (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{terms.title}</span>
              </h3>
              <div className="text-slate-300 whitespace-pre-line leading-relaxed text-xs sm:text-sm font-sans">
                {terms.content}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Aturan Penggunaan Akun Gratis:</h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-slate-200">Kuota Penyimpanan:</strong> Setiap pengguna gratis mendapatkan batas alokasi kapasitas maksimal <strong className="text-indigo-400">10 GB</strong>.
                </li>
                <li>
                  <strong className="text-slate-200">Masa Aktif Akun:</strong> Akun gratis aktif selama <strong className="text-indigo-400">30 hari</strong> sejak tanggal pertama kali pendaftaran.
                </li>
                <li>
                  <strong className="text-slate-200">Masa Kedaluwarsa:</strong> Setelah lewat dari 30 hari, status akun akan berubah menjadi <span className="text-amber-400 font-semibold">READ_ONLY / EXPIRED</span>. Pengguna tidak dapat mengunggah file baru dan hanya dapat mengunduh file lama selama masa tenggang.
                </li>
                <li>
                  <strong className="text-slate-200">Pembagian File:</strong> Pembagian file menggunakan kode unik acak. Setiap pengaksesan/pengunduhan file akan dicatat ke dalam log akses (Email pengunduh & timestamp).
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Persetujuan wajib: Jika Anda tidak menyetujui Syarat & Ketentuan ini, Anda tidak dapat melanjutkan pendaftaran akun maupun menggunakan fitur-fitur pada sistem ini.
          </span>
        </div>

        {/* Interactive Glassmorphic Agreement Card */}
        <label
          className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 cursor-pointer group select-none ${agreed
            ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
            }`}
        >
          <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${agreed
                ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 border-indigo-400 shadow-md shadow-indigo-500/40 scale-105'
                : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
                }`}
            >
              {agreed && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold transition-colors ${agreed ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}`}>
                Konfirmasi Persetujuan Pengguna
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Wajib
              </span>
            </div>
            <p className={`text-xs leading-relaxed transition-colors ${agreed ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'}`}>
              Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan Penggunaan Akun Gratis di atas untuk disimpan ke dalam database.
            </p>
          </div>
        </label>

        <button
          onClick={handleProceed}
          disabled={!agreed || loading}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${agreed && !loading
            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 cursor-pointer active:scale-[0.99]'
            : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
              <span>Menyimpan Persetujuan ke Database...</span>
            </>
          ) : (
            <>
              <span>Setujui & Lanjutkan ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
