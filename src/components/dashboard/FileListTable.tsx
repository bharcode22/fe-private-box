import React, { useEffect, useState, useRef } from 'react';
import { FileText, Share2, Download, Image, Video, Music, FileQuestion, Trash2, Edit2, UploadCloud, FolderPlus, CheckSquare, Folder, LayoutGrid, List, Eye, Loader2, MoreVertical } from 'lucide-react';
import api from '../../services/api';
import { FileListToolbar } from './FileListToolbar';
import { getViewMode, setViewMode as setStoredViewMode } from '../../utils/auth';

// Tipe domain dikelola di types/index.ts. Re-export di sini untuk backward compatibility.
export type { FileItem, FolderItem } from '../../types';
import type { FileItem, FolderItem } from '../../types';

interface FileListTableProps {
  folders: FolderItem[];
  files: FileItem[];
  formatBytes: (bytes: number) => string;
  onFolderClick: (folderId: string, folderName: string) => void;
  onGenerateShareCode: (fileId: string, fileName: string, fileShares?: any[]) => void;
  onGenerateFolderShareCode?: (folderId: string, folderName: string, folderShares?: any[]) => void;
  onDownloadPrivate: (fileId: string, fileName: string) => void;
  onDeleteFolder?: (folderId: string, folderName?: string) => void;
  onRenameFolder?: (folderId: string, currentName?: string) => void;
  onDeleteFile?: (fileId: string, fileName?: string) => void;
  onRenameFile?: (fileId: string, currentName?: string) => void;
  onDownloadFolder?: (folderId: string, folderName: string) => void;
  onUploadClick?: () => void;
  onCreateFolderClick?: () => void;
  onBatchDelete?: (selectedFileIds: string[], selectedFolderIds: string[]) => void;
  onPreviewFile?: (file: FileItem) => void;
  onOpenActionMenu?: (target: { type: 'file'; data: FileItem } | { type: 'folder'; data: FolderItem }) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onResetFilter?: () => void;
  isFiltered?: boolean;
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  isSelectionMode?: boolean;
  onToggleSelectionMode?: () => void;
  selectedFolderIds?: string[];
  selectedFileIds?: string[];
  onToggleFolderSelection?: (id: string) => void;
  onToggleFileSelection?: (id: string) => void;
  showToolbar?: boolean;
}

export const getEffectiveCategory = (file: { fileName: string; category?: string; mimeType?: string }): string => {
  const ext = file.fileName.substring(file.fileName.lastIndexOf('.')).toLowerCase();
  const mime = file.mimeType || '';

  if (file.category && file.category !== 'other') return file.category;

  if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi', '.wmv'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac', '.wma'].includes(ext)) {
    return 'audio';
  }
  if (
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('text') ||
    mime.includes('spreadsheet') ||
    mime.includes('presentation') ||
    ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'].includes(ext)
  ) {
    return 'document';
  }

  return file.category || 'document';
};

// Helper to get distinct icon and color styles per category
const getFileCategoryStyle = (category?: string) => {
  switch (category) {
    case 'image':
      return {
        Icon: Image,
        colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        textHoverClass: 'group-hover:text-emerald-300',
      };
    case 'video':
      return {
        Icon: Video,
        colorClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        textHoverClass: 'group-hover:text-rose-300',
      };
    case 'audio':
      return {
        Icon: Music,
        colorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        textHoverClass: 'group-hover:text-cyan-300',
      };
    case 'other':
      return {
        Icon: FileQuestion,
        colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        textHoverClass: 'group-hover:text-purple-300',
      };
    default:
      return {
        Icon: FileText,
        colorClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        textHoverClass: 'group-hover:text-indigo-300',
      };
  }
};

const ThumbnailCache = new Map<string, string>();

