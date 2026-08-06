import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardDrive,
  UploadCloud,
  FileText,
  Share2,
  Download,
  Clock,
  Shield,
  LogOut,
  Copy,
  Activity,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

interface FileItem {
  id: string;
  fileName: string;
  fileSize: string;
  storageAccountId: string;
  createdAt: string;
  shares: { uniqueCode: string; isActive: boolean }[];
}

interface AccessLog {
  id: string;
  uploaderEmail: string;
  accessorEmail: string;
  uniqueCode: string;
  accessedAt: string;
  file: { fileName: string };
}

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
    if (!selectedFile || isDemoUser) return;

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDaysRemaining = (expiresAtStr?: string) => {
    if (!expiresAtStr) return Number(import.meta.env.VITE_FREE_USER_ACTIVE_DAYS || 30);
    const exp = new Date(expiresAtStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((exp - now) / (1000 * 3600 * 24));
    return Math.max(0, diffDays);
  };

  const isDemoUser = user?.email === 'demouser@privatebox.app' || user?.email?.startsWith('demo');
  const usedBytes = Number(userInfo?.storageUsed || 0);
  const limitBytes = Number(userInfo?.storageLimit || import.meta.env.VITE_FREE_USER_QUOTA_BYTES || 10737418240);
  const quotaPercent = Math.min(100, (usedBytes / limitBytes) * 100);
  const daysLeft = getDaysRemaining(userInfo?.expiresAt);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Private<span className="text-indigo-400">Box</span></span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{user?.name}</span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white transition"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Account Status & Quota Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Storage Quota Card */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Sisa Kuota Penyimpanan</span>
              <HardDrive className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {formatBytes(usedBytes)} <span className="text-slate-500 text-base font-normal">/ {formatBytes(limitBytes)}</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400">Terpakai {quotaPercent.toFixed(1)}% dari kuota 10 GB gratis Anda.</p>
          </div>

          {/* Active Subscription Meter */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Masa Aktif Akun (30 Hari)</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {daysLeft} Hari <span className="text-slate-500 text-base font-normal">tersisa</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                style={{ width: `${(daysLeft / 30) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400">Masa aktif gratis sejak pendaftaran pertama.</p>
          </div>

          {/* Account Status Badge */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Status Lisensi Akun</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isDemoUser
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : userInfo?.accountStatus === 'EXPIRED'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                {isDemoUser ? 'DEMO READ-ONLY' : userInfo?.accountStatus || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isDemoUser
                ? 'Akun Demo Pratinjau. Fitur pengungahan file dinonaktifkan.'
                : userInfo?.accountStatus === 'EXPIRED'
                ? 'Akun kedaluwarsa. Hanya dapat mengunduh file lama.'
                : 'Akun aktif penuh untuk unggah & unduh file.'}
            </p>
          </div>
        </div>

        {/* Upload File Widget */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" /> Unggah File Baru
          </h2>

          {isDemoUser && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Akun Demo bersifat Read-Only untuk pratinjau. Fitur pengunggahan file baru dinonaktifkan.</span>
            </div>
          )}

          <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={userInfo?.accountStatus === 'EXPIRED' || isDemoUser}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer border border-slate-800 rounded-xl bg-slate-900/50 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!selectedFile || uploading || userInfo?.accountStatus === 'EXPIRED' || isDemoUser}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? 'Mengunggah...' : 'Unggah File'}
            </button>
          </form>
        </div>

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
              <FileText className="w-4 h-4" /> Daftar File Privat ({files.length})
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

          {/* Files List Table */}
          {activeTab === 'files' && (
            <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
              {files.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-600" />
                  <p>Belum ada file yang diunggah.</p>
                </div>
              ) : (
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
                              onClick={() => handleGenerateShareCode(file.id, file.fileName)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition inline-flex items-center gap-1.5"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Bagikan
                            </button>
                            <button
                              onClick={() => handleDownloadPrivate(file.id, file.fileName)}
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
              )}
            </div>
          )}

          {/* Access Logs Table */}
          {activeTab === 'logs' && (
            <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
              {accessLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Activity className="w-10 h-10 mx-auto text-slate-600" />
                  <p>Belum ada aktivitas pembagian atau pengunduhan file.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Nama File</th>
                        <th className="px-6 py-4">Pengunduh (Accessor)</th>
                        <th className="px-6 py-4">Kode Unik</th>
                        <th className="px-6 py-4">Waktu Akses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {accessLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition">
                          <td className="px-6 py-4 font-semibold text-white">{log.file?.fileName}</td>
                          <td className="px-6 py-4 text-indigo-300 font-medium">{log.accessorEmail}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono bg-slate-900 px-2 py-1 rounded text-xs border border-slate-700 text-purple-300">
                              {log.uniqueCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(log.accessedAt).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 rounded-2xl border border-slate-800 space-y-4 relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" /> Bagikan File
            </h3>
            <p className="text-slate-400 text-xs">
              File: <strong className="text-slate-200">{shareModal.fileName}</strong>
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Kode Unik Akses:</span>
              <div className="flex items-center justify-between font-mono text-2xl font-extrabold text-indigo-400 tracking-wider">
                <span>{shareModal.code}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareModal.code || '');
                    alert('Kode berhasil disalin!');
                  }}
                  className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition"
                  title="Salin Kode"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Penerima dapat membuka laman <strong className="text-slate-300">/share</strong> dan memasukkan Kode Unik di atas beserta email mereka untuk mengunduh file.
            </p>

            <button
              onClick={() => setShareModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
