import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity } from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { AccountStatusCards } from '../components/dashboard/AccountStatusCards';
import { FileUploadWidget } from '../components/dashboard/FileUploadWidget';
import { FileListTable, FileItem } from '../components/dashboard/FileListTable';
import { AccessLogsTable, AccessLog } from '../components/dashboard/AccessLogsTable';
import { ShareModal } from '../components/dashboard/ShareModal';
import { formatBytes } from '../utils/formatters';
import { getDaysRemaining } from '../utils/dateUtils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [userInfo, setUserInfo] = useState<{
    storageLimit: number;
    storageUsed: number;
    accountStatus: string;
    expiresAt: string;
  } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareModal, setShareModal] = useState<{ fileId: string; fileName: string; code?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'logs'>('files');

  useEffect(() => {
    const savedUser = localStorage.getItem('pb_user');
    const token = localStorage.getItem('pb_token');

    if (!savedUser || !token) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const resFiles = await api.get('/api/files');
      setFiles(resFiles.data.files);
      setUserInfo(resFiles.data.userInfo);

      const resLogs = await api.get('/api/logs');
      setAccessLogs(resLogs.data.logs);
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    navigate('/');
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSelectedFile(null);
      fetchDashboardData();
      alert('File berhasil diunggah!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal mengunggah file');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateShareCode = async (fileId: string, fileName: string) => {
    try {
      const res = await api.post(`/api/files/${fileId}/share`);
      setShareModal({
        fileId,
        fileName,
        code: res.data.uniqueCode,
      });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal membuat kode unik pembagian file');
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

        {/* File Upload Widget Component */}
        <FileUploadWidget
          accountStatus={userInfo?.accountStatus}
          uploading={uploading}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onSubmit={handleFileUpload}
        />

        {/* Dashboard Tabs (Files vs Access Logs) */}
        <div className="space-y-4">
          <div className="flex border-b border-slate-800 space-x-6">
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'files'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> Daftar File Privat ({files.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" /> Log Akses Pembagian ({accessLogs.length})
            </button>
          </div>

          {/* Files List Table Component */}
          {activeTab === 'files' && (
            <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
              <FileListTable
                files={files}
                formatBytes={formatBytes}
                onGenerateShareCode={handleGenerateShareCode}
                onDownloadPrivate={handleDownloadPrivate}
              />
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
      <ShareModal modalData={shareModal} onClose={() => setShareModal(null)} />
    </div>
  );
};
