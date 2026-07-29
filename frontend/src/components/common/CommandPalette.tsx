import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Package, FileText, PlusCircle, ArrowRight, X } from 'lucide-react';
import { systemApi, GlobalSearchResult } from '../../services/systemApi';
import { formatCurrency } from '../../utils/formatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult>({ customers: [], products: [], challans: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ customers: [], products: [], challans: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await systemApi.globalSearch(query);
        setResults(data);
      } catch (err) {
        console.error('Command palette search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search customers, products, SKUs, challans..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 mr-2">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Box */}
        <div className="max-h-96 overflow-y-auto p-2">
          {/* Quick Pages */}
          {!query && (
            <div className="space-y-4 p-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  Navigation Pages
                </div>
                <div className="space-y-1">
                  {[
                    { title: 'Dashboard Analytics', path: '/dashboard', icon: ArrowRight },
                    { title: 'Customer CRM', path: '/customers', icon: User },
                    { title: 'Product Catalog', path: '/products', icon: Package },
                    { title: 'Inventory Movements', path: '/inventory', icon: Package },
                    { title: 'Sales Challans', path: '/challans', icon: FileText },
                    { title: 'Reports & Export', path: '/reports', icon: FileText },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                    >
                      <span className="flex items-center gap-2.5 font-medium">
                        <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        {item.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  Quick Actions
                </div>
                <div className="space-y-1">
                  {[
                    { title: 'Create Sales Challan', path: '/challans?action=new' },
                    { title: 'Add New Customer', path: '/customers?action=new' },
                    { title: 'Add Product to Catalog', path: '/products?action=new' },
                  ].map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Searching enterprise database...</div>
          )}

          {/* Dynamic Search Results */}
          {query && !isLoading && (
            <div className="space-y-3 p-1">
              {/* Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Customers</div>
                  {results.customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(`/customers/${c.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{c.name} {c.company ? `(${c.company})` : ''}</span>
                      <span className="text-slate-400 text-xs">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Products</div>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect('/products')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                        <span className="ml-2 text-xs font-mono text-slate-400">{p.sku}</span>
                      </div>
                      <span className="font-bold text-blue-600">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Challans */}
              {results.challans.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Sales Challans</div>
                  {results.challans.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelect(`/challans/${ch.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <span className="font-semibold font-mono text-blue-600">{ch.challanNo}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(ch.total)}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.customers.length === 0 && results.products.length === 0 && results.challans.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching items found for "{query}". Try searching by SKU or Customer Name.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
