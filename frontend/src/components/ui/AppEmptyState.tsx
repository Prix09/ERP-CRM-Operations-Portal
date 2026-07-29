import React from 'react';
import { FolderOpen } from 'lucide-react';
import { AppButton } from './AppButton';

interface AppEmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#1E293B] border border-dashed border-slate-300 dark:border-slate-800 rounded-xl my-4">
      <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-full text-slate-400 dark:text-slate-500 mb-4">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <AppButton onClick={onAction} size="sm">
          {actionText}
        </AppButton>
      )}
    </div>
  );
};
