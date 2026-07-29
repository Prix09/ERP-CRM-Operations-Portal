import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Download, Filter, Eye, Edit, Trash2, Package } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppTable } from '../../components/common/AppTable';
import { AppButton } from '../../components/ui/AppButton';
import { AppBadge } from '../../components/ui/AppBadge';
import { AppConfirmDialog } from '../../components/ui/AppConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', page, searchTerm],
    queryFn: async () => {
      const response = await productApi.getProducts({ page, limit: 10, search: searchTerm || undefined });
      return response;
    }
  });

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await productApi.deleteProduct(productToDelete);
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Cannot delete product as it is being used elsewhere.');
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const columns = [
    {
      header: 'Product',
      accessorKey: 'name',
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 text-gray-400">
            {info.row.original.imageUrl ? (
              <img src={info.row.original.imageUrl} alt={info.getValue()} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{info.getValue()}</div>
            <div className="text-sm text-gray-500 font-mono">{info.row.original.sku}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category.name',
      cell: (info: any) => info.getValue() || 'Uncategorized'
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: (info: any) => <span className="font-medium">{formatCurrency(info.getValue())}</span>
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      cell: (info: any) => {
        const stock = info.getValue() as number;
        const minStock = info.row.original.minStock;
        
        let variant: 'emerald' | 'amber' | 'rose' = 'emerald';
        let status = 'In Stock';
        
        if (stock <= 0) {
          variant = 'rose';
          status = 'Out of Stock';
        } else if (stock <= minStock) {
          variant = 'amber';
          status = 'Low Stock';
        }

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium tabular-nums">{stock}</span>
            <AppBadge variant={variant} size="sm">{status}</AppBadge>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => (
        <div className="flex justify-end gap-2">
          <button 
            className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            onClick={() => navigate(`/products/${info.row.original.id}`)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => navigate(`/products/${info.row.original.id}/edit`)}
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            onClick={() => {
              setProductToDelete(info.row.original.id);
              setDeleteConfirmOpen(true);
            }}
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AppPageHeader 
          title="Products & Inventory" 
          description="Manage your product catalog, pricing, and stock levels."
        />
        <div className="flex items-center gap-2">
          <AppButton variant="outline" icon={<Download className="w-4 h-4" />} onClick={async () => {
            try {
              await productApi.exportCsv();
            } catch (err) {
              console.error('Failed to export', err);
            }
          }}>Export</AppButton>
          <AppButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/products/new')}>Add Product</AppButton>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex gap-2">
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-64 h-9 pl-9 pr-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <AppTable 
          columns={columns} 
          data={(data as any)?.products || []} 
          isLoading={isLoading}
        />
        
        {!isLoading && (data as any)?.meta && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
            <div className="text-gray-500">
              Showing <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * 10, (data as any).meta.total || 0)}</span> of <span className="font-medium text-gray-900 dark:text-white">{(data as any).meta.total}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page === (data as any)?.meta?.totalPages}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AppConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
        isDanger={true}
      />
    </div>
  );
};
