import React from 'react';
import { clsx } from 'clsx';

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({ children, className, header, footer }) => {
  return (
    <div className={clsx('bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all duration-200', className)}>
      {header && <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-xl">{footer}</div>}
    </div>
  );
};
