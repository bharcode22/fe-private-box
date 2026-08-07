import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Activity, UploadCloud, RotateCw, Home, ChevronRight, Folder } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { UploadFileModal } from '../components/dashboard/UploadFileModal';
import { BackgroundUploadWidget } from '../components/dashboard/BackgroundUploadWidget';
import { BackgroundDeleteWidget } from '../components/dashboard/BackgroundDeleteWidget';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { FileListTable, FileItem, FolderItem } from '../components/dashboard/FileListTable';
import { CreateFolderModal } from '../components/dashboard/FolderModals';
import { AccessLogsTable, AccessLog } from '../components/dashboard/AccessLogsTable';
import { ShareModal } from '../components/dashboard/ShareModal';
import { ToastContainer, ConfirmModal, PromptModal, ToastMessage } from '../components/common/Popups';
import { formatBytes } from '../utils/formatters';
import { getDaysRemaining } from '../utils/dateUtils';
import { downloadService } from '../services/downloadService';
import { shareService } from '../services/shareService';
import { useFileUpload } from '../hooks/useFileUpload';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<{ id: string; name: string } | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [userInfo, setUserInfo] = useState<{
    storageLimit: number;
    storageUsed: number;
    accountStatus: string;
    expiresAt: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Custom Upload Hook encapsulation
  const {
    selectedFiles,
    setSelectedFiles,
    uploading,
    uploadProgress,
    uploadFileCount,
    uploadTargetFolderName,
    currentFileIndex,
    currentFileName,
    fileProgressPercent,
    statusMessage,
    handleFileUpload: uploadHandler,
    handleCancelUpload: cancelUploadHandler,
  } = useFileUpload();

  // Live Delete Progress Loading State
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteItemCount, setDeleteItemCount] = useState(0);
  const [deleteCurrentIndex, setDeleteCurrentIndex] = useState(0);
  const [deleteCurrentName, setDeleteCurrentName] = useState('');
  const [deleteStatusMessage, setDeleteStatusMessage] = useState('');

  useEffect(() => {
    if (!deleting) {
      setDeleteProgress(0);
      setDeleteItemCount(0);
      setDeleteCurrentIndex(0);
      setDeleteCurrentName('');
      setDeleteStatusMessage('');
      return;
    }

    const interval = setInterval(() => {
      setDeleteProgress((prev) => {
        if (prev < 90) return prev + 10;
        if (prev < 98) return prev + 2;
        return prev;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [deleting]);

  const executeDeleteWithProgress = async (
    count: number,
    name: string,
    deleteFn: () => Promise<any>,
    defaultSuccessMsg: string
  ) => {
    setDeleting(true);
    setDeleteProgress(15);
    setDeleteItemCount(count);
    setDeleteCurrentIndex(1);
    setDeleteCurrentName(name);
    setDeleteStatusMessage(`Menghapus "${name}" dari storage...`);

    try {
      const res = await deleteFn();
      setDeleteProgress(100);
      setDeleteStatusMessage('Penghapusan berhasil! Memperbarui data...');
      showToast(res?.data?.message || defaultSuccessMsg, 'success');
      await fetchDashboardData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Gagal menghapus item', 'error');
    } finally {
      setTimeout(() => {
        setDeleting(false);
      }, 800);
    }
  };

  const [shareModal, setShareModal] = useState<{ id: string; name: string; type: 'file' | 'folder'; code?: string; isActive?: boolean } | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') === 'logs' ? 'logs' : 'files') as 'files' | 'logs';
  const currentFolderId = searchParams.get('folderId') || null;

  useEffect(() => {
    if (currentFolderId) {
      sessionStorage.setItem('pb_last_dashboard_search', `?folderId=${currentFolderId}`);
    } else {
      sessionStorage.removeItem('pb_last_dashboard_search');
    }
  }, [currentFolderId]);

  const navigateToFolder = (folderId: string | null) => {
    setLoading(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (folderId) {
          next.set('folderId', folderId);
        } else {
          next.delete('folderId');
        }
        return next;
      },
      { replace: false }
    );
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    label?: string;
    initialValue?: string;
    onConfirm: (val: string) => void;
  }>({ isOpen: false, title: '', initialValue: '', onConfirm: () => { } });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const setActiveTab = (tab: 'files' | 'logs') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'files') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('pb_user');
    const token = localStorage.getItem('pb_token');

    if (!savedUser || !token) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const resFiles = await api.get(`/api/files${currentFolderId ? `?folderId=${currentFolderId}` : ''}`);
      setFiles(resFiles.data.files);
      setUserInfo(resFiles.data.userInfo);

      const resFolders = await api.get(`/api/folders${currentFolderId ? `?parentId=${currentFolderId}` : ''}`);
      setFolders(resFolders.data.folders);

      const resLogs = await api.get('/api/logs');
      setAccessLogs(resLogs.data.logs);

      // Reconstruct current folder details and breadcrumb trail
      const resAllFolders = await api.get('/api/folders?all=true');
      const allUserFolders: any[] = resAllFolders.data.folders || [];

      if (currentFolderId) {
        const foundFolder = allUserFolders.find((f) => f.id === currentFolderId);
        if (foundFolder) {
          setCurrentFolder({ id: foundFolder.id, name: foundFolder.name });
          const trail: { id: string; name: string }[] = [];
          let curr: any = foundFolder;
          while (curr) {
            trail.unshift({ id: curr.id, name: curr.name });
            if (curr.parentId) {
              curr = allUserFolders.find((f) => f.id === curr.parentId);
            } else {
              curr = null;
            }
          }
          setBreadcrumbs(trail);
        } else {
          setCurrentFolder(null);
          setBreadcrumbs([]);
        }
      } else {
        setCurrentFolder(null);
        setBreadcrumbs([]);
      }
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchDashboardData();
    }
  }, [user, currentFolderId]);

  const handleLogout = () => {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    navigate('/');
  };

  const handleCancelUpload = () => {
    cancelUploadHandler(showToast);
  };

  const handleFileUpload = (e: React.FormEvent) => {
    uploadHandler(e, currentFolder, fetchDashboardData, showToast, () => setIsUploadModalOpen(false));
  };

  const handleGenerateShareCode = async (fileId: string, fileName: string, fileShares?: any[]) => {
    try {
      const data = await shareService.getOrCreateShareCode('file', fileId, fileName, fileShares);
      setShareModal(data);
      if (!fileShares || fileShares.length === 0) fetchDashboardData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Gagal membuat kode unik pembagian file', 'error');
    }
  };

  const handleGenerateFolderShareCode = async (folderId: string, folderName: string, folderShares?: any[]) => {
    try {
      const data = await shareService.getOrCreateShareCode('folder', folderId, folderName, folderShares);
      setShareModal(data);
      if (!folderShares || folderShares.length === 0) fetchDashboardData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Gagal membuat kode unik pembagian folder', 'error');
    }
  };

  const handleUpdateShare = async (id: string, options: { customCode?: string; isActive?: boolean }) => {
    if (!shareModal) return;
    try {
      const result = await shareService.updateShareCode(shareModal.type, id, options);
      setShareModal((prev) => (prev ? { ...prev, ...result } : null));
      fetchDashboardData();
      showToast('Manajemen akses berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Gagal memperbarui akses pembagian', 'error');
    }
  };

  const handleRandomizeCode = async (id: string) => {
    if (!shareModal) return;
    try {
      const result = await shareService.randomizeShareCode(shareModal.type, id);
      setShareModal((prev) => (prev ? { ...prev, ...result } : null));
      fetchDashboardData();
      showToast('Kode baru berhasil diacak!', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Gagal mengacak kode pembagian', 'error');
    }
  };

  const handleDownloadPrivate = (fileId: string, fileName: string) => {
    downloadService.downloadFile(fileId, fileName, showToast);
  };

  const handleDownloadFolder = (folderId: string, folderName: string) => {
    downloadService.downloadFolder(folderId, folderName, showToast);
  };

  const usedBytes = Number(userInfo?.storageUsed || 0);
  const limitBytes = Number(userInfo?.storageLimit || import.meta.env.VITE_FREE_USER_QUOTA_BYTES || 10737418240);
  const quotaPercent = Math.min(100, (usedBytes / limitBytes) * 100);
  const daysLeft = getDaysRemaining(userInfo?.expiresAt);

  const handleBatchDelete = (selectedFileIds: string[], selectedFolderIds: string[]) => {
    const total = selectedFileIds.length + selectedFolderIds.length;
    if (total === 0) return;

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Item Terpilih',
      message: `Apakah Anda yakin ingin menghapus ${total} item yang dipilih (${selectedFolderIds.length} folder, ${selectedFileIds.length} file)? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await api.post('/api/files/batch-delete', {
            fileIds: selectedFileIds,
            folderIds: selectedFolderIds,
          });
          showToast(res.data.message || `${total} item berhasil dihapus!`, 'success');
          fetchDashboardData();
        } catch (err: any) {
          showToast(err.response?.data?.error || 'Gagal menghapus item terpilih', 'error');
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar Header Component */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        uploading={uploading}
        uploadProgress={uploadProgress}
        deleting={deleting}
        deleteProgress={deleteProgress}
      />

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Dashboard Tabs (Files vs Access Logs) */}
        <div className="space-y-4">
          <div className="flex border-b border-slate-800 space-x-4 sm:space-x-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition flex-shrink-0 cursor-pointer ${activeTab === 'files'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
            >
              <FileText className="w-4 h-4" /> Daftar File & Folder ({files.length + folders.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition flex-shrink-0 cursor-pointer ${activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
            >
              <Activity className="w-4 h-4" /> Log Akses Pembagian ({accessLogs.length})
            </button>
          </div>

          {/* Files List Table Component */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Interactive Breadcrumb Pills (Scrollable on mobile) */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold overflow-x-auto whitespace-nowrap shadow-inner max-w-full">
                  <button
                    onClick={() => navigateToFolder(null)}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition flex-shrink-0 ${breadcrumbs.length === 0
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold shadow-sm cursor-default'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 cursor-pointer'
                      }`}
                    title="Kembali ke Root (Direktori Utama)"
                  >
                    <Home className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Root</span>
                  </button>

                  {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={crumb.id}>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        <button
                          onClick={() => {
                            if (!isLast) {
                              navigateToFolder(crumb.id);
                            }
                          }}
                          disabled={isLast}
                          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition max-w-[140px] sm:max-w-xs flex-shrink-0 ${isLast
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold shadow-sm cursor-default'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 cursor-pointer'
                            }`}
                        >
                          <Folder className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{crumb.name}</span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
                {/* Action Toolbar Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
                  <button
                    onClick={() => fetchDashboardData(true)}
                    disabled={isRefreshing}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Muat Ulang Data"
                  >
                    <RotateCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="inline sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Unggah File</span>
                  </button>
                  <button
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap border border-slate-700/50"
                  >
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Folder Baru</span>
                  </button>
                </div>
              </div>
              <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
                {loading ? (
                  <TableSkeleton rows={5} />
                ) : (
                  <FileListTable
                    folders={folders}
                    files={files}
                    formatBytes={formatBytes}
                    onFolderClick={(id) => navigateToFolder(id)}
                    onUploadClick={() => setIsUploadModalOpen(true)}
                    onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
                    onGenerateShareCode={handleGenerateShareCode}
                    onGenerateFolderShareCode={handleGenerateFolderShareCode}
                    onDownloadPrivate={handleDownloadPrivate}
                    onDownloadFolder={handleDownloadFolder}
                    onBatchDelete={(selectedFileIds, selectedFolderIds) => {
                      const total = selectedFileIds.length + selectedFolderIds.length;
                      if (total === 0) return;
                      setConfirmModal({
                        isOpen: true,
                        title: 'Hapus Item Terpilih',
                        message: `Apakah Anda yakin ingin menghapus ${total} item yang dipilih (${selectedFolderIds.length} folder, ${selectedFileIds.length} file)? Tindakan ini tidak dapat dibatalkan.`,
                        onConfirm: async () => {
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                          executeDeleteWithProgress(
                            total,
                            `${total} Item Terpilih`,
                            () => api.post('/api/files/batch-delete', { fileIds: selectedFileIds, folderIds: selectedFolderIds }),
                            `${total} item berhasil dihapus!`
                          );
                        },
                      });
                    }}
                    onDeleteFolder={(id, name) => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Hapus Folder',
                        message: `Apakah Anda yakin ingin menghapus folder "${name || 'ini'}" beserta seluruh isinya? Tindakan ini tidak dapat dibatalkan.`,
                        onConfirm: async () => {
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                          executeDeleteWithProgress(
                            1,
                            name || 'Folder',
                            () => api.delete(`/api/folders/${id}`),
                            'Folder berhasil dihapus!'
                          );
                        },
                      });
                    }}
                    onRenameFolder={(id, currentName) => {
                      setPromptModal({
                        isOpen: true,
                        title: 'Ubah Nama Folder',
                        label: 'Masukkan nama folder baru:',
                        initialValue: currentName || '',
                        onConfirm: async (newName) => {
                          setPromptModal((prev) => ({ ...prev, isOpen: false }));
                          try {
                            await api.put(`/api/folders/${id}`, { name: newName });
                            showToast('Nama folder berhasil diubah!', 'success');
                            fetchDashboardData();
                          } catch (err: any) {
                            showToast(err.response?.data?.error || 'Gagal mengubah nama folder', 'error');
                          }
                        },
                      });
                    }}
                    onDeleteFile={(id, name) => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Hapus File',
                        message: `Apakah Anda yakin ingin menghapus file "${name || 'ini'}" dari Google Drive Storage?`,
                        onConfirm: async () => {
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                          executeDeleteWithProgress(
                            1,
                            name || 'File',
                            () => api.delete(`/api/files/${id}`),
                            'File berhasil dihapus!'
                          );
                        },
                      });
                    }}
                    onRenameFile={(id, currentName) => {
                      setPromptModal({
                        isOpen: true,
                        title: 'Ubah Nama File',
                        label: 'Masukkan nama file baru:',
                        initialValue: currentName || '',
                        onConfirm: async (newName) => {
                          setPromptModal((prev) => ({ ...prev, isOpen: false }));
                          try {
                            await api.put(`/api/files/${id}`, { name: newName });
                            showToast('Nama file berhasil diubah!', 'success');
                            fetchDashboardData();
                          } catch (err: any) {
                            showToast(err.response?.data?.error || 'Gagal mengubah nama file', 'error');
                          }
                        },
                      });
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Access Logs Table Component */}
          {activeTab === 'logs' && (
            <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
              <AccessLogsTable logs={accessLogs} />
            </div>
          )}
        </div>
      </main>

      {/* Share Modal Component */}
      <ShareModal
        modalData={shareModal}
        onClose={() => setShareModal(null)}
        onUpdateShare={handleUpdateShare}
        onRandomizeCode={handleRandomizeCode}
        onShowToast={showToast}
      />

      {/* Upload File Modal */}
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        accountStatus={userInfo?.accountStatus}
        uploading={uploading}
        uploadProgress={uploadProgress}
        selectedFiles={selectedFiles}
        currentFolderName={currentFolder?.name}
        onFileSelect={setSelectedFiles}
        onSubmit={handleFileUpload}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSuccess={fetchDashboardData}
        parentId={currentFolder?.id || null}
        onShowToast={showToast}
      />

      {/* Custom Popups Components */}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        label={promptModal.label}
        initialValue={promptModal.initialValue}
        onConfirm={promptModal.onConfirm}
        onCancel={() => setPromptModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Background Upload Progress Widget */}
      <BackgroundUploadWidget
        uploading={uploading}
        uploadProgress={uploadProgress}
        fileCount={uploadFileCount}
        currentFileIndex={currentFileIndex}
        currentFileName={currentFileName}
        fileProgressPercent={fileProgressPercent}
        statusMessage={statusMessage}
        targetFolderName={uploadTargetFolderName}
        onCancelUpload={handleCancelUpload}
      />

      {/* Floating Background Delete Progress Widget */}
      <BackgroundDeleteWidget
        deleting={deleting}
        deleteProgress={deleteProgress}
        itemCount={deleteItemCount}
        currentItemIndex={deleteCurrentIndex}
        currentItemName={deleteCurrentName}
        statusMessage={deleteStatusMessage}
      />
    </div>
  );
};