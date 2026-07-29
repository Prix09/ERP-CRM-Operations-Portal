import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, PackagePlus, FilePlus, ArrowRightLeft } from 'lucide-react';
import { AppButton } from '../ui/AppButton';

export const QuickAddMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={menuRef}>
      <AppButton size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsOpen(!isOpen)}>
        Quick Add
      </AppButton>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Create Record
          </div>
          {[
            { label: 'New Sales Challan', icon: FilePlus, path: '/challans?action=new' },
            { label: 'New Customer CRM', icon: UserPlus, path: '/customers?action=new' },
            { label: 'New Catalog Product', icon: PackagePlus, path: '/products?action=new' },
            { label: 'Stock Movement Log', icon: ArrowRightLeft, path: '/inventory?action=new' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleAction(item.path)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
            >
              <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
