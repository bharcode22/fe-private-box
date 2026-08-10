import React from 'react';
import { X, Download, Share2, Edit2, Trash2, Eye, Folder, FileText, HardDrive, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { FileItem, FolderItem } from '../../types';

interface FileActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: { type: 'file'; data: FileItem } | { type: 'folder'; data: FolderItem } | null;
  onPreview?: (file: FileItem) => void;
  onDownloadFile?: (fileId: string, fileName: string) => void;
  onDownloadFolder?: (folderId: string, folderName: string) => void;
  onShareFile?: (fileId: string, fileName: string, shares?: any[]) => void;
  onShareFolder?: (folderId: string, folderName: string, shares?: any[]) => void;
  onRenameFile?: (fileId: string, fileName: string) => void;
  onRenameFolder?: (folderId: string, folderName: string) => void;
  onDeleteFile?: (fileId: string, fileName: string) => void;
  onDeleteFolder?: (folderId: string, folderName: string) => void;
  formatBytes: (bytes: number) => string;
}

export const FileActionBottomSheet: React.FC<FileActionBottomSheetProps> = ({
  isOpen,
  onClose,
  targetItem,
  onPreview,
  onDownloadFile,
  onDownloadFolder,
  onShareFile,
  onShareFolder,
  onRenameFile,
  onRenameFolder,
  onDeleteFile,
  onDeleteFolder,
  formatBytes,
}) => {
  if (!isOpen || !targetItem) return null;

  const isFile = targetItem.type === 'file';
  const itemData = targetItem.data;
  const itemName = isFile ? (itemData as FileItem).fileName : (itemData as FolderItem).name;
  const shares = itemData.shares;
  const isShared = shares && shares.length > 0;
  const activeShare = isShared ? shares[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Up Sheet Container */}
      <div className="relative w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl z-50 overflow-hidden animate-slideUp pb-6">
        {/* Handle Bar Indicator */}
        <div className="w-full flex justify-center py-2.5">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Item Header */}
        <div className="px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${isFile ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {isFile ? <FileText className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-100 truncate" title={itemName}>
                {itemName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                {isFile && (
                  <span>{formatBytes(Number((itemData as FileItem).fileSize))}</span>
                )}
                <span>• {new Date(itemData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Share Status Pill (if shared) */}
        {isShared && activeShare && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {activeShare.isActive ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-slate-300 font-medium">Kode: <strong className="text-indigo-300 font-mono">{activeShare.uniqueCode}</strong></span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeShare.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
              {activeShare.isActive ? 'Link Aktif' : 'Nonaktif'}
            </span>
          </div>
        )}

        {/* Action List Items */}
        <div className="py-2 px-3 space-y-1">
          {/* Pratinjau (Only for files) */}
          {isFile && onPreview && (
            <button
              onClick={() => {
                onClose();
                onPreview(itemData as FileItem);
              }}
              className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-slate-200 hover:bg-slate-800/80 active:bg-slate-800 transition cursor-pointer text-xs font-semibold"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Eye className="w-4 h-4" />
              </div>
              <span>Pratinjau File</span>
            </button>
          )}

          {/* Unduh */}
          <button
            onClick={() => {
              onClose();
              if (isFile && onDownloadFile) {
                onDownloadFile(itemData.id, itemName);
              } else if (!isFile && onDownloadFolder) {
                onDownloadFolder(itemData.id, itemName);
              }
            }}
            className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-slate-200 hover:bg-slate-800/80 active:bg-slate-800 transition cursor-pointer text-xs font-semibold"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <span>Unduh {isFile ? 'File' : 'Folder (ZIP)'}</span>
          </button>

          {/* Bagikan */}
          <button
            onClick={() => {
              onClose();
              if (isFile && onShareFile) {
                onShareFile(itemData.id, itemName, shares);
              } else if (!isFile && onShareFolder) {
                onShareFolder(itemData.id, itemName, shares);
              }
            }}
            className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-slate-200 hover:bg-slate-800/80 active:bg-slate-800 transition cursor-pointer text-xs font-semibold"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Share2 className="w-4 h-4" />
            </div>
            <span>Bagikan / Kelola Link Akses</span>
          </button>

          {/* Ubah Nama */}
          <button
            onClick={() => {
              onClose();
              if (isFile && onRenameFile) {
                onRenameFile(itemData.id, itemName);
              } else if (!isFile && onRenameFolder) {
                onRenameFolder(itemData.id, itemName);
              }
            }}
            className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-slate-200 hover:bg-slate-800/80 active:bg-slate-800 transition cursor-pointer text-xs font-semibold"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Edit2 className="w-4 h-4" />
            </div>
            <span>Ubah Nama</span>
          </button>

          {/* Hapus */}
          <button
            onClick={() => {
              onClose();
              if (isFile && onDeleteFile) {
                onDeleteFile(itemData.id, itemName);
              } else if (!isFile && onDeleteFolder) {
                onDeleteFolder(itemData.id, itemName);
              }
            }}
            className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-rose-300 hover:bg-rose-500/10 active:bg-rose-500/20 transition cursor-pointer text-xs font-semibold border border-transparent hover:border-rose-500/20"
          >
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <span>Hapus {isFile ? 'File' : 'Folder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
