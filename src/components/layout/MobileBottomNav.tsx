import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Folder, Activity, User, HardDrive } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'files' | 'logs';
  onTabChange: (tab: 'files' | 'logs') => void;
  user?: any;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  user,
}) => {
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md px-4 py-2 flex items-center justify-around shadow-2xl touch-none">
      {/* Tab 1: File Saya */}
      <button
        type="button"
        onClick={() => onTabChange('files')}
        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
          !isAccountPage && activeTab === 'files'
            ? 'text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${!isAccountPage && activeTab === 'files' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : ''}`}>
          <Folder className="w-5 h-5" />
        </div>
        <span className="text-[10px]">File Saya</span>
      </button>

      {/* Tab 2: Log Aktivitas */}
      <button
        type="button"
        onClick={() => onTabChange('logs')}
        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
          !isAccountPage && activeTab === 'logs'
            ? 'text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${!isAccountPage && activeTab === 'logs' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : ''}`}>
          <Activity className="w-5 h-5" />
        </div>
        <span className="text-[10px]">Aktivitas</span>
      </button>

      {/* Tab 3: Akun Saya */}
      <Link
        to="/account"
        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
          isAccountPage
            ? 'text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${isAccountPage ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : ''}`}>
          <User className="w-5 h-5" />
        </div>
        <span className="text-[10px]">Akun Saya</span>
      </Link>
    </nav>
  );
};
