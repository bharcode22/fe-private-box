import React from 'react';
import { HardDrive, Clock, Shield } from 'lucide-react';
import { FREE_ACTIVE_DAYS } from '../../constants/config';

interface AccountStatusCardsProps {
  usedBytes: number;
  limitBytes: number;
  quotaPercent: number;
  daysLeft: number;

  accountStatus?: string;
  formatBytes: (bytes: number) => string;
}

export const AccountStatusCards: React.FC<AccountStatusCardsProps> = ({
  usedBytes,
  limitBytes,
  quotaPercent,
  daysLeft,
  accountStatus,
  formatBytes,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Storage Quota Card */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
          <span>Sisa Kuota Penyimpanan</span>
          <HardDrive className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white">
          {formatBytes(usedBytes)}{' '}
          <span className="text-slate-500 text-sm sm:text-base font-normal">/ {formatBytes(limitBytes)}</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
            style={{ width: `${quotaPercent}%` }}
          ></div>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400">Terpakai {quotaPercent.toFixed(1)}% dari kuota {formatBytes(limitBytes)} gratis Anda.</p>
      </div>

      {/* Active Subscription Meter */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
          <span>Masa Aktif Akun (5 Bulan)</span>
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white">
          {daysLeft} Hari <span className="text-slate-500 text-sm sm:text-base font-normal">tersisa</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (daysLeft / FREE_ACTIVE_DAYS) * 100)}%` }}
          ></div>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400">Masa aktif gratis sejak pendaftaran pertama.</p>
      </div>

      {/* Account Status Badge */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
          <span>Status Lisensi Akun</span>
          <Shield className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${accountStatus === 'EXPIRED'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
          >
            {accountStatus || 'ACTIVE'}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400">
          {accountStatus === 'EXPIRED'
            ? 'Akun kedaluwarsa. Hanya dapat mengunduh file lama.'
            : 'Akun aktif penuh untuk unggah & unduh file.'}
        </p>
      </div>
    </div>
  );
};
