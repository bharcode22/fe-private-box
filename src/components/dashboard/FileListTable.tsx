import React from 'react';
import { FileText, Share2, Download } from 'lucide-react';

export interface FileItem {
  id: string;
  fileName: string;
  fileSize: string;
  storageAccountId: string;
  createdAt: string;
  shares?: { uniqueCode: string; isActive: boolean }[];
}

interface FileListTableProps {
  files: FileItem[];
  formatBytes: (bytes: number) => string;
  onGenerateShareCode: (fileId: string, fileName: string) => void;
  onDownloadPrivate: (fileId: string, fileName: string) => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  formatBytes,
  onGenerateShareCode,
  onDownloadPrivate,
}) => {
  if (files.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <FileText className="w-10 h-10 mx-auto text-slate-600" />
        <p>Belum ada file yang diunggah.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="px-6 py-4">Nama File</th>
            <th className="px-6 py-4">Ukuran</th>
            <th className="px-6 py-4">Penyimpanan GDrive</th>
            <th className="px-6 py-4">Tanggal Unggah</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-slate-900/40 transition">
              <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="truncate max-w-xs">{file.fileName}</span>
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
                  onClick={() => onGenerateShareCode(file.id, file.fileName)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Bagikan
                </button>
                <button
                  onClick={() => onDownloadPrivate(file.id, file.fileName)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
