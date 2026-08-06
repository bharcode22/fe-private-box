import React, { useState } from 'react';
import { Folder, X } from 'lucide-react';
import api from '../../services/api';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId: string | null;
}

export const CreateFolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onSuccess, parentId }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/folders', { name, parentId });
      setName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal membuat folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5 text-indigo-400" /> Buat Folder Baru
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Folder"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 mb-4"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Buat Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
