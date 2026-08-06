import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HardDrive, Users, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '../services/api';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [slotInfo, setSlotInfo] = useState<{
    totalSlots: number;
    usedSlots: number;
    remainingSlots: number;
    isFull: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('pb_user');
    const token = localStorage.getItem('pb_token');

    if (savedUser && token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    fetchSlotStatus();
  }, [navigate]);

  const fetchSlotStatus = async () => {
    try {
      const res = await api.get('/api/auth/slots');
      setSlotInfo(res.data);
    } catch (err) {
      setSlotInfo({
        totalSlots: Number(import.meta.env.VITE_MAX_FREE_USERS || 100),
        usedSlots: 0,
        remainingSlots: Number(import.meta.env.VITE_MAX_FREE_USERS || 100),
        isFull: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (data: any) => {
    localStorage.setItem('pb_token', data.token);
    localStorage.setItem('pb_user', JSON.stringify(data.user));

    if (data.isNewUser) {
      navigate('/terms', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setAuthError('Kredensial login Google tidak ditemukan.');
      return;
    }

    setLoggingIn(true);
    setAuthError('');

    try {
      // Send real Google OAuth ID Token credential to Backend
      const res = await api.post('/api/auth/google', {
        credential: credentialResponse.credential,
      });

      handleAuthSuccess(res.data);
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Gagal memverifikasi login Google');
    } finally {
      setLoggingIn(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header Component */}
      <Header />

      {/* Hero Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Multi-Drive SaaS Private Storage
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Penyimpanan File Privat Kuota <span className="gradient-text">10 GB Gratis</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Solusi SaaS terpadu penggabungan akun Google Drive dengan tingkat keamanan tinggi. Batas kuota 10 GB per penggunanya selama 30 hari pertama, pembagian file via kode unik acak, dan pencatatan log akses yang transparan.
          </p>

          {/* Slot Capacity Live Meter */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Status Slot Pengguna Gratis (Maks {slotInfo?.totalSlots || 100} User)</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${slotInfo?.isFull ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {slotInfo?.isFull ? 'Tutup / Penuh' : 'Slot Tersedia'}
              </span>
            </div>

            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 relative">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, ((slotInfo?.usedSlots || 0) / (slotInfo?.totalSlots || 100)) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Terpakai: <strong className="text-slate-200">{slotInfo?.usedSlots ?? '...'}</strong> user</span>
              <span>Sisa Slot: <strong className="text-indigo-400">{slotInfo?.remainingSlots ?? '...'}</strong> slot gratis</span>
            </div>
          </div>

          {authError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="pt-4 flex flex-col space-y-4">
            {slotInfo?.isFull ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Kuota pendaftaran pengguna gratis telah penuh (Maksimal {slotInfo.totalSlots} pengguna). Silakan coba lagi nanti.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setAuthError('Login Google gagal atau dibatalkan')}
                    theme="filled_blue"
                    shape="pill"
                    text="continue_with"
                  />
                </div>


              </div>
            )}
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/50 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Direct Google Drive Storage</h3>
            <p className="text-slate-400 text-sm">
              Sistem backend terintegrasi langsung dengan Google Drive Cloud Storage (15 GB Cloud) secara aman dan transparan.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-purple-500/50 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Bagi File via Kode Unik & Log</h3>
            <p className="text-slate-400 text-sm">
              Bagikan file dengan kode acak unik. Setiap pengunduh wajib memasukkan email dan waktunya dicatat di log secara akurat.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};
