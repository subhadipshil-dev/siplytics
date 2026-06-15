import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar Placeholder */}
      <aside className="hidden md:flex flex-col w-[230px] h-screen border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] p-5 shrink-0 select-none">
        <div className="flex items-center gap-3 mb-8 animate-pulse">
          <div className="h-9 w-9 rounded-xl bg-slate-800 shrink-0" />
          <div className="flex flex-col gap-1.5 w-24">
            <div className="h-3.5 bg-slate-800 rounded-md" />
            <div className="h-2 bg-slate-800/60 rounded-md w-16" />
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-4 w-4 bg-slate-800 rounded" />
              <div className="h-3 bg-slate-800 rounded w-28" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main Panel Placeholder */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-[var(--card-border)] animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-36" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-slate-800 rounded-xl" />
            <div className="h-8 w-28 bg-slate-800 rounded-xl" />
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="flex-1 p-5 md:p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Card stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-900/40 border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between">
                <div className="h-3 bg-slate-800 rounded w-20" />
                <div className="h-6 bg-slate-800 rounded w-28" />
              </div>
            ))}
          </div>

          {/* Core content charts/boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 animate-pulse">
            <div className="lg:col-span-8 h-80 bg-slate-900/40 border border-[var(--card-border)] rounded-2xl p-6" />
            <div className="lg:col-span-4 h-80 bg-slate-900/40 border border-[var(--card-border)] rounded-2xl p-6" />
          </div>
        </div>
      </main>
    </div>
  );
}
