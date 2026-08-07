import React from 'react';
import { FileText, Share2, Download, Image, Video, Music, FileQuestion, Trash2, Edit2, UploadCloud, FolderPlus } from 'lucide-react';

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
  onDownloadFolder,
  onUploadClick,
  onCreateFolderClick,
}) => {
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
      {/* Mobile View: Cards Layout (screens < 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {/* Folders Mobile Cards */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderClick(folder.id, folder.name)}
            className="p-4 hover:bg-slate-900/60 transition space-y-3 cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-white group-hover:text-indigo-400 transition truncate">{folder.name}</h4>
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
                  onClick={() => onDownloadFolder(folder.id, folder.name)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>
              )}
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
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border flex-shrink-0 ${file.shares[0].isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                  >
                    {file.shares[0].isActive ? `Aktif: ${file.shares[0].uniqueCode}` : `Nonaktif (${file.shares[0].uniqueCode})`}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40 flex-wrap">
                <button
                  onClick={() => onDownloadPrivate(file.id, file.fileName)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>
                <button
                  onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
                {onRenameFile && (
                  <button
                    onClick={() => onRenameFile(file.id, file.fileName)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Nama</span>
                  </button>
                )}
                {onDeleteFile && (
                  <button
                    onClick={() => onDeleteFile(file.id, file.fileName)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
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
                onClick={() => onFolderClick(folder.id, folder.name)}
                className="hover:bg-slate-900/60 transition cursor-pointer group"
              >
                <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate max-w-xs group-hover:text-indigo-400 transition">{folder.name}</span>
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
                      onClick={() => onDownloadFolder(folder.id, folder.name)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Unduh Folder (ZIP)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                      onClick={() => onDownloadPrivate(file.id, file.fileName)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Unduh"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onGenerateShareCode(file.id, file.fileName, file.shares)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Manajemen Akses Kode"
                    >
                      <Share2 className="w-3.5 h-3.5" />
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
