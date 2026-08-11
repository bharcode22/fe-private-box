import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HardDrive, Users, ArrowRight, Sparkles, AlertCircle, Smartphone, Clock, Download, ChevronDown } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import appAndPlayImg from '../assets/appandplay.png';
import { getToken, getStoredUser, setToken, setStoredUser, clearAuth } from '../utils/auth';
import { MAX_FREE_USERS } from '../constants/config';
import { TermsModal } from '../components/dashboard/TermsModal';

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
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const savedUser = getStoredUser();
    const token = getToken();

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
        totalSlots: MAX_FREE_USERS,
        usedSlots: 0,
        remainingSlots: MAX_FREE_USERS,
        isFull: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (data: any) => {
    setToken(data.token);
    setStoredUser(data.user);

    if (data.isNewUser || !data.user.acceptedTermsAt) {
      setShowTermsModal(true);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pt-[58px] sm:pt-[65px] relative overflow-x-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header Component */}
      <Navbar showShareButton={true} />

      {/* Hero Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Multi-Drive SaaS Private Storage
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Penyimpanan File Temporary Privat Kuota <span className="gradient-text">20 GB Gratis</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Batas kuota 20 GB per penggunanya selama 5 bulan, pembagian file via kode unik, dan pencatatan log akses yang anonim.
          </p>

          {/* Slot Capacity Live Meter */}
          <div className="p-4 sm:p-6 rounded-2xl glass-card border border-slate-800/80 shadow-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-semibold">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 flex-shrink-0" />
                <span>Status Slot Pengguna (Maks {slotInfo?.totalSlots || 200} User)</span>
              </div>
              <span className={`self-start sm:self-auto text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full ${slotInfo?.isFull ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {slotInfo?.isFull ? 'Tutup / Penuh' : 'Slot Tersedia'}
              </span>
            </div>

            <div className="w-full bg-slate-900 h-2.5 sm:h-3 rounded-full overflow-hidden border border-slate-800 relative">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, ((slotInfo?.usedSlots || 0) / (slotInfo?.totalSlots || 100)) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 font-medium">
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
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setAuthError('Login Google gagal atau dibatalkan')}
                    theme="filled_blue"
                    shape="pill"
                    size="large"
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
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" /> Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Download Aplikasi Android</h3>

            <details className="group mb-4 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all duration-300">
              <summary className="cursor-pointer p-3 sm:p-3.5 text-sm font-semibold text-slate-300 hover:text-white flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Peringatan Keamanan</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 text-slate-400 text-xs leading-relaxed border-t border-slate-800/50 mt-1 pt-3 bg-slate-950/30">
                Unduh APK resmi Temporary Box hanya melalui situs ini. Harap berhati-hati terhadap pihak atau situs tidak resmi yang mengatasnamakan Temporary Box. Pastikan Anda hanya mengunduh APK dari sumber resmi untuk menghindari risiko keamanan dan hal-hal yang tidak diinginkan. Pengelola Temporary Box tidak bertanggung jawab atas segala kerugian, kerusakan, atau risiko yang timbul akibat pengunduhan dan penggunaan APK yang diperoleh dari sumber yang tidak resmi atau tidak dikenal.
              </div>
            </details>

            <div className="mb-4">
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50 font-semibold text-sm select-none"
              >
                <Download className="w-4.5 h-4.5 text-slate-500" />
                <span>Download APK Android (Belum Tersedia)</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col items-center gap-2">
              <img
                src={appAndPlayImg}
                alt="Available on Google Play and App Store"
                className="h-9 sm:h-10 w-auto object-contain opacity-60 filter grayscale hover:grayscale-0 hover:opacity-90 transition duration-300"
              />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon di Google Play & App Store
              </span>
            </div>

          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/50 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Direct Cloud Storage</h3>
            <p className="text-slate-400 text-sm">
              Sistem terintegrasi langsung dengan Cloud Storage (20 GB Cloud) secara aman.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-purple-500/50 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Bagi File Via Kode Unik & Private</h3>
            <p className="text-slate-400 text-sm">
              Bagikan file dengan kode unik. Setiap pengunduh opsional memasukkan email dan waktunya dicatat di log secara akurat.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <Footer />

      {/* Rendering Terms Modal directly here */}
      {showTermsModal && (
        <TermsModal
          isOpen={showTermsModal}
          onSuccess={() => navigate('/dashboard', { replace: true })}
          onCancel={() => {
            setShowTermsModal(false);
            clearAuth();
          }}
        />
      )}
    </div>
  );
};
