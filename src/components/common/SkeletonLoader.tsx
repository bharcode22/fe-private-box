import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800/60 animate-pulse rounded-xl ${className}`} />
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 p-4">
    <div className="h-10 bg-slate-900/80 rounded-xl animate-pulse w-full border border-slate-800" />
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-14 bg-slate-900/40 rounded-xl animate-pulse flex items-center justify-between px-6 border border-slate-800/40"
      >
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 animate-pulse" />
          <div className="h-4 bg-slate-800/80 rounded w-full" />
        </div>
        <div className="h-4 bg-slate-800/60 rounded w-1/6 hidden sm:block" />
        <div className="h-4 bg-slate-800/60 rounded w-1/6 hidden md:block" />
        <div className="h-4 bg-slate-800/60 rounded w-1/6" />
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 animate-pulse" />
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 animate-pulse"
      >
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-800/80 rounded w-1/2" />
          <div className="w-6 h-6 rounded-lg bg-slate-800/80" />
        </div>
        <div className="h-8 bg-slate-800/80 rounded w-3/4" />
        <div className="h-2.5 bg-slate-800/60 rounded-full w-full" />
        <div className="h-3 bg-slate-800/40 rounded w-2/3" />
      </div>
    ))}
  </div>
);
