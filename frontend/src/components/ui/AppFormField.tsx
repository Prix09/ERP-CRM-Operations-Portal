import React from 'react';

interface AppFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

export const AppFormField: React.FC<AppFormFieldProps> = ({
  label,
  error,
  required = false,
  helpText,
  children,
}) => {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {helpText && !error && <span className="text-[11px] text-slate-400">{helpText}</span>}
      {error && <span className="text-xs font-medium text-rose-500 animate-in fade-in duration-150">{error}</span>}
    </div>
  );
};
