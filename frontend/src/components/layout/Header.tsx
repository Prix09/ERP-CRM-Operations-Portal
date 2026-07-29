import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationsCenter } from '../common/NotificationsCenter';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 transition-colors">
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search anything... (Ctrl+K)" 
            className="w-64 h-9 pl-9 pr-4 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-gray-200 placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.currentTarget.value.trim().toLowerCase();
                const searchParam = encodeURIComponent(e.currentTarget.value.trim());
                if (val.startsWith('chl')) {
                   window.location.href = `/challans?search=${searchParam}`;
                } else if (val === 'product' || val === 'stock') {
                   window.location.href = `/products?search=${searchParam}`;
                } else {
                   window.location.href = `/customers?search=${searchParam}`;
                }
              }
            }}
          />
        </div>

        {/* Quick Add Button (Removed) */}

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationsCenter />
      </div>
    </header>
  );
};
