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
    <div className="overflow-x-auto">
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
  );
};