const FileThumbnail: React.FC<{
  file: FileItem;
  className?: string;
  iconClassName?: string;
}> = ({ file, className = "w-10 h-10", iconClassName = "w-5 h-5" }) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(() => ThumbnailCache.get(file.id) || null);
  const [loading, setLoading] = useState<boolean>(!ThumbnailCache.has(file.id));
  const [failed, setFailed] = useState<boolean>(false);

  const category = getEffectiveCategory(file);
  const ext = file.fileName.substring(file.fileName.lastIndexOf('.')).toLowerCase();
  const isImage = category === 'image' || file.mimeType?.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
  const isVideo = category === 'video' || file.mimeType?.startsWith('video/') || ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);

  const { Icon, colorClass } = getFileCategoryStyle(category);

  useEffect(() => {
    if (!isImage && !isVideo) return;
    if (ThumbnailCache.has(file.id)) {
      setThumbUrl(ThumbnailCache.get(file.id)!);
      setLoading(false);
      return;
    }

    let active = true;
    const loadThumb = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/files/${file.id}/preview`, { responseType: 'blob' });
        if (!active) return;
        const blob = res.data as Blob;
        const urlCreated = URL.createObjectURL(blob);
        ThumbnailCache.set(file.id, urlCreated);
        setThumbUrl(urlCreated);
      } catch (err) {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadThumb();

    return () => {
      active = false;
    };
  }, [file.id, isImage, isVideo]);

  if ((isImage || isVideo) && thumbUrl && !failed) {
    if (isImage) {
      return (
        <img
          src={thumbUrl}
          alt={file.fileName}
          className={`${className} object-cover rounded-xl border border-slate-700/60 shadow-sm flex-shrink-0`}
        />
      );
    }
    if (isVideo) {
      return (
        <div className={`relative ${className} rounded-xl overflow-hidden border border-slate-700/60 shadow-sm bg-slate-950 flex-shrink-0`}>
          <video
            src={thumbUrl}
            className="w-full h-full object-cover pointer-events-none"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
            <div className="p-1 rounded-full bg-rose-500/80 text-white shadow-md">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      );
    }
  }

  if (loading && (isImage || isVideo) && !failed) {
    return (
      <div className={`${className} rounded-xl border flex items-center justify-center ${colorClass} animate-pulse flex-shrink-0`}>
        <Loader2 className={`${iconClassName} animate-spin`} />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className={iconClassName} />
    </div>
  );
};

// Custom Animated Modern Checkbox Component
const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  title?: string;
}> = ({ checked, onChange, title }) => {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onChange();
      }}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-md border cursor-pointer transition-all duration-200 select-none flex-shrink-0 ${checked
        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md shadow-indigo-500/30 scale-105 ring-2 ring-indigo-500/30'
        : 'bg-slate-900/90 border-slate-700/90 hover:border-indigo-500/60 text-transparent hover:bg-slate-800'
        }`}
    >
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 ease-out ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
};

export const FileListTable: React.FC<FileListTableProps> = ({
  folders,
  files,
  formatBytes,
  onFolderClick,
  onGenerateShareCode,
  onGenerateFolderShareCode,
  onDownloadPrivate,
  onDeleteFolder,
  onRenameFolder,
  onDeleteFile,
  onRenameFile,
  onDownloadFolder,
  onUploadClick,
  onCreateFolderClick,
  onBatchDelete,
  onPreviewFile,
  onOpenActionMenu,
  hasMore,
  loadingMore,
  onLoadMore,
  onResetFilter,
  isFiltered = false,
  viewMode: controlledViewMode,
  onViewModeChange: controlledOnViewModeChange,
  isSelectionMode: controlledIsSelectionMode,
  onToggleSelectionMode: controlledOnToggleSelectionMode,
  selectedFolderIds: controlledSelectedFolderIds,
  selectedFileIds: controlledSelectedFileIds,
  onToggleFolderSelection: controlledOnToggleFolderSelection,
  onToggleFileSelection: controlledOnToggleFileSelection,
  showToolbar = true,
}) => {
  const [internalIsSelectionMode, setInternalIsSelectionMode] = useState<boolean>(false);
  const [internalSelectedFolderIds, setInternalSelectedFolderIds] = useState<string[]>([]);
  const [internalSelectedFileIds, setInternalSelectedFileIds] = useState<string[]>([]);
  const [internalViewMode, setInternalViewMode] = useState<'table' | 'grid'>(getViewMode);

  const isSelectionMode = controlledIsSelectionMode ?? internalIsSelectionMode;
  const setIsSelectionMode = (val: boolean) => {
    if (controlledOnToggleSelectionMode) {
      controlledOnToggleSelectionMode();
    } else {
      setInternalIsSelectionMode(val);
    }
  };

  const selectedFolderIds = controlledSelectedFolderIds ?? internalSelectedFolderIds;
  const setSelectedFolderIds = (val: string[] | ((prev: string[]) => string[])) => {
    if (typeof val === 'function') {
      setInternalSelectedFolderIds(val);
    } else {
      setInternalSelectedFolderIds(val);
    }
  };

  const selectedFileIds = controlledSelectedFileIds ?? internalSelectedFileIds;
  const setSelectedFileIds = (val: string[] | ((prev: string[]) => string[])) => {
    if (typeof val === 'function') {
      setInternalSelectedFileIds(val);
    } else {
      setInternalSelectedFileIds(val);
    }
  };

  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = controlledOnViewModeChange ?? setInternalViewMode;

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setStoredViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore || loadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, loadingMore, onLoadMore]);

  const totalSelected = selectedFolderIds.length + selectedFileIds.length;
  const totalItems = folders.length + files.length;
  const isAllSelected = totalItems > 0 && selectedFolderIds.length === folders.length && selectedFileIds.length === files.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setInternalSelectedFolderIds([]);
      setInternalSelectedFileIds([]);
    } else {
      setInternalSelectedFolderIds(folders.map((f) => f.id));
      setInternalSelectedFileIds(files.map((f) => f.id));
    }
  };

  const toggleFolderSelection = controlledOnToggleFolderSelection ?? ((id: string) => {
    setInternalSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  });

  const toggleFileSelection = controlledOnToggleFileSelection ?? ((id: string) => {
    setInternalSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  });

  if (folders.length === 0 && files.length === 0) {
    if (isFiltered) {
      return (
        <div className="p-10 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">Tidak ada file yang cocok</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Coba ubah kata kunci pencarian Anda atau ganti filter kategori.
            </p>
          </div>
          {onResetFilter && (
            <div className="pt-2">
              <button
                onClick={onResetFilter}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-2 border border-slate-700 cursor-pointer active:scale-95"
              >
                <span>Reset Filter</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-10 sm:p-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-300">Belum ada folder atau file di sini</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Mulai simpan file privat Anda atau buat folder baru untuk merapikan penyimpanan.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah File</span>
            </button>
          )}
          {onCreateFolderClick && (
            <button
              onClick={onCreateFolderClick}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700/80 cursor-pointer active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Buat Folder Baru</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Modular FileListToolbar Component */}
      {showToolbar && (
        <FileListToolbar
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={() => {
            const nextMode = !isSelectionMode;
            setIsSelectionMode(nextMode);
            if (!nextMode) {
              setSelectedFolderIds([]);
              setSelectedFileIds([]);
            }
          }}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          totalSelected={totalSelected}
          totalItems={totalItems}
          totalFolders={folders.length}
          totalFiles={files.length}
          onBatchDelete={() => {
            if (onBatchDelete) onBatchDelete(selectedFileIds, selectedFolderIds);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {/* Grid View Layout (Tampilan Petak) */}
      {viewMode === 'grid' ? (
        <div className="p-2 sm:p-6 space-y-5">
          {/* Folders Grid Section */}
          {folders.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
                Folder ({folders.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleFolderSelection(folder.id);
                      } else {
                        onFolderClick(folder.id, folder.name);
                      }
                    }}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer group ${selectedFolderIds.includes(folder.id)
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-800/60 shadow-md'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        {isSelectionMode && (
                          <CustomCheckbox
                            checked={selectedFolderIds.includes(folder.id)}
                            onChange={() => toggleFolderSelection(folder.id)}
                          />
                        )}
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition flex-shrink-0">
                          <Folder className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition truncate" title={folder.name}>
                            {folder.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(folder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      {folder.shares && folder.shares.length > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border flex-shrink-0 ${folder.shares[0].isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                        >
                          {folder.shares[0].isActive ? 'Shared' : 'Off'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 w-full pt-2.5 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                      {onDownloadFolder && (
                        <button
                          disabled={isSelectionMode}
                          onClick={() => onDownloadFolder(folder.id, folder.name)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                          title="Unduh Folder"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {onGenerateFolderShareCode && (
                        <button
                          disabled={isSelectionMode}
                          onClick={() => onGenerateFolderShareCode(folder.id, folder.name, folder.shares)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                          title="Bagikan Folder"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                      {onRenameFolder && (
                        <button
                          disabled={isSelectionMode}
                          onClick={() => onRenameFolder(folder.id, folder.name)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                          title="Ubah Nama"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDeleteFolder && (
                        <button
                          disabled={isSelectionMode}
                          onClick={() => onDeleteFolder(folder.id, folder.name)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-rose-600/25 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Grid Section */}
          {files.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
                File ({files.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => {
                  const { Icon, colorClass, textHoverClass } = getFileCategoryStyle(getEffectiveCategory(file));

                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleFileSelection(file.id);
                        } else if (onPreviewFile) {
                          onPreviewFile(file);
                        }
                      }}
                      className={`relative p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group ${selectedFileIds.includes(file.id)
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/60 shadow-md'
                        }`}
                    >
                      {/* Large Visual Thumbnail Box */}
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800/80 flex items-center justify-center mb-3 group-hover:border-slate-700 transition">
                        <FileThumbnail file={file} className="w-full h-full" iconClassName="w-10 h-10" />

                        {/* Selection Checkbox Overlay */}
                        {isSelectionMode && (
                          <div className="absolute top-2.5 left-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                            <CustomCheckbox
                              checked={selectedFileIds.includes(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                            />
                          </div>
                        )}

                        {/* Share Badge Overlay */}
                        {file.shares && file.shares.length > 0 && (
                          <span
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono border backdrop-blur-md shadow-md ${file.shares[0].isActive
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-950/80 text-red-300 border-red-500/40'
                              }`}
                          >
                            {file.shares[0].isActive ? 'Shared' : 'Off'}
                          </span>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="space-y-1 mb-2 px-0.5">
                        <h5 className={`font-bold text-sm text-slate-100 truncate transition ${textHoverClass}`} title={file.fileName}>
                          {file.fileName}
                        </h5>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{formatBytes(Number(file.fileSize))}</span>
                          <span>{new Date(file.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="grid grid-cols-4 gap-2 w-full pt-2.5 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={isSelectionMode}
                          onClick={() => onDownloadPrivate(file.id, file.fileName)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                          title="Unduh File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          disabled={isSelectionMode}
                          onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                          className="w-full py-2 sm:py-2.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                          title="Bagikan"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        {onRenameFile && (
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onRenameFile(file.id, file.fileName)}
                            className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                            title="Ubah Nama"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteFile && (
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onDeleteFile(file.id, file.fileName)}
                            className="w-full py-2 sm:py-2.5 rounded-xl bg-rose-600/25 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer shadow-sm"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View Layout (Tampilan Tabel Default) */
        <>
          {/* Mobile View: Cards Layout (screens < 768px) */}
          <div className="block md:hidden divide-y divide-slate-800/80">
            {/* Folders Mobile Cards */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleFolderSelection(folder.id);
                  } else {
                    onFolderClick(folder.id, folder.name);
                  }
                }}
                className={`p-3.5 transition cursor-pointer group border-b border-slate-800/60 ${selectedFolderIds.includes(folder.id) ? 'bg-amber-950/20 border-l-4 border-amber-500' : 'hover:bg-slate-900/60'
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isSelectionMode && (
                      <CustomCheckbox
                        checked={selectedFolderIds.includes(folder.id)}
                        onChange={() => toggleFolderSelection(folder.id)}
                      />
                    )}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition flex-shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition truncate">{folder.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Folder • {new Date(folder.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {folder.shares && folder.shares.length > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${folder.shares[0].isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                      >
                        {folder.shares[0].isActive ? 'Shared' : 'Off'}
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={isSelectionMode}
                      onClick={() => onOpenActionMenu && onOpenActionMenu({ type: 'folder', data: folder })}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer active:scale-90"
                      title="Opsi Folder"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Files Mobile Cards */}
            {files.map((file) => {
              const { Icon, colorClass, textHoverClass } = getFileCategoryStyle(getEffectiveCategory(file));

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleFileSelection(file.id);
                    } else if (onPreviewFile) {
                      onPreviewFile(file);
                    }
                  }}
                  className={`p-3.5 transition cursor-pointer border-b border-slate-800/60 ${selectedFileIds.includes(file.id) ? 'bg-indigo-950/20 border-l-4 border-indigo-500' : 'hover:bg-slate-900/40'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isSelectionMode && (
                        <CustomCheckbox
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                        />
                      )}
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-semibold text-sm text-white truncate transition ${textHoverClass}`}>
                          {file.fileName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatBytes(Number(file.fileSize))}</span>
                          <span>•</span>
                          <span>{new Date(file.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {file.shares && file.shares.length > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${file.shares[0].isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                        >
                          {file.shares[0].isActive ? 'Shared' : 'Off'}
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isSelectionMode}
                        onClick={() => onOpenActionMenu && onOpenActionMenu({ type: 'file', data: file })}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer active:scale-90"
                        title="Opsi File"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Table Layout (screens >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  {isSelectionMode && (
                    <th className="px-4 py-4 w-12 text-center">
                      <CustomCheckbox
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        title="Pilih Semua Item"
                      />
                    </th>
                  )}
                  <th className="px-6 py-4 text-center">Nama File / Folder</th>
                  <th className="px-6 py-4 text-center">Status Share</th>
                  <th className="px-6 py-4 text-center">Ukuran</th>
                  <th className="px-6 py-4 text-center">Tanggal Unggah</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {folders.map((folder) => (
                  <tr
                    key={folder.id}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleFolderSelection(folder.id);
                      } else {
                        onFolderClick(folder.id, folder.name);
                      }
                    }}
                    className={`transition cursor-pointer group ${selectedFolderIds.includes(folder.id) ? 'bg-amber-950/20' : 'hover:bg-slate-900/60'
                      }`}
                  >
                    {isSelectionMode && (
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <CustomCheckbox
                          checked={selectedFolderIds.includes(folder.id)}
                          onChange={() => toggleFolderSelection(folder.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition flex-shrink-0">
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-xs group-hover:text-amber-300 transition">{folder.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {folder.shares && folder.shares.length > 0 ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${folder.shares[0].isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {folder.shares[0].isActive ? `Aktif: ${folder.shares[0].uniqueCode}` : `Nonaktif (${folder.shares[0].uniqueCode})`}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs text-center">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-center">-</td>
                    <td className="px-6 py-4 text-slate-400 text-center">
                      {new Date(folder.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-center gap-2">
                        {onDownloadFolder && (
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onDownloadFolder(folder.id, folder.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center justify-center cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Unduh Folder (ZIP)"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {onGenerateFolderShareCode && (
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onGenerateFolderShareCode(folder.id, folder.name, folder.shares)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Manajemen Akses Kode"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                        {onRenameFolder && (
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onRenameFolder(folder.id, folder.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Ubah Nama Folder"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteFolder && (
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onDeleteFolder(folder.id, folder.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Hapus Folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {files.map((file) => {
                  const { Icon, colorClass, textHoverClass } = getFileCategoryStyle(getEffectiveCategory(file));

                  return (
                    <tr
                      key={file.id}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleFileSelection(file.id);
                        } else if (onPreviewFile) {
                          onPreviewFile(file);
                        }
                      }}
                      className={`transition cursor-pointer ${selectedFileIds.includes(file.id) ? 'bg-indigo-950/30' : 'hover:bg-slate-900/40'
                        }`}
                    >
                      {isSelectionMode && (
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <CustomCheckbox
                            checked={selectedFileIds.includes(file.id)}
                            onChange={() => toggleFileSelection(file.id)}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg border flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`truncate max-w-xs transition ${textHoverClass}`}>{file.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {file.shares && file.shares.length > 0 ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${file.shares[0].isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {file.shares[0].isActive ? `Aktif: ${file.shares[0].uniqueCode}` : `Nonaktif (${file.shares[0].uniqueCode})`}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs text-center">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-center">{formatBytes(Number(file.fileSize))}</td>
                      <td className="px-6 py-4 text-slate-400 text-center">
                        {new Date(file.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-center gap-2">

                          <button
                            disabled={isSelectionMode}
                            onClick={() => onDownloadPrivate(file.id, file.fileName)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center justify-center cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Unduh"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            disabled={isSelectionMode}
                            onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Manajemen Akses Kode"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {onRenameFile && (
                            <button
                              disabled={isSelectionMode}
                              onClick={() => onRenameFile(file.id, file.fileName)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Rename"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteFile && (
                            <button
                              disabled={isSelectionMode}
                              onClick={() => onDeleteFile(file.id, file.fileName)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Infinite Scroll Indicator & Observer Sentinel */}
      <div ref={observerTargetRef} className="py-6 flex flex-col items-center justify-center space-y-2">
        {loadingMore && (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-medium bg-slate-900/80 px-4 py-2 rounded-full border border-indigo-500/30 shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Memuat 20 file berikutnya...</span>
          </div>
        )}
        {!hasMore && files.length > 0 && (
          <p className="text-[11px] text-slate-500 font-medium">
            Semua {files.length} file telah ditampilkan.
          </p>
        )}
      </div>
    </div>
  );
};
