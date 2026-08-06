import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShieldCheck, ArrowLeft, RotateCw } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { AccountStatusCards } from '../components/dashboard/AccountStatusCards';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { Footer } from '../components/layout/Footer';
import { formatBytes } from '../utils/formatters';
import { getDaysRemaining } from '../utils/dateUtils';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<{
    storageLimit: number;
    storageUsed: number;
    accountStatus: string;
    expiresAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pb_user');
    const token = localStorage.getItem('pb_token');

    if (!savedUser || !token) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchAccountData();
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
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    navigate('/', { replace: true });
  };

  const usedBytes = Number(userInfo?.storageUsed || 0);
  const limitBytes = Number(userInfo?.storageLimit || import.meta.env.VITE_FREE_USER_QUOTA_BYTES || 10737418240);
  const quotaPercent = Math.min(100, (usedBytes / limitBytes) * 100);
  const daysLeft = getDaysRemaining(userInfo?.expiresAt);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar Header */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Account Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-10 flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white transition"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-400" /> Informasi & Status Akun
              </h1>
              <p className="text-xs text-slate-400">Detail lisensi, kuota penyimpanan, dan masa aktif akun Anda.</p>
            </div>
          </div>

          <button
            onClick={() => fetchAccountData(true)}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:opacity-50"
            title="Muat Ulang Informasi Akun"
          >
            <RotateCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {user?.name || 'Pengguna Private Box'}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400">{user?.email || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800/80 text-xs">
            <span className="text-slate-400">Tipe Lisensi:</span>
            <span className="font-bold text-indigo-400">Free Tier (10 GB / 30 Hari)</span>
          </div>
        </div>

        {/* Account Status Cards Component */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
