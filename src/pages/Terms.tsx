import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const Terms: React.FC = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (!agreed) return;
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="max-w-2xl w-full glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Syarat & Ketentuan Penggunaan</h1>
            <p className="text-sm text-slate-400">Private Box Free Tier Account Agreement</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-sm text-slate-300 max-h-72 overflow-y-auto pr-2">
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

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Dengan mencentang persetujuan di bawah ini, Anda memahami dan menyetujui seluruh ketentuan batas kapasitas 10 GB dan masa aktif 30 hari pada layanan ini.
          </span>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-200 group-hover:text-white">
            Saya telah membaca dan menyetujui seluruh Syarat & Ketentuan di atas.
          </span>
        </label>

        <button
          onClick={handleProceed}
          disabled={!agreed}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition ${agreed
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
        >
          <span>Lanjutkan ke Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
