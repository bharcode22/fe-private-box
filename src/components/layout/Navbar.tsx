import React from 'react';
import { Link } from 'react-router-dom';
import { HardDrive, Lock, LogOut } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition duration-300">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Private<span className="text-indigo-400">Box</span>
          </span>
        </Link>

        {/* Right Menu / User Profile */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            showShareButton && (
              <Link
                to="/share"
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-indigo-400" /> Unduh via Kode Akses
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
};
