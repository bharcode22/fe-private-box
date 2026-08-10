import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HardDrive, Lock, LogOut, User } from 'lucide-react';

interface NavbarProps {
  user?: { name?: string; email?: string } | null;
  onLogout?: () => void;
  showShareButton?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  deleting?: boolean;
  deleteProgress?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  showShareButton = true,
  uploading = false,
  uploadProgress = 0,
  deleting = false,
  deleteProgress = 0,
}) => {
  const location = useLocation();
  const currentPathWithSearch = location.pathname + location.search;
  const lastDashboardSearch = sessionStorage.getItem('pb_last_dashboard_search') || '';
  const dashboardLink = user ? `/dashboard${lastDashboardSearch}` : '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md w-full">
      {/* Top Global Progress Bar (YouTube/GitHub Style for Upload / Delete) */}
      {(uploading || deleting) && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 overflow-hidden z-50">
          {uploading ? (
            uploadProgress >= 100 ? (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
            ) : (
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.9)]"
                style={{ width: `${uploadProgress}%` }}
              />
            )
          ) : deleteProgress >= 100 ? (
            <div className="w-full h-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]" />
          ) : (
            <div
              className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
              style={{ width: `${deleteProgress}%` }}
            />
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={dashboardLink} className="flex items-center space-x-2.5 sm:space-x-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition duration-300">
            <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            Temporary<span className="text-indigo-400">Box</span>
          </span>
        </Link>

        {/* Right Menu / User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/account"
                state={{ from: currentPathWithSearch }}
                className="hidden sm:flex flex-col text-right hover:opacity-80 transition group"
              >
                <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </Link>
              <Link
                to="/account"
                state={{ from: currentPathWithSearch }}
                className="px-2.5 py-2 sm:px-3 rounded-xl border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 text-slate-300 hover:text-indigo-400 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Informasi Akun"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Akun Saya</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {showShareButton && (
                <Link
                  to="/share"
                  className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5 sm:gap-2"
                >
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" /> Unduh Kode
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
