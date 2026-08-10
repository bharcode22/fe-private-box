import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Download, Lock, Mail, Key, FileText, Folder, RefreshCw, AlertCircle, Sparkles, CheckCircle2, HardDrive, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Footer } from '../components/layout/Footer';
import { setToken, setStoredUser } from '../utils/auth';

interface PublicShareInfo {
  type: 'file' | 'folder';
  name: string;
  fileSize: number;
  mimeType?: string;
  allowDownload: boolean;
  isActive: boolean;
  expiresAt?: string | null;
  isExpired?: boolean;
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const AccessFile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [uniqueCode, setUniqueCode] = useState('');
  const [accessorEmail, setAccessorEmail] = useState('');
  const [shareInfo, setShareInfo] = useState<PublicShareInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');

  // Download & Progress state
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      const formatted = codeParam.trim().toUpperCase();
      setUniqueCode(formatted);
      fetchShareInfo(formatted);
    }
  }, [searchParams]);

  const fetchShareInfo = async (code: string) => {
    if (!code || code.trim() === '') {
      setShareInfo(null);
      setInfoError('');
      return;
    }

    setLoadingInfo(true);
    setInfoError('');
    try {
      const res = await api.get(`/api/share/info/${code.trim().toUpperCase()}`);
      setShareInfo(res.data);
    } catch (err: any) {
      setShareInfo(null);
      const msg = err.response?.data?.error || 'Kode pembagian tidak ditemukan atau tidak valid.';
      setInfoError(msg);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUniqueCode(val);
    if (val.trim().length > 0) {
      fetchShareInfo(val);
    } else {
      setShareInfo(null);
      setInfoError('');
    }
  };

  const handleDownloadPublic = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!uniqueCode || uniqueCode.trim() === '') {
      setErrorMsg('Harap masukkan Kode Unik Akses.');
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    setLoadedBytes(0);
    setTotalBytes(0);
    setDownloadSpeed('');

    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      const res = await api.post(
        '/api/share/download',
        {
          uniqueCode: uniqueCode.trim().toUpperCase(),
          accessorEmail: accessorEmail.trim() || 'Anonim',
        },
        {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total || shareInfo?.fileSize || 0;
            setLoadedBytes(loaded);
            if (total > 0) {
              setTotalBytes(total);
              const percent = Math.round((loaded * 100) / total);
              setDownloadProgress(percent);
            }

            const now = Date.now();
            const timeDiff = (now - lastTime) / 1000;
            if (timeDiff >= 0.5) {
              const speed = (loaded - lastLoaded) / timeDiff;
              setDownloadSpeed(`${(speed / (1024 * 1024)).toFixed(1)} MB/s`);
              lastLoaded = loaded;
              lastTime = now;
            }
          },
        }
      );

      const getHeader = (name: string) => {
        if (!res.headers) return null;
        if (typeof res.headers.get === 'function') return res.headers.get(name);
        return res.headers[name.toLowerCase()] || res.headers[name];
      };

      const contentDisposition = getHeader('content-disposition');
      let fileName = '';

      if (contentDisposition) {
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (filenameStarMatch && filenameStarMatch[1]) {
          try {
            fileName = decodeURIComponent(filenameStarMatch[1]);
          } catch (_) { }
        }
        if (!fileName) {
          const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
          if (fileNameMatch && fileNameMatch[1]) {
            try {
              fileName = decodeURIComponent(fileNameMatch[1]);
            } catch (_) { }
          }
        }
      }

      if (!fileName) {
        fileName = shareInfo?.name || `download_${uniqueCode.trim().toUpperCase()}`;
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      let message = 'Gagal mengunduh file/folder. Pastikan Kode Unik benar dan masih aktif.';
      if (err.response?.data) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            if (json.error) message = json.error;
          } catch (_) { }
        } else if (typeof err.response.data === 'object' && err.response.data.error) {
          message = err.response.data.error;
        }
      }
      setErrorMsg(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setAuthError('Kredensial login Google tidak ditemukan.');
      return;
    }

    setAuthError('');
    try {
      const res = await api.post('/api/auth/google', {
        credential: credentialResponse.credential,
      });
      const data = res.data;
      setToken(data.token);
      setStoredUser(data.user);

      if (data.isNewUser) {
        navigate('/terms', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Gagal memverifikasi login Google.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pt-[58px] sm:pt-[65px] relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition duration-200 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HardDrive className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Private<span className="text-indigo-400">Box</span>
            </span>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-lg shadow-indigo-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Unduh File / Folder Terproteksi</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Masukkan kode unik untuk mengunduh file atau isi folder (ZIP) yang dibagikan secara aman.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleDownloadPublic} className="space-y-5">
            {/* Input Kode Unik */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Kode Unik Akses <span className="text-rose-400">*</span>
                </span>
                {loadingInfo && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
              </label>
              <input
                type="text"
                placeholder="Contoh: MYCODE123"
                value={uniqueCode}
                onChange={handleCodeChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-indigo-300 font-mono font-bold tracking-wider placeholder:font-sans placeholder:text-slate-600 text-base focus:outline-none uppercase"
              />
            </div>

            {/* Error Pre-fetch Status */}
            {infoError && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{infoError}</span>
              </div>
            )}

            {/* Info Pre-Fetch Card (Hanya Nama File & Ukuran) */}
            {shareInfo && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
                    {shareInfo.type === 'folder' ? <Folder className="w-5 h-5 text-indigo-400" /> : <FileText className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate" title={shareInfo.name}>
                      {shareInfo.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{shareInfo.type === 'folder' ? 'Folder ZIP' : 'File Single'}</span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-300">{formatBytes(shareInfo.fileSize)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Kebijakan Unduh:</span>
                  {!shareInfo.isActive ? (
                    <span className="text-rose-400 font-semibold text-[11px] bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      🔒 Link Nonaktif / Kadaluarsa
                    </span>
                  ) : !shareInfo.allowDownload ? (
                    <span className="text-amber-300 font-semibold text-[11px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      🔒 Unduhan Dilarang oleh Pemilik
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Siap Diunduh
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Input Email (Opsional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Anda
                </span>
                <span className="text-[11px] text-slate-500 font-normal">(Opsional)</span>
              </label>
              <input
                type="email"
                placeholder="nama@email.com (Kosongkan jika ingin Anonim)"
                value={accessorEmail}
                onChange={(e) => setAccessorEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>

            {/* Streaming Download Progress Widget */}
            {downloading && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-300 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Memproses Streaming Unduhan...</span>
                  </span>
                  <span className="text-purple-300 font-mono">{downloadProgress}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    {formatBytes(loadedBytes)} {totalBytes > 0 ? `/ ${formatBytes(totalBytes)}` : ''}
                  </span>
                  {downloadSpeed && <span className="text-emerald-400 font-bold">{downloadSpeed}</span>}
                </div>
              </div>
            )}

            {/* Tombol Unduh */}
            <button
              type="submit"
              disabled={
                downloading ||
                loadingInfo ||
                !!infoError ||
                !shareInfo ||
                !shareInfo.isActive ||
                !shareInfo.allowDownload ||
                !!shareInfo.isExpired
              }
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <span>Mengunduh Data File...</span>
              ) : loadingInfo ? (
                <span>Memeriksa Kode Pembagian...</span>
              ) : infoError ? (
                <span>🔒 Kode Pembagian Tidak Ditemukan</span>
              ) : shareInfo && !shareInfo.isActive ? (
                <span>🔒 Link Dinonaktifkan oleh Pemilik</span>
              ) : shareInfo && !shareInfo.allowDownload ? (
                <span>🔒 Pengunduhan Dinonaktifkan oleh Pemilik</span>
              ) : shareInfo && shareInfo.isExpired ? (
                <span>🔒 Link Pembagian Kadaluarsa</span>
              ) : !shareInfo ? (
                <span>Masukkan Kode Unik Akses</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Verifikasi & Unduh File</span>
                </>
              )}
            </button>
          </form>

          {/* CTA Banner Google OAuth Login */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sering Membagikan File Terproteksi?</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dapatkan kuota cloud storage <strong>20 GB Gratis</strong> untuk menyimpan & membagikan file pribadi Anda secara terenkripsi.
            </p>

            {authError && (
              <p className="text-xs text-rose-400 font-semibold">{authError}</p>
            )}

            <div className="flex flex-col items-center justify-center gap-2.5 pt-1">
              <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setAuthError('Login Google gagal atau dibatalkan')}
                  theme="filled_blue"
                  shape="pill"
                  size="medium"
                  text="continue_with"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modular Footer Component */}
      <Footer />
    </div>
  );
};
