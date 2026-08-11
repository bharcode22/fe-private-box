import React, { useState } from 'react';
import { Plus, UploadCloud, FolderPlus, X } from 'lucide-react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface MobileFABProps {
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  onUploadClick,
  onCreateFolderClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  useLockBodyScroll(isOpen);

  return (
    <div className="fixed bottom-20 right-5 z-40 sm:hidden flex flex-col items-end">
      {/* Expanded Action Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="mb-3 space-y-2.5 z-40 animate-slideUp flex flex-col items-end">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onUploadClick();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 cursor-pointer active:scale-95 border border-indigo-400/30"
          >
            <span>Unggah File</span>
            <div className="p-1 rounded-lg bg-white/20">
              <UploadCloud className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCreateFolderClick();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-slate-100 font-bold text-xs shadow-xl shadow-slate-900/50 cursor-pointer active:scale-95 border border-slate-800"
          >
            <span>Folder Baru</span>
            <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FolderPlus className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 cursor-pointer active:scale-90 z-40 ${
          isOpen
            ? 'bg-slate-800 border border-slate-700 text-slate-300 rotate-45 shadow-slate-900/60'
            : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 shadow-indigo-600/40 ring-4 ring-indigo-500/20'
        }`}
        title={isOpen ? 'Tutup Menu' : 'Tambah File atau Folder'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
      </button>
    </div>
  );
};
