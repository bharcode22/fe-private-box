import React from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface FileUploadWidgetProps {

  accountStatus?: string;
  uploading: boolean;
  uploadProgress?: number;
  selectedFiles: FileList | null;
  onFileSelect: (files: FileList | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  accountStatus,
  uploading,
  uploadProgress = 0,
  selectedFiles,
  onFileSelect,
  onSubmit,
}) => {
  const isExpired = accountStatus === 'EXPIRED';

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-indigo-400" /> Unggah File Baru
      </h2>



      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          multiple
          onChange={(e) => onFileSelect(e.target.files)}
          disabled={isExpired}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer border border-slate-800 rounded-xl bg-slate-900/50 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!selectedFiles || selectedFiles.length === 0 || uploading || isExpired}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {uploading ? `Mengunggah... ${uploadProgress}%` : 'Unggah File'}
        </button>
      </form>
      
      {uploading && (
        <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
    </div>
  );
};
