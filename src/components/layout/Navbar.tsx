import React from 'react';
import { Link } from 'react-router-dom';
import { HardDrive, Lock, LogOut, User } from 'lucide-react';

interface NavbarProps {
  user?: { name?: string; email?: string } | null;
  onLogout?: () => void;
  showShareButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  showShareButton = true,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5 sm:space-x-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition duration-300">
            <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            Private<span className="text-indigo-400">Box</span>
          </span>
        </Link>

        {/* Right Menu / User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/account"
                className="hidden sm:flex flex-col text-right hover:opacity-80 transition group"
              >
                <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </Link>
              <Link
                to="/account"
                className="px-2.5 py-2 sm:px-3 rounded-xl border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 text-slate-300 hover:text-indigo-400 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Informasi & Status Akun"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Akun Saya</span>
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-800 hover:border-red-500/40 hover:bg-red-950/30 text-slate-400 hover:text-red-400 transition cursor-pointer active:scale-95"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </>
          ) : (
            showShareButton && (
              <Link
                to="/share"
                className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5 sm:gap-2"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" /> Unduh via Kode
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
};
