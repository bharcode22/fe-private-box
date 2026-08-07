import React, { useState } from 'react';
import { X, UploadCloud, Folder, File, AlertCircle, FolderPlus } from 'lucide-react';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountStatus?: string;
  uploading: boolean;
  uploadProgress?: number;
  selectedFiles: FileList | null;
  currentFolderName?: string;
  onFileSelect: (files: FileList | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  accountStatus,
  uploading,
  uploadProgress = 0,
  selectedFiles,
  currentFolderName,
  onFileSelect,
  onSubmit,
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'folder'>('file');

  if (!isOpen) return null;

  const isExpired = accountStatus === 'EXPIRED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-slate-800 p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Unggah File & Folder</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span>Lokasi simpan:</span>
              <span className="font-semibold text-indigo-300 flex items-center gap-1">
                <Folder className="w-3 h-3 inline" /> {currentFolderName || 'Root'}
              </span>
            </p>
          </div>
        </div>

        {/* Upload Mode Selector (File vs Folder) */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setUploadMode('file');
              onFileSelect(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${uploadMode === 'file'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
          >
            <File className="w-4 h-4 text-indigo-400" />
            <span>Unggah File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadMode('folder');
              onFileSelect(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${uploadMode === 'folder'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>Unggah Folder</span>
          </button>
        </div>

        {isExpired && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>Masa aktif akun telah berakhir. Anda hanya dapat mengunduh file.</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 transition rounded-2xl p-6 text-center space-y-3 bg-slate-900/40">
            {uploadMode === 'file' ? (
              <>
                <input
                  type="file"
                  id="modalFileInput"
                  multiple
                  onChange={(e) => onFileSelect(e.target.files)}
                  disabled={isExpired || uploading}
                  className="hidden"
                />
                <label
                  htmlFor="modalFileInput"
                  className="cursor-pointer flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 text-slate-400 flex items-center justify-center transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition">
                      Pilih File
                    </span>
                    <span className="text-xs text-slate-400"> atau seret file ke sini</span>
                  </div>
                </label>
              </>
            ) : (
              <>
                <input
                  type="file"
                  id="modalFolderInput"
                  {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
                  onChange={(e) => onFileSelect(e.target.files)}
                  disabled={isExpired || uploading}
                  className="hidden"
                />
                <label
                  htmlFor="modalFolderInput"
                  className="cursor-pointer flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 text-slate-400 flex items-center justify-center transition">
                    <FolderPlus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition">
                      Pilih Folder
                    </span>
                    <span className="text-xs text-slate-400"> untuk diunggah beserta runs/subfolder</span>
                  </div>
                </label>
              </>
            )}

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-left space-y-1.5 max-h-40 overflow-y-auto">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  File/Folder Dipilih ({selectedFiles.length}):
                </p>
                {Array.from(selectedFiles).map((file, idx) => {
                  const relPath = (file as any).webkitRelativePath || file.name;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-200 bg-slate-800/60 px-3 py-1.5 rounded-lg"
                    >
                      <span className="truncate max-w-[280px] flex items-center gap-1.5" title={relPath}>
                        {uploadMode === 'folder' ? (
                          <Folder className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        ) : (
                          <File className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{relPath}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Mengunggah file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!selectedFiles || selectedFiles.length === 0 || uploading || isExpired}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {uploading ? `Mengunggah... ${uploadProgress}%` : 'Mulai Unggah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
