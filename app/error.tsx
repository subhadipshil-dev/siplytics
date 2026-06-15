'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or reporting provider
    console.error('App Router Failure:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070913] text-[#f8fafc] flex flex-col items-center justify-center p-6 select-none font-inter">
      {/* Background grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-md w-full rounded-2xl bg-white/[0.015] border border-white/5 p-8 flex flex-col items-center text-center relative z-10 shadow-2xl backdrop-blur-xl">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-5 animate-pulse">
          <AlertOctagon size={32} />
        </div>

        <h2 className="text-xl font-bold font-space tracking-tight text-white mb-2">
          Planning Engine Interrupted
        </h2>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          An unexpected error occurred while calculating your wealth projections. 
          The parameters might be outside our safe computational bounds.
        </p>

        {error.message && (
          <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 mb-6 text-left overflow-auto max-h-32">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Error Details</span>
            <p className="text-xs text-red-400 font-mono mt-1 leading-normal break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 w-full">
          <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
            Return Home
          </Button>
          <Button className="flex-1 flex items-center justify-center gap-2" onClick={reset}>
            <RotateCcw size={14} />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
