import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Download, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerApi } from '../../services/customerApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppTable } from '../../components/common/AppTable';
import { AppButton } from '../../components/ui/AppButton';
import { AppBadge } from '../../components/ui/AppBadge';
import { AppConfirmDialog } from '../../components/ui/AppConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CustomersList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', page, searchTerm],
    queryFn: async () => {
      const response = await customerApi.getCustomers({ page, limit: 10, search: searchTerm || undefined });
      return response;
    }
  });

  const handleDelete = async () => {
    if (customerToDelete) {
      try {
        await customerApi.deleteCustomer(customerToDelete);
        setDeleteConfirmOpen(false);
        setCustomerToDelete(null);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Cannot delete customer as they have associated records.');
        setDeleteConfirmOpen(false);
        setCustomerToDelete(null);
      }
    }
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{info.getValue()}</div>
          <div className="text-sm text-gray-500">{info.row.original.companyName}</div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessorKey: 'email',
      cell: (info: any) => (
        <div className="text-sm">
          <div>{info.getValue()}</div>
          <div className="text-gray-500">{info.row.original.phone}</div>
        </div>
      )
    },
    {
      header: 'Outstanding Balance',
      accessorKey: 'outstandingBalance',
      cell: (info: any) => {
        const val = (info.getValue() as number) || 0;
        return (
          <span className={`font-medium ${val > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatCurrency(val)}
          </span>
        );
      }
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: (info: any) => formatDate(info.getValue() as string)
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const status = info.getValue() as string || 'UNKNOWN';
        let variant: 'emerald' | 'slate' | 'amber' | 'default' = 'slate';
        if (status === 'ACTIVE') variant = 'emerald';
        if (status === 'LEAD') variant = 'amber';
        return (
          <AppBadge variant={variant}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </AppBadge>
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
            onClick={() => navigate(`/customers/${info.row.original.id}`)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => navigate(`/customers/${info.row.original.id}/edit`)}
            title="Edit Customer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            onClick={() => {
              setCustomerToDelete(info.row.original.id);
              setDeleteConfirmOpen(true);
            }}
            title="Delete Customer"
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
          title="Customers" 
          description="Manage your customer relationships and balances."
        />
        <div className="flex items-center gap-2">
          <AppButton variant="outline" icon={<Download className="w-4 h-4" />} onClick={async () => {
            try {
              await customerApi.exportCsv();
            } catch (err) {
              console.error('Failed to export', err);
            }
          }}>Export</AppButton>
          <AppButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/customers/new')}>Add Customer</AppButton>
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
                placeholder="Search customers..."
                className="w-64 h-9 pl-9 pr-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {/* Search Icon */}
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <AppTable 
          columns={columns} 
          data={((data as any)?.customers as any[]) || []} 
          isLoading={isLoading}
        />
        
        {/* Pagination placeholder */}
        {!isLoading && data?.meta && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
            <div className="text-gray-500">
              Showing <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * 10, (data as any)?.meta?.total || 0)}</span> of <span className="font-medium text-gray-900 dark:text-white">{(data as any)?.meta?.total || 0}</span> results
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
                disabled={page === data.meta.totalPages}
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCustomerToDelete(null);
        }}
        isDanger={true}
      />
    </div>
  );
};
