import React from 'react';
import { Activity } from 'lucide-react';

export interface AccessLog {
  id: string;
  uploaderEmail: string;
  accessorEmail: string;
  uniqueCode: string;
  accessedAt: string;
  file: { fileName: string };
}

interface AccessLogsTableProps {
  logs: AccessLog[];
}

export const AccessLogsTable: React.FC<AccessLogsTableProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <Activity className="w-10 h-10 mx-auto text-slate-600" />
        <p>Belum ada aktivitas pembagian atau pengunduhan file.</p>
      </div>
    );
  }

  return (
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
          {logs.map((log) => (
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
  );
};
