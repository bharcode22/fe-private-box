import React from 'react';
import { FileText, Share2, Download, Image, Video, Music, FileQuestion, Trash2, Edit2 } from 'lucide-react';

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
}

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
}) => {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <FileText className="w-10 h-10 mx-auto text-slate-600" />
        <p>Belum ada folder atau file.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile View: Cards Layout (screens < 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {/* Folders Mobile Cards */}
        {folders.map((folder) => (
          <div key={folder.id} className="p-4 hover:bg-slate-900/40 transition space-y-3">
            <div
              className="flex items-start justify-between gap-2 cursor-pointer"
              onClick={() => onFolderClick(folder.id, folder.name)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-white truncate">{folder.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Folder • {new Date(folder.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              {folder.shares && folder.shares.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border flex-shrink-0 ${
                    folder.shares[0].isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {folder.shares[0].isActive ? `Kode: ${folder.shares[0].uniqueCode}` : `Nonaktif (${folder.shares[0].uniqueCode})`}
                </span>
              )}
            </div>

            {/* Folder Mobile Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40">
              {onGenerateFolderShareCode && (
                <button
                  onClick={() => onGenerateFolderShareCode(folder.id, folder.name, folder.shares)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
              )}
              {onRenameFolder && (
                <button
                  onClick={() => onRenameFolder(folder.id, folder.name)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Nama</span>
                </button>
              )}
              {onDeleteFolder && (
                <button
                  onClick={() => onDeleteFolder(folder.id, folder.name)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
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
          let Icon = FileText;
          if (file.category === 'image') Icon = Image;
          else if (file.category === 'video') Icon = Video;
          else if (file.category === 'audio') Icon = Music;
          else if (file.category === 'other') Icon = FileQuestion;

          return (
            <div key={file.id} className="p-4 hover:bg-slate-900/40 transition space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate max-w-[200px]">{file.fileName}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatBytes(Number(file.fileSize))}</span>
                      <span>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {file.shares && file.shares.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border flex-shrink-0 ${
                      file.shares[0].isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {file.shares[0].isActive ? `Kode: ${file.shares[0].uniqueCode}` : `Nonaktif (${file.shares[0].uniqueCode})`}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {file.storageAccountId}
                </span>

                {/* File Mobile Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                    className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition flex items-center justify-center cursor-pointer active:scale-95"
                    title="Bagi Kode"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDownloadPrivate(file.id, file.fileName)}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center justify-center cursor-pointer active:scale-95"
                    title="Unduh File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {onRenameFile && (
                    <button
                      onClick={() => onRenameFile(file.id, file.fileName)}
                      className="p-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition flex items-center justify-center cursor-pointer active:scale-95"
                      title="Ubah Nama"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDeleteFile && (
                    <button
                      onClick={() => onDeleteFile(file.id, file.fileName)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition flex items-center justify-center cursor-pointer active:scale-95"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
              <th className="px-6 py-4">Nama File / Folder</th>
              <th className="px-6 py-4">Ukuran</th>
              <th className="px-6 py-4">Penyimpanan GDrive</th>
              <th className="px-6 py-4">Tanggal Unggah</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {folders.map((folder) => (
              <tr key={folder.id} className="hover:bg-slate-900/40 transition">
                <td className="px-6 py-4 font-semibold text-white flex items-center gap-3 cursor-pointer" onClick={() => onFolderClick(folder.id, folder.name)}>
                  <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate max-w-xs">{folder.name}</span>
                  {folder.shares && folder.shares.length > 0 && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      folder.shares[0].isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {folder.shares[0].isActive ? `Kode: ${folder.shares[0].uniqueCode}` : `Nonaktif (${folder.shares[0].uniqueCode})`}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400">-</td>
                <td className="px-6 py-4 text-slate-400">-</td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(folder.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {onGenerateFolderShareCode && (
                    <button
                      onClick={() => onGenerateFolderShareCode(folder.id, folder.name, folder.shares)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Manajemen Akses Kode"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onRenameFolder && (
                    <button
                      onClick={() => onRenameFolder(folder.id, folder.name)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Ubah Nama Folder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteFolder && (
                    <button
                      onClick={() => onDeleteFolder(folder.id, folder.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Hapus Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {files.map((file) => {
              let Icon = FileText;
              if (file.category === 'image') Icon = Image;
              else if (file.category === 'video') Icon = Video;
              else if (file.category === 'audio') Icon = Music;
              else if (file.category === 'other') Icon = FileQuestion;

              return (
                <tr key={file.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                    <Icon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate max-w-xs">{file.fileName}</span>
                    {file.shares && file.shares.length > 0 && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        file.shares[0].isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {file.shares[0].isActive ? `Kode: ${file.shares[0].uniqueCode}` : `Nonaktif (${file.shares[0].uniqueCode})`}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{formatBytes(Number(file.fileSize))}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {file.storageAccountId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Manajemen Akses Kode"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownloadPrivate(file.id, file.fileName)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5"
                      title="Unduh"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {onRenameFile && (
                      <button
                        onClick={() => onRenameFile(file.id, file.fileName)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteFile && (
                      <button
                        onClick={() => onDeleteFile(file.id, file.fileName)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
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
