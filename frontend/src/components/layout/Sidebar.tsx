import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/formatters';

import { Role } from '../../types';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: Users, allowedRoles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { name: 'Products & Inventory', path: '/products', icon: Package, allowedRoles: ['ADMIN', 'WAREHOUSE'] },
  { name: 'Challans & Sales', path: '/challans', icon: FileText, allowedRoles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-full overflow-y-auto z-10 dark:bg-gray-900 dark:border-gray-800 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="truncate">FlowSphere Enterprise</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
        {navItems.map((item) => {
          if (item.allowedRoles && !hasRole(item.allowedRoles as Role[]) && !hasRole(['ADMIN'])) {
            return null;
          }

          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
              {user?.role?.toLowerCase() || 'Role'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  );
};
