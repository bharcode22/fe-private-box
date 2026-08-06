import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Lock, Mail, Key, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const AccessFile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [uniqueCode, setUniqueCode] = useState('');
  const [accessorEmail, setAccessorEmail] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setUniqueCode(codeParam.trim().toUpperCase());
    }
  }, [searchParams]);

  const handleDownloadPublic = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!uniqueCode || !accessorEmail) {
      setErrorMsg('Harap isi Kode Unik dan Alamat Email Anda.');
      return;
    }

    setDownloading(true);
    try {
      const res = await api.post(
        '/api/share/download',
        {
          uniqueCode: uniqueCode.trim().toUpperCase(),
          accessorEmail: accessorEmail.trim(),
        },
        { responseType: 'blob' }
      );

      const getHeader = (name: string) => {
        if (!res.headers) return null;
        if (typeof res.headers.get === 'function') return res.headers.get(name);
        return res.headers[name.toLowerCase()] || res.headers[name];
      };

      const contentDisposition = getHeader('content-disposition');
      let fileName = '';

      if (contentDisposition) {
        // 1. Try filename*=UTF-8''...
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (filenameStarMatch && filenameStarMatch[1]) {
          try {
            fileName = decodeURIComponent(filenameStarMatch[1]);
          } catch (_) {
            fileName = filenameStarMatch[1];
          }
        }
        // 2. Try filename="..." or filename=...
        if (!fileName) {
          const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
          if (fileNameMatch && fileNameMatch[1]) {
            try {
              fileName = decodeURIComponent(fileNameMatch[1]);
            } catch (_) {
              fileName = fileNameMatch[1];
            }
          }
        }
      }

      if (!fileName) {
        fileName = `download_${uniqueCode.trim().toUpperCase()}`;
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
          } catch (_) {}
        } else if (typeof err.response.data === 'object' && err.response.data.error) {
          message = err.response.data.error;
        }
      }
      setErrorMsg(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Modular Navbar Header Component */}
      <Navbar showShareButton={false} />

      {/* Download Form */}
      <main className="max-w-md w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Unduh File / Folder Terproteksi</h1>
            <p className="text-xs text-slate-400">Masukkan kode unik dan email Anda untuk mengunduh file atau folder (ZIP) yang dibagikan.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleDownloadPublic} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> Kode Unik File / Folder
              </label>
              <input
                type="text"
                placeholder="Contoh: 8F2A9B1C"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white font-mono placeholder:font-sans placeholder:text-slate-600 text-sm focus:outline-none uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Anda (Pengunduh)
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={accessorEmail}
                onChange={(e) => setAccessorEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Email Anda akan dicatat dalam log akses pemilik file/folder untuk transparansi keamanan.</span>
            </div>

            <button
              type="submit"
              disabled={downloading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {downloading ? (
                <span>Memproses Unduhan...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Verifikasi & Unduh</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Modular Footer Component */}
      <Footer />
    </div>
  );
};
