import React, { useState } from 'react';
import { AlertTriangle, Edit3, Trash2, CheckCircle2, XCircle, Info, X } from 'lucide-react';

// Toast Notification Types & Component
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderColor = 'border-emerald-500/30';
        let bgGlow = 'bg-emerald-500/10';
        let textColor = 'text-emerald-300';
        let iconColor = 'text-emerald-400';

        if (toast.type === 'error') {
          Icon = XCircle;
          borderColor = 'border-red-500/30';
          bgGlow = 'bg-red-500/10';
          textColor = 'text-red-300';
          iconColor = 'text-red-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderColor = 'border-indigo-500/30';
          bgGlow = 'bg-indigo-500/10';
          textColor = 'text-indigo-300';
          iconColor = 'text-indigo-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl glass-card border ${borderColor} ${bgGlow} shadow-2xl flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-5 duration-300`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span className={`font-semibold ${textColor}`}>{toast.message}</span>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

import { createPortal } from 'react-dom';

// Custom Confirmation Dialog (Replaces window.confirm)
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 sm:space-y-5 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDanger
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
              }`}
          >
            {isDanger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>{cancelText}</span>
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${isDanger
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Custom Prompt/Rename Dialog (Replaces window.prompt)
interface PromptModalProps {
  isOpen: boolean;
  title: string;
  label?: string;
  initialValue?: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  title,
  label = 'Masukkan nama baru:',
  initialValue = '',
  placeholder = 'Nama...',
  confirmText = 'Simpan Nama',
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() !== '') {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 sm:space-y-5 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">{label}</label>
            <input
              type="text"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
