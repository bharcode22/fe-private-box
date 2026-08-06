import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HardDrive, Download, Lock, Mail, Key, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const AccessFile: React.FC = () => {
  const [uniqueCode, setUniqueCode] = useState('');
  const [accessorEmail, setAccessorEmail] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      const contentDisposition = res.headers['content-disposition'];
      let fileName = `file_download_${uniqueCode}.bin`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setErrorMsg(
        'Gagal mengunduh file. Pastikan Kode Unik benar dan masih aktif.'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Private<span className="text-indigo-400">Box</span></span>
          </Link>
        </div>
      </header>

      {/* Download Form */}
      <main className="max-w-md w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Unduh File Terproteksi</h1>
            <p className="text-xs text-slate-400">Masukkan kode unik dan email Anda untuk mengunduh file yang dibagikan.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleDownloadPublic} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> Kode Unik File
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
              <span>Email Anda akan dicatat dalam log akses pemilik file untuk transparansi keamanan.</span>
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
                  <span>Verifikasi & Unduh File</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        Private Box SaaS File Storage &copy; 2026.
      </footer>
    </div>
  );
};
