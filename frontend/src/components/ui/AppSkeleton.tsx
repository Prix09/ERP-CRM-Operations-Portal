import React from 'react';

interface AppSkeletonProps {
  type?: 'card' | 'table' | 'text' | 'kpi';
  rows?: number;
  className?: string;
}

export const AppSkeleton: React.FC<AppSkeletonProps> = ({ type = 'text', rows = 3, className = '' }) => {
  if (type === 'kpi') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse">
            <div className="flex justify-between items-center mb-3">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse ${className}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      ))}
    </div>
  );
};
