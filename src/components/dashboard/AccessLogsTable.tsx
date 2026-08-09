import React, { useState } from 'react';
import { Activity, Settings, Lock, CheckCircle, XCircle, Download, Eye, Users, Trash2 } from 'lucide-react';
import { ManageShareModal, ShareData } from './ManageShareModal';
import { AccessDetailModal, AccessorLogItem } from './AccessDetailModal';
import { ConfirmModal } from '../common/Popups';
import api from '../../services/api';

export interface GroupedLog {
  id: string;
  fileId: string;
  fileName: string;
  uniqueCode: string;
  downloadCount: number;
  lastAccessedAt: string;
  file?: { id: string; fileName: string };
  share?: ShareData | null;
  accessors: AccessorLogItem[];
}

export type AccessLog = GroupedLog;

interface AccessLogsTableProps {
  logs: GroupedLog[];
  onRefreshLogs?: () => void;
}

export const AccessLogsTable: React.FC<AccessLogsTableProps> = ({ logs, onRefreshLogs }) => {
  const [manageModal, setManageModal] = useState<{
    isOpen: boolean;
    share: ShareData | null;
    fileName?: string;
  }>({
    isOpen: false,
    share: null,
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    fileName: string;
    uniqueCode: string;
    downloadCount: number;
    accessors: AccessorLogItem[];
  }>({
    isOpen: false,
    fileName: '',
    uniqueCode: '',
    downloadCount: 0,
    accessors: [],
  });

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    shareId: string;
    code: string;
  }>({
    isOpen: false,
    shareId: '',
    code: '',
  });

  if (!logs || logs.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <Activity className="w-10 h-10 mx-auto text-slate-600" />
        <p>Belum ada aktivitas pembagian atau pengunduhan file.</p>
      </div>
    );
  }

  const handleOpenManageModal = (share: ShareData, fileName?: string) => {
    setManageModal({
      isOpen: true,
      share,
      fileName,
    });
  };

  const handleOpenDetailModal = (log: GroupedLog) => {
    setDetailModal({
      isOpen: true,
      fileName: log.fileName || log.file?.fileName || 'File',
      uniqueCode: log.uniqueCode || log.share?.uniqueCode || '',
      downloadCount: log.downloadCount || 0,
      accessors: log.accessors || [],
    });
  };

  const promptDeleteShareLink = (shareId: string, code: string) => {
    setDeleteConfirmState({
      isOpen: true,
      shareId,
      code,
    });
  };

  const handleConfirmDeleteShareLink = async () => {
    const { shareId } = deleteConfirmState;
    setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
    if (!shareId) return;

    try {
      await api.delete(`/api/share/${shareId}`);
      if (onRefreshLogs) onRefreshLogs();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus link pembagian');
    }
  };

  const sortedLogs = [...logs].sort((a: any, b: any) => {
    const timeA = new Date(a.lastAccessedAt || a.accessedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.lastAccessedAt || b.accessedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div>
      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {sortedLogs.map((log: any) => {
          const fileName = log.fileName || log.file?.fileName || 'File';
          const code = log.uniqueCode || log.share?.uniqueCode || '-';
          const downloadCount = log.downloadCount ?? (log.accessors ? log.accessors.length : 0);

          return (
            <div key={log.id} className="p-4 hover:bg-slate-900/40 transition space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm text-white truncate max-w-[190px]" title={fileName}>
                  {fileName}
                </h4>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-[11px] border border-slate-700 text-purple-300 flex-shrink-0">
                  {code}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                  <Download className="w-3 h-3 mr-1 text-indigo-400" /> {downloadCount}x Diunduh
                </span>

                {log.share && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {!log.share.isActive ? (
                      <span className="inline-flex items-center text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-medium">
                        Nonaktif
                      </span>
                    ) : !log.share.allowDownload ? (
                      <span className="inline-flex items-center text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                        Hanya Pratinjau
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                        Aktif
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handleOpenDetailModal(log)}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  Detail ({downloadCount})
                </button>

                {log.share && (
                  <>
                    <button
                      onClick={() => handleOpenManageModal(log.share, fileName)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 mr-1" />
                      Kelola
                    </button>
                    <button
                      onClick={() => promptDeleteShareLink(log.share.id, code)}
                      className="inline-flex items-center p-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                      title="Hapus Link & Cabut Izin Pengunduhan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Nama File / Folder</th>
              <th className="px-6 py-4">Kode Akses</th>
              <th className="px-6 py-4 text-center">Total Unduhan</th>
              <th className="px-6 py-4 text-center">Status Link</th>
              <th className="px-6 py-4 text-center">Aksi & Pengaturan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedLogs.map((log: any) => {
              const fileName = log.fileName || log.file?.fileName || 'File';
              const code = log.uniqueCode || log.share?.uniqueCode || '-';
              const downloadCount = log.downloadCount ?? (log.accessors ? log.accessors.length : 0);

              return (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4 font-semibold text-white truncate max-w-xs">{fileName}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono bg-slate-900 px-2.5 py-1 rounded text-xs border border-slate-700 text-purple-300 font-bold">
                      {code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      {downloadCount} Kali
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.share ? (
                      <div>
                        {!log.share.isActive ? (
                          <span className="inline-flex items-center text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-medium">
                            Nonaktif
                          </span>
                        ) : !log.share.allowDownload ? (
                          <span className="inline-flex items-center text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
                            <Lock className="w-3.5 h-3.5 mr-1" /> Hanya Pratinjau
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aktif
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Dihapus</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenDetailModal(log)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer"
                        title="Lihat Daftar Email Pengunduh"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                        Detail ({downloadCount})
                      </button>

                      {log.share && (
                        <>
                          <button
                            onClick={() => handleOpenManageModal(log.share, fileName)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all cursor-pointer"
                            title="Kelola Pengaturan Link Akses Ini"
                          >
                            <Settings className="w-3.5 h-3.5 mr-1.5" />
                            Kelola Link
                          </button>
                          <button
                            onClick={() => promptDeleteShareLink(log.share.id, code)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                            title="Hapus Link & Cabut Semua Izin Pengunduhan"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Manage Share Settings */}
      <ManageShareModal
        isOpen={manageModal.isOpen}
        share={manageModal.share}
        fileName={manageModal.fileName}
        onClose={() => setManageModal({ isOpen: false, share: null })}
        onSuccess={() => {
          if (onRefreshLogs) onRefreshLogs();
        }}
      />

      {/* Modal Detail Accessors */}
      <AccessDetailModal
        isOpen={detailModal.isOpen}
        fileName={detailModal.fileName}
        uniqueCode={detailModal.uniqueCode}
        downloadCount={detailModal.downloadCount}
        accessors={detailModal.accessors}
        onClose={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Custom Confirmation Popup Dialog */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Hapus Link Pembagian"
        message={`Apakah Anda yakin ingin menghapus link pembagian "${deleteConfirmState.code}"? Semua izin pengunduhan akan dicabut dan log pembagian akan dibersihkan.`}
        confirmText="Ya, Hapus Link"
        cancelText="Batal"
        isDanger={true}
        onConfirm={handleConfirmDeleteShareLink}
        onCancel={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
