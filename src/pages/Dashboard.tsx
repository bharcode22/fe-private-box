import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, UploadCloud } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { AccountStatusCards } from '../components/dashboard/AccountStatusCards';
import { UploadFileModal } from '../components/dashboard/UploadFileModal';
import { FileListTable, FileItem, FolderItem } from '../components/dashboard/FileListTable';
import { CreateFolderModal } from '../components/dashboard/FolderModals';
import { AccessLogsTable, AccessLog } from '../components/dashboard/AccessLogsTable';
import { ShareModal } from '../components/dashboard/ShareModal';
import { formatBytes } from '../utils/formatters';
import { getDaysRemaining } from '../utils/dateUtils';

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

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [shareModal, setShareModal] = useState<{ id: string; name: string; type: 'file' | 'folder'; code?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'logs'>('files');

  useEffect(() => {
    const savedUser = localStorage.getItem('pb_user');
    const token = localStorage.getItem('pb_token');

    if (!savedUser || !token) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const resFiles = await api.get(`/api/files${currentFolder ? `?folderId=${currentFolder.id}` : ''}`);
      setFiles(resFiles.data.files);
      setUserInfo(resFiles.data.userInfo);

      const resFolders = await api.get(`/api/folders${currentFolder ? `?parentId=${currentFolder.id}` : ''}`);
      setFolders(resFolders.data.folders);

      const resLogs = await api.get('/api/logs');
      setAccessLogs(resLogs.data.logs);
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, currentFolder]);

    const handleLogout = () => {
      localStorage.removeItem('pb_token');
      localStorage.removeItem('pb_user');
      navigate('/');
    };

    const handleFileUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFiles || selectedFiles.length === 0) return;

      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      if (currentFolder) {
        formData.append('folderId', currentFolder.id);
      }

      setUploading(true);
      setUploadProgress(0);
      try {
        await api.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        });

        setSelectedFiles(null);
        setIsUploadModalOpen(false);
        fetchDashboardData();
        alert('File berhasil diunggah!');
      } catch (err: any) {
        alert(err.response?.data?.error || 'Gagal mengunggah file');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    };

    const handleGenerateShareCode = async (fileId: string, fileName: string) => {
      try {
        const res = await api.post(`/api/files/${fileId}/share`);
        setShareModal({
          id: fileId,
          name: fileName,
          type: 'file',
          code: res.data.uniqueCode,
        });
        fetchDashboardData();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Gagal membuat kode unik pembagian file');
      }
    };

    const handleGenerateFolderShareCode = async (folderId: string, folderName: string) => {
      try {
        const res = await api.post(`/api/folders/${folderId}/share`);
        setShareModal({
          id: folderId,
          name: folderName,
          type: 'folder',
          code: res.data.uniqueCode,
        });
        fetchDashboardData();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Gagal membuat kode unik pembagian folder');
      }
    };

    const handleDownloadPrivate = async (fileId: string, fileName: string) => {
      try {
        const res = await api.get(`/api/files/${fileId}/download`, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        alert('Gagal mengunduh file');
      }
    };


    const usedBytes = Number(userInfo?.storageUsed || 0);
    const limitBytes = Number(userInfo?.storageLimit || import.meta.env.VITE_FREE_USER_QUOTA_BYTES || 10737418240);
    const quotaPercent = Math.min(100, (usedBytes / limitBytes) * 100);
    const daysLeft = getDaysRemaining(userInfo?.expiresAt);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Navbar Header Component */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Main Dashboard Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          {/* Storage Quota & Subscription Status Component */}
          <AccountStatusCards
            usedBytes={usedBytes}
            limitBytes={limitBytes}
            quotaPercent={quotaPercent}
            daysLeft={daysLeft}
            accountStatus={userInfo?.accountStatus}
            formatBytes={formatBytes}
          />

          {/* Dashboard Tabs (Files vs Access Logs) */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-800 space-x-6">
              <button
                onClick={() => setActiveTab('files')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'files'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                <FileText className="w-4 h-4" /> Daftar File & Folder ({files.length + folders.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'logs'
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <button onClick={() => { setCurrentFolder(null); setBreadcrumbs([]); }} className="hover:text-white transition">Root</button>
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.id}>
                        <span>/</span>
                        <button onClick={() => {
                          const newCrumbs = breadcrumbs.slice(0, idx + 1);
                          setBreadcrumbs(newCrumbs);
                          setCurrentFolder(newCrumbs[newCrumbs.length - 1]);
                        }} className="hover:text-white transition">{crumb.name}</button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Unggah File
                    </button>
                    <button
                      onClick={() => setIsCreateFolderModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Buat Folder Baru
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
                  <FileListTable
                    folders={folders}
                    files={files}
                    formatBytes={formatBytes}
                    onFolderClick={(id, name) => {
                      const newFolder = { id, name };
                      setCurrentFolder(newFolder);
                      setBreadcrumbs([...breadcrumbs, newFolder]);
                    }}
                    onGenerateShareCode={handleGenerateShareCode}
                    onGenerateFolderShareCode={handleGenerateFolderShareCode}
                    onDownloadPrivate={handleDownloadPrivate}
                    onDeleteFolder={async (id) => {
                      if (confirm('Yakin ingin menghapus folder ini beserta isinya?')) {
                        await api.delete(`/api/folders/${id}`);
                        fetchDashboardData();
                      }
                    }}
                    onRenameFolder={async (id) => {
                      const newName = prompt('Masukkan nama folder baru:');
                      if (newName) {
                        await api.put(`/api/folders/${id}`, { name: newName });
                        fetchDashboardData();
                      }
                    }}
                    onDeleteFile={async (id) => {
                      if (confirm('Yakin ingin menghapus file ini?')) {
                        await api.delete(`/api/files/${id}`);
                        fetchDashboardData();
                      }
                    }}
                    onRenameFile={async (id) => {
                      const newName = prompt('Masukkan nama file baru:');
                      if (newName) {
                        await api.put(`/api/files/${id}`, { name: newName });
                        fetchDashboardData();
                      }
                    }}
                  />
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
          onRegenerate={async (id) => {
            try {
              const isFolder = shareModal?.type === 'folder';
              const res = await api.put(isFolder ? `/api/folders/${id}/share` : `/api/files/${id}/share`);
              setShareModal(prev => prev ? { ...prev, code: res.data.uniqueCode } : null);
              fetchDashboardData();
            } catch (err: any) {
              alert(err.response?.data?.error || 'Gagal regenerate kode');
            }
          }}
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
        />
      </div>
  );
};