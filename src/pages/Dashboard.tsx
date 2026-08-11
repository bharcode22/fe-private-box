import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, UploadCloud, RotateCw, Home, ChevronRight, Folder, Search, X, Image, Video, Music, FileQuestion } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { UploadFileModal } from '../components/dashboard/UploadFileModal';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { FileListTable } from '../components/dashboard/FileListTable';
import { FileListToolbar } from '../components/dashboard/FileListToolbar';
import { CreateFolderModal } from '../components/dashboard/FolderModals';
import { AccessLogsTable } from '../components/dashboard/AccessLogsTable';
import { ShareModal } from '../components/dashboard/ShareModal';
import { FilePreviewModal } from '../components/dashboard/FilePreviewModal';
import { ToastContainer, ConfirmModal, PromptModal } from '../components/common/Popups';
import { TermsModal } from '../components/dashboard/TermsModal';
import { formatBytes } from '../utils/formatters';
import { getDaysRemaining } from '../utils/dateUtils';
import { downloadService } from '../services/downloadService';
import { shareService } from '../services/shareService';
import { useGlobalProgress } from '../contexts/GlobalProgressContext';
import { MobileFAB } from '../components/dashboard/MobileFAB';
import { FileActionBottomSheet } from '../components/dashboard/FileActionBottomSheet';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import type { FileItem, FolderItem, AccessLog, ToastMessage } from '../types';
import { getStoredUser, getToken, clearAuth, getViewMode, setViewMode as setStoredViewMode } from '../utils/auth';
import { FREE_QUOTA_BYTES } from '../constants/config';

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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // View Mode & Selection States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(getViewMode);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [actionBottomSheetItem, setActionBottomSheetItem] = useState<{
    type: 'file';
    data: FileItem;
  } | {
    type: 'folder';
    data: FolderItem;
  } | null>(null);

  useEffect(() => {
    setStoredViewMode(viewMode);
  }, [viewMode]);

  const totalDashboardItems = folders.length + files.length;
  const totalSelectedDashboardItems = selectedFolderIds.length + selectedFileIds.length;
  const isAllDashboardSelected = totalDashboardItems > 0 && selectedFolderIds.length === folders.length && selectedFileIds.length === files.length;

  const toggleSelectAllDashboard = () => {
    if (isAllDashboardSelected) {
      setSelectedFolderIds([]);
      setSelectedFileIds([]);
    } else {
      setSelectedFolderIds(folders.map((f) => f.id));
      setSelectedFileIds(files.map((f) => f.id));
    }
  };

  const toggleFolderSelectionDashboard = (id: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFileSelectionDashboard = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Pagination & Preview States
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [previewFileModal, setPreviewFileModal] = useState<{ file: FileItem | null; isOpen: boolean }>({
    file: null,
    isOpen: false,
  });

  // Global Progress Context
  const {
    uploadState: {
      selectedFiles,
      setSelectedFiles,
      uploading,
      uploadProgress,
      handleFileUpload: uploadHandler,
      handleCancelUpload: cancelUploadHandler,
    },
    deleting,
    setDeleting,
    setDeleteProgress,
    setDeleteItemCount,
    setDeleteCurrentIndex,
    setDeleteCurrentName,
    setDeleteStatusMessage,
  } = useGlobalProgress();

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

  const [activeTab, setActiveTabState] = useState<'files' | 'logs'>(
    () => (sessionStorage.getItem('pb_active_tab') === 'logs' ? 'logs' : 'files')
  );

  const [currentFolderId, setCurrentFolderIdState] = useState<string | null>(
    () => sessionStorage.getItem('pb_current_folder_id') || null
  );

  useEffect(() => {
    if (currentFolderId) {
      sessionStorage.setItem('pb_current_folder_id', currentFolderId);
    } else {
      sessionStorage.removeItem('pb_current_folder_id');
    }
  }, [currentFolderId]);

  const navigateToFolder = (folderId: string | null) => {
    setLoading(true);
    setCurrentFolderIdState(folderId);
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    label?: string;
    initialValue?: string;
    confirmText?: string;
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
    setActiveTabState(tab);
    sessionStorage.setItem('pb_active_tab', tab);
  };

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = getStoredUser();
    const token = getToken();

    if (!savedUser || !token) {
      navigate('/');
      return;
    }

    setUser(savedUser);

    if (!(savedUser as any).acceptedTermsAt) {
      setIsTermsModalOpen(true);
    }

    const handleRequireTerms = () => setIsTermsModalOpen(true);
    window.addEventListener('pb:require-terms', handleRequireTerms);
    return () => window.removeEventListener('pb:require-terms', handleRequireTerms);
  }, [navigate]);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      setPage(1);
      const params: any = { page: 1, limit: 20 };
      if (currentFolderId) params.folderId = currentFolderId;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const resFiles = await api.get('/api/files', { params });
      setFiles(resFiles.data.files);
      setUserInfo(resFiles.data.userInfo);
      setHasMore(resFiles.data.pagination?.hasMore ?? false);

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
      if (err.response?.data?.requiresTerms || err.response?.status === 403) {
        setIsTermsModalOpen(true);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMoreFiles = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params: any = { page: nextPage, limit: 20 };
      if (currentFolderId) params.folderId = currentFolderId;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const resFiles = await api.get('/api/files', { params });
      setFiles((prev) => [...prev, ...resFiles.data.files]);
      setPage(nextPage);
      setHasMore(resFiles.data.pagination?.hasMore ?? false);
    } catch (err: any) {
      console.error('Load more files error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchDashboardData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, currentFolderId, searchQuery, selectedCategory]);

  const handleLogout = () => {
    clearAuth();
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
  const limitBytes = Math.max(Number(userInfo?.storageLimit || 0), FREE_QUOTA_BYTES);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-[58px] sm:pt-[65px]">
      {/* Navbar Header Component */}
      <Navbar
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 pt-3 pb-24 sm:py-8 flex-1 w-full space-y-5 sm:space-y-8">
        <div className="space-y-4">
          {/* Dashboard Tabs & Control Toolbar (Sticky Header on Scroll) */}
          <div className="sticky top-[58px] sm:top-[65px] z-30 bg-slate-950/95 backdrop-blur-md pt-1.5 pb-2 sm:pt-2 sm:pb-3 space-y-2 sm:space-y-3 border-b border-slate-800/80 -mx-2.5 sm:-mx-6 px-2.5 sm:px-6 shadow-lg transition-all">
            <div className="hidden sm:flex border-b border-slate-800 space-x-4 sm:space-x-6 overflow-x-auto whitespace-nowrap">
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

            {activeTab === 'files' && (
              <div className="space-y-2 sm:space-y-3">
                {/* 1. Action Toolbar Buttons (Hanya Tampil di Desktop, di Mobile menggunakan FAB) */}
                <div className="hidden sm:flex items-center gap-2 w-full">
                  <button
                    onClick={() => fetchDashboardData(true)}
                    disabled={isRefreshing}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700/80 cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Muat Ulang Data"
                  >
                    <RotateCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Unggah File</span>
                  </button>
                  <button
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap border border-slate-700/50"
                  >
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Folder Baru</span>
                  </button>
                </div>

                {/* 2. Search Input Bar & Category Filter Pills */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  {/* Search Input Box */}
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama file..."
                        className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800 transition"
                          title="Hapus Pencarian"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Tombol Refresh Ringkas Khusus Mobile */}
                    <button
                      onClick={() => fetchDashboardData(true)}
                      disabled={isRefreshing}
                      className="sm:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                      title="Muat Ulang Data"
                    >
                      <RotateCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Category Filter Pills (Scrollable on small screens) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5 sm:pb-0 scrollbar-none">
                    {[
                      { id: 'all', label: 'Semua', icon: FileText },
                      { id: 'document', label: 'Dokumen', icon: FileText },
                      { id: 'image', label: 'Gambar', icon: Image },
                      { id: 'video', label: 'Video', icon: Video },
                      { id: 'audio', label: 'Musik', icon: Music },
                      { id: 'other', label: 'Lainnya', icon: FileQuestion },
                    ].map((cat) => {
                      const CatIcon = cat.icon;
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer ${isActive
                            ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                        >
                          <CatIcon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}

                    {(searchQuery || selectedCategory !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/40 text-xs font-semibold transition flex items-center gap-1 cursor-pointer flex-shrink-0"
                        title="Reset Filter"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Susunan Folder / Interactive Breadcrumb Pills (Hanya tampil jika ada di dalam sub-folder) */}
                {breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold overflow-x-auto whitespace-nowrap shadow-inner max-w-full">
                    <button
                      onClick={() => navigateToFolder(null)}
                      className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition flex-shrink-0 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 cursor-pointer"
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
                            title={crumb.name}
                            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition max-w-[90px] sm:max-w-[160px] flex-shrink-0 ${isLast
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
                )}
                {/* 4. Modular FileListToolbar Component (Nomor 4) */}
                <FileListToolbar
                  isSelectionMode={isSelectionMode}
                  onToggleSelectionMode={() => {
                    const next = !isSelectionMode;
                    setIsSelectionMode(next);
                    if (!next) {
                      setSelectedFolderIds([]);
                      setSelectedFileIds([]);
                    }
                  }}
                  isAllSelected={isAllDashboardSelected}
                  onToggleSelectAll={toggleSelectAllDashboard}
                  totalSelected={totalSelectedDashboardItems}
                  totalItems={totalDashboardItems}
                  totalFolders={folders.length}
                  totalFiles={files.length}
                  onBatchDelete={() => {
                    if (totalSelectedDashboardItems === 0) return;
                    setConfirmModal({
                      isOpen: true,
                      title: 'Hapus Item Terpilih',
                      message: `Apakah Anda yakin ingin menghapus ${totalSelectedDashboardItems} item yang dipilih (${selectedFolderIds.length} folder, ${selectedFileIds.length} file)? Tindakan ini tidak dapat dibatalkan.`,
                      onConfirm: async () => {
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        executeDeleteWithProgress(
                          totalSelectedDashboardItems,
                          `${totalSelectedDashboardItems} Item Terpilih`,
                          () => api.post('/api/files/batch-delete', { fileIds: selectedFileIds, folderIds: selectedFolderIds }),
                          `${totalSelectedDashboardItems} item berhasil dihapus!`
                        );
                      },
                    });
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/90 shadow-inner"
                />
              </div>
            )}
          </div>

          {/* Files List Table Component */}
          {activeTab === 'files' && (
            <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
              {loading ? (
                <TableSkeleton rows={5} />
              ) : (
                <FileListTable
                  folders={folders}
                  files={files}
                  formatBytes={formatBytes}
                  isFiltered={Boolean(searchQuery || selectedCategory !== 'all')}
                  onResetFilter={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isSelectionMode={isSelectionMode}
                  onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
                  selectedFolderIds={selectedFolderIds}
                  selectedFileIds={selectedFileIds}
                  onToggleFolderSelection={toggleFolderSelectionDashboard}
                  onToggleFileSelection={toggleFileSelectionDashboard}
                  showToolbar={false}
                  onFolderClick={(id) => navigateToFolder(id)}
                  onUploadClick={() => setIsUploadModalOpen(true)}
                  onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
                  onPreviewFile={(file) => setPreviewFileModal({ file, isOpen: true })}
                  onOpenActionMenu={(target) => setActionBottomSheetItem(target)}
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
                      message: (
                        <div className="space-y-2">
                          <p>Apakah Anda yakin ingin menghapus <strong className="text-white font-semibold">{total} item</strong> yang dipilih ({selectedFolderIds.length} folder, {selectedFileIds.length} file)?</p>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                            <span>⚠️ Semua item terpilih yang dihapus tidak dapat dikembalikan.</span>
                          </div>
                        </div>
                      ),
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
                      message: (
                        <div className="space-y-2">
                          <p>Apakah Anda yakin ingin menghapus folder <strong className="text-white font-semibold">"{name || 'ini'}"</strong> beserta seluruh isinya?</p>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                            <span>⚠️ Folder yang dihapus tidak dapat dikembalikan.</span>
                          </div>
                        </div>
                      ),
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
                      confirmText: 'Simpan Nama',
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
                      message: (
                        <div className="space-y-2">
                          <p>Apakah Anda yakin ingin menghapus file <strong className="text-white font-semibold">"{name || 'ini'}"</strong></p>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                            <span>⚠️ File yang dihapus tidak dapat dikembalikan.</span>
                          </div>
                        </div>
                      ),
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
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={loadMoreFiles}
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
          )}

          {/* Access Logs Table Component */}
          {activeTab === 'logs' && (
            <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
              <AccessLogsTable logs={accessLogs} onRefreshLogs={fetchDashboardData} />
            </div>
          )}
        </div>
      </main>

      {/* File Preview Modal Component */}
      <FilePreviewModal
        file={previewFileModal.file}
        isOpen={previewFileModal.isOpen}
        onClose={() => setPreviewFileModal({ file: null, isOpen: false })}
        onDownload={handleDownloadPrivate}
        onShare={(fileId, fileName, shares) =>
          setShareModal({ id: fileId, name: fileName, type: 'file', code: shares?.[0]?.uniqueCode, isActive: shares?.[0]?.isActive })
        }
        formatBytes={formatBytes}
      />

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


      {/* Floating Action Button (FAB) Khusus Mobile */}
      <MobileFAB
        onUploadClick={() => setIsUploadModalOpen(true)}
        onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
      />

      {/* Google Drive Bottom Sheet Action Menu */}
      <FileActionBottomSheet
        isOpen={Boolean(actionBottomSheetItem)}
        onClose={() => setActionBottomSheetItem(null)}
        targetItem={actionBottomSheetItem}
        onPreview={(file) => setPreviewFileModal({ file, isOpen: true })}
        onDownloadFile={(id, name) => handleDownloadPrivate(id, name)}
        onDownloadFolder={(id, name) => handleDownloadFolder(id, name)}
        onShareFile={(id, name, shares) => handleGenerateShareCode(id, name, shares)}
        onShareFolder={(id, name, shares) => handleGenerateFolderShareCode(id, name, shares)}
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
        onRenameFolder={(id, currentName) => {
          setPromptModal({
            isOpen: true,
            title: 'Ubah Nama Folder',
            label: 'Masukkan nama folder baru:',
            initialValue: currentName || '',
            confirmText: 'Simpan Nama',
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
            message: (
              <div className="space-y-2">
                <p>Apakah Anda yakin ingin menghapus file <strong className="text-white font-semibold">"{name || 'ini'}"</strong></p>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️ File yang dihapus tidak dapat dikembalikan.</span>
                </div>
              </div>
            ),
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
        onDeleteFolder={(id, name) => {
          setConfirmModal({
            isOpen: true,
            title: 'Hapus Folder',
            message: (
              <div className="space-y-2">
                <p>Apakah Anda yakin ingin menghapus folder <strong className="text-white font-semibold">"{name || 'ini'}"</strong> beserta seluruh isinya?</p>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️ Folder yang dihapus tidak dapat dikembalikan.</span>
                </div>
              </div>
            ),
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
        formatBytes={formatBytes}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Terms & Conditions Blocking Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onSuccess={(updatedUser) => {
          setIsTermsModalOpen(false);
          if (updatedUser) setUser(updatedUser);
          fetchDashboardData();
        }}
        onCancel={() => {
          clearAuth();
          navigate('/');
        }}
      />
    </div>
  );
};