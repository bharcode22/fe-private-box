import React from 'react';
import { FileText, Share2, Download, Image, Video, Music, FileQuestion, Trash2, Edit2, UploadCloud, FolderPlus, CheckSquare, Folder } from 'lucide-react';

export interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
  shares?: { uniqueCode: string; isActive: boolean }[];
}

export interface FileItem {
  id: string;
  fileName: string;
  fileSize: string;
  storageAccountId: string;
  createdAt: string;
  category?: string;
  shares?: { uniqueCode: string; isActive: boolean }[];
}

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
}

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
}) => {
  const [isSelectionMode, setIsSelectionMode] = React.useState<boolean>(false);
  const [selectedFolderIds, setSelectedFolderIds] = React.useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = React.useState<string[]>([]);

  const totalSelected = selectedFolderIds.length + selectedFileIds.length;
  const totalItems = folders.length + files.length;
  const isAllSelected = totalItems > 0 && selectedFolderIds.length === folders.length && selectedFileIds.length === files.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFolderIds([]);
      setSelectedFileIds([]);
    } else {
      setSelectedFolderIds(folders.map((f) => f.id));
      setSelectedFileIds(files.map((f) => f.id));
    }
  };

  const toggleFolderSelection = (id: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  if (folders.length === 0 && files.length === 0) {
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
      {/* Top Table Toolbar: Mode Pilih Toggle Button */}
      <div className="flex items-center justify-between p-3.5 px-4 sm:px-6 bg-slate-900/60 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const nextMode = !isSelectionMode;
              setIsSelectionMode(nextMode);
              if (!nextMode) {
                setSelectedFolderIds([]);
                setSelectedFileIds([]);
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer active:scale-95 ${isSelectionMode
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm font-extrabold'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/80'
              }`}
          >
            <CheckSquare className={`w-4 h-4 ${isSelectionMode ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>{isSelectionMode ? 'Selesai Pilih' : 'Pilih Item'}</span>
          </button>

          {isSelectionMode && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <CustomCheckbox
                checked={isAllSelected}
                onChange={toggleSelectAll}
                title="Pilih Semua Item"
              />
              <span
                onClick={toggleSelectAll}
                className="text-xs font-bold text-slate-300 cursor-pointer hover:text-white transition select-none"
              >
                Pilih Semua ({totalItems})
              </span>
            </div>
          )}
        </div>

        {isSelectionMode && (
          <div className="flex items-center gap-2">
            {totalSelected > 0 && (
              <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                {totalSelected} Dipilih
              </span>
            )}
            {onBatchDelete && totalSelected > 0 && (
              <button
                onClick={() => onBatchDelete(selectedFileIds, selectedFolderIds)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus ({totalSelected})</span>
              </button>
            )}
          </div>
        )}
      </div>

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
            className={`p-4 transition space-y-3 cursor-pointer group ${selectedFolderIds.includes(folder.id) ? 'bg-amber-950/20 border-l-4 border-amber-500' : 'hover:bg-slate-900/60'
              }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {isSelectionMode && (
                  <CustomCheckbox
                    checked={selectedFolderIds.includes(folder.id)}
                    onChange={() => toggleFolderSelection(folder.id)}
                  />
                )}
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition flex-shrink-0">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition truncate">{folder.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Folder • {new Date(folder.createdAt).toLocaleDateString('id-ID')}
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
                  {folder.shares[0].isActive ? `Aktif: ${folder.shares[0].uniqueCode}` : `Nonaktif (${folder.shares[0].uniqueCode})`}
                </span>
              )}
            </div>

            {/* Folder Mobile Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40" onClick={(e) => e.stopPropagation()}>
              {onDownloadFolder && (
                <button
                  disabled={isSelectionMode}
                  onClick={() => onDownloadFolder(folder.id, folder.name)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>
              )}
              {onGenerateFolderShareCode && (
                <button
                  disabled={isSelectionMode}
                  onClick={() => onGenerateFolderShareCode(folder.id, folder.name, folder.shares)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
              )}
              {onRenameFolder && (
                <button
                  disabled={isSelectionMode}
                  onClick={() => onRenameFolder(folder.id, folder.name)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Nama</span>
                </button>
              )}
              {onDeleteFolder && (
                <button
                  disabled={isSelectionMode}
                  onClick={() => onDeleteFolder(folder.id, folder.name)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Files Mobile Cards */}
        {files.map((file) => {
          const { Icon, colorClass, textHoverClass } = getFileCategoryStyle(file.category);

          return (
            <div
              key={file.id}
              onClick={() => {
                if (isSelectionMode) toggleFileSelection(file.id);
              }}
              className={`p-4 transition space-y-3 ${selectedFileIds.includes(file.id) ? 'bg-indigo-950/20 border-l-4 border-indigo-500' : 'hover:bg-slate-900/40'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {isSelectionMode && (
                    <CustomCheckbox
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                  )}
                  <div className={`p-2 rounded-xl border flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-semibold text-sm text-white truncate max-w-[180px] transition ${textHoverClass}`}>
                      {file.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatBytes(Number(file.fileSize))}</span>
                      <span>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {file.shares && file.shares.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border flex-shrink-0 ${file.shares[0].isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                  >
                    {file.shares[0].isActive ? `Aktif: ${file.shares[0].uniqueCode}` : `Nonaktif (${file.shares[0].uniqueCode})`}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <button
                  disabled={isSelectionMode}
                  onClick={() => onDownloadPrivate(file.id, file.fileName)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>
                <button
                  disabled={isSelectionMode}
                  onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
                {onRenameFile && (
                  <button
                    disabled={isSelectionMode}
                    onClick={() => onRenameFile(file.id, file.fileName)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Nama</span>
                  </button>
                )}
                {onDeleteFile && (
                  <button
                    disabled={isSelectionMode}
                    onClick={() => onDeleteFile(file.id, file.fileName)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
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
                <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition flex-shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="truncate max-w-xs group-hover:text-amber-300 transition">{folder.name}</span>
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
                <td className="px-6 py-4 text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  {onDownloadFolder && (
                    <button
                      disabled={isSelectionMode}
                      onClick={() => onDownloadFolder(folder.id, folder.name)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Unduh Folder (ZIP)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onGenerateFolderShareCode && (
                    <button
                      disabled={isSelectionMode}
                      onClick={() => onGenerateFolderShareCode(folder.id, folder.name, folder.shares)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Manajemen Akses Kode"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onRenameFolder && (
                    <button
                      disabled={isSelectionMode}
                      onClick={() => onRenameFolder(folder.id, folder.name)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Ubah Nama Folder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteFolder && (
                    <button
                      disabled={isSelectionMode}
                      onClick={() => onDeleteFolder(folder.id, folder.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Hapus Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {files.map((file) => {
              const { Icon, colorClass, textHoverClass } = getFileCategoryStyle(file.category);

              return (
                <tr
                  key={file.id}
                  onClick={() => {
                    if (isSelectionMode) toggleFileSelection(file.id);
                  }}
                  className={`transition ${selectedFileIds.includes(file.id) ? 'bg-indigo-950/30' : 'hover:bg-slate-900/40'
                    } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                >
                  {isSelectionMode && (
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <CustomCheckbox
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`truncate max-w-xs transition ${textHoverClass}`}>{file.fileName}</span>
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
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      disabled={isSelectionMode}
                      onClick={() => onDownloadPrivate(file.id, file.fileName)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Unduh"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={isSelectionMode}
                      onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Manajemen Akses Kode"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {onRenameFile && (
                      <button
                        disabled={isSelectionMode}
                        onClick={() => onRenameFile(file.id, file.fileName)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteFile && (
                      <button
                        disabled={isSelectionMode}
                        onClick={() => onDeleteFile(file.id, file.fileName)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
