import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ShieldCheck, ArrowLeft, RotateCw, LogOut, UserX } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { AccountStatusCards } from '../components/dashboard/AccountStatusCards';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { ConfirmModal } from '../components/common/Popups';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { TermsModal } from '../components/dashboard/TermsModal';
import { formatBytes } from '../utils/formatters';
import { getDaysRemaining } from '../utils/dateUtils';
import { getStoredUser, getToken, clearAuth, getLastSearch } from '../utils/auth';
import { FREE_QUOTA_BYTES } from '../constants/config';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<{
    storageLimit: number;
    storageUsed: number;
    accountStatus: string;
    expiresAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isReadOnlyTermsOpen, setIsReadOnlyTermsOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  useEffect(() => {
    const savedUser = getStoredUser();
    const token = getToken();

    if (!savedUser || !token) {
      navigate('/');
      return;
    }

    setUser(savedUser);

    if (!(savedUser as any).acceptedTermsAt) {
      setIsTermsModalOpen(true);
    }

    const handleRequireTerms = () => setIsTermsModalOpen(true);
    window.addEventListener('pb:require-terms', handleRequireTerms);

    fetchAccountData();

    return () => window.removeEventListener('pb:require-terms', handleRequireTerms);
  }, [navigate]);

  const fetchAccountData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await api.get('/api/files');
      setUserInfo(res.data.userInfo);
    } catch (err) {
      console.error('Fetch account info error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Permanen',
      message: (
        <div className="space-y-2">
          <p>Apakah Anda yakin ingin menghapus akun Anda secara permanen?</p>
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️ Semua file, folder, dan riwayat akses Anda akan terhapus dari sistem dan tidak dapat dikembalikan.</span>
          </div>
        </div>
      ),
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.delete('/api/auth/account');
          clearAuth();
          navigate('/', { replace: true });
        } catch (err: any) {
          console.error('Delete account error:', err);
          alert(err.response?.data?.error || 'Gagal menghapus akun');
        }
      },
    });
  };

  const handleBack = () => {
    const stateFrom = location.state?.from;
    const returnUrl = stateFrom || `/dashboard`;
    navigate(returnUrl);
  };

  const usedBytes = Number(userInfo?.storageUsed || 0);
  const limitBytes = Math.max(Number(userInfo?.storageLimit || 0), FREE_QUOTA_BYTES);
  const quotaPercent = Math.min(100, (usedBytes / limitBytes) * 100);
  const daysLeft = getDaysRemaining(userInfo?.expiresAt);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pt-[58px] sm:pt-[65px] relative overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar Header (Tanpa Tombol Logout di Navbar) */}
      <Navbar user={user} />

      {/* Main Account Content */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white transition flex-shrink-0 cursor-pointer active:scale-95"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 truncate">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-400 flex-shrink-0" />
                <span className="truncate">Informasi Akun</span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => fetchAccountData(true)}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:opacity-50 flex-shrink-0 active:scale-95"
            title="Muat Ulang Informasi Akun"
          >
            <RotateCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-xl font-extrabold shadow-lg shadow-indigo-500/20 flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                <span className="truncate">{user?.name || 'Pengguna Private Box'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </h2>
              <p className="text-xs text-slate-400 truncate">{user?.email || '-'}</p>
            </div>
          </div>

          <div className="flex justify-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800/80 text-xs">
            <span className="text-slate-400">Temporary:</span>
            <span className="font-bold text-indigo-400">(20 GB / 5 Bulan)</span>
          </div>
        </div>

        {/* Account Status Cards Component */}
        <div className="space-y-4">
          <h3 className="text-sm text-center font-bold text-slate-300 uppercase tracking-wider">
            Status Penyimpanan & Lisensi
          </h3>
          {loading ? (
            <CardSkeleton count={3} />
          ) : (
            <AccountStatusCards
              usedBytes={usedBytes}
              limitBytes={limitBytes}
              quotaPercent={quotaPercent}
              daysLeft={daysLeft}
              accountStatus={userInfo?.accountStatus}
              formatBytes={formatBytes}
            />
          )}
        </div>

        {/* Account Actions Section */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setIsReadOnlyTermsOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-900/20 hover:bg-indigo-900/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-sm font-bold transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Syarat & Ketentuan</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 text-sm font-bold transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar / Logout </span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-red-600/15 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 text-sm font-bold transition flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-red-950/30 active:scale-95"
          >
            <User className="w-4 h-4" />
            <span>Hapus Akun</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab="files"
        onTabChange={(tab) => {
          sessionStorage.setItem('pb_active_tab', tab);
          navigate('/dashboard');
        }}
        user={user}
      />

      {/* Terms & Conditions Blocking Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onSuccess={(updatedUser) => {
          setIsTermsModalOpen(false);
          if (updatedUser) setUser(updatedUser);
          fetchAccountData();
        }}
        onCancel={() => {
          clearAuth();
          navigate('/');
        }}
      />

      {/* ReadOnly Terms Modal */}
      <TermsModal
        isOpen={isReadOnlyTermsOpen}
        readOnly={true}
        onSuccess={() => setIsReadOnlyTermsOpen(false)}
        onCancel={() => setIsReadOnlyTermsOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
