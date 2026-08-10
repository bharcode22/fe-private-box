import React from 'react';
import { CheckSquare, Trash2, List, LayoutGrid, Files } from 'lucide-react';

interface FileListToolbarProps {
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  totalSelected: number;
  totalItems: number;
  totalFolders?: number;
  totalFiles?: number;
  onBatchDelete?: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  className?: string;
}

export const FileListToolbar: React.FC<FileListToolbarProps> = ({
  isSelectionMode,
  onToggleSelectionMode,
  isAllSelected,
  onToggleSelectAll,
  totalSelected,
  totalItems,
  totalFolders,
  totalFiles,
  onBatchDelete,
  viewMode,
  onViewModeChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 px-3 sm:px-6 bg-slate-900/90 border-b border-slate-800/80 ${className}`}>
      {/* Top Row / Main Controls */}
      <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSelectionMode}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${isSelectionMode
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm font-extrabold'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/80'
              }`}
          >
            <CheckSquare className={`w-3.5 h-3.5 ${isSelectionMode ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>{isSelectionMode ? 'Selesai' : 'Pilih'}</span>
          </button>

          {/* Informasi Total Data di Path / Folder */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs shadow-inner">
            <Files className="w-3.5 h-3.5 text-indigo-400" />
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium hidden sm:inline">Total:</span>
              <span className="font-bold text-indigo-300">{totalItems}</span>
              <span className="text-slate-400 font-medium">item</span>
            </div>
            {(totalFolders !== undefined && totalFiles !== undefined) && (
              <span className="text-slate-400 text-[11px] font-medium border-l border-slate-700 pl-1.5 hidden md:inline">
                {totalFolders} folder, {totalFiles} file
              </span>
            )}
          </div>
        </div>

        {/* View Mode Switcher on Mobile (aligned right on top row) */}
        <div className="flex sm:hidden items-center p-1 rounded-xl bg-slate-950/90 border border-slate-800/90 shadow-inner gap-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${viewMode === 'table'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
              }`}
            title="Tampilan List/Tabel"
          >
            <List className="w-3.5 h-3.5" />
            <span className="text-[11px]">List</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${viewMode === 'grid'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
              }`}
            title="Tampilan Grid/Petak"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[11px]">Grid</span>
          </button>
        </div>
      </div>

      {/* Row 2 / Sub-bar for Selection Actions (When Selection Mode Active) */}
      {isSelectionMode && (
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-200 hover:text-white transition">
              Pilih Semua ({totalItems})
            </span>
          </label>

          {totalSelected > 0 && onBatchDelete && (
            <button
              type="button"
              onClick={onBatchDelete}
              className="px-3 py-1 rounded-lg bg-red-600/25 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({totalSelected})</span>
            </button>
          )}
        </div>
      )}

      {/* Mode Tampilan Switcher (Desktop view) */}
      <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => onViewModeChange('table')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'table'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
            }`}
          title="Tampilan Tabel"
        >
          <List className="w-3.5 h-3.5" />
          <span>Tabel</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'grid'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
            }`}
          title="Tampilan Petak (Grid)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Petak</span>
        </button>
      </div>
    </div>
  );
};
