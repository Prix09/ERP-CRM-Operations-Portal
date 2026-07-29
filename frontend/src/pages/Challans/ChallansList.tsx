import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Download, Filter, Eye, FileText, CheckCircle, Search } from 'lucide-react';
import { challanApi } from '../../services/challanApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppTable } from '../../components/common/AppTable';
import { AppButton } from '../../components/ui/AppButton';
import { AppStatusBadge } from '../../components/ui/AppStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

import { useNavigate, useSearchParams } from 'react-router-dom';

export const ChallansList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const { data, isLoading } = useQuery({
    queryKey: ['challans', page, searchTerm],
    queryFn: async () => {
      const response = await challanApi.getChallans({ page, limit: 10, search: searchTerm || undefined });
      return response;
    }
  });

  const columns = [
    {
      header: 'Challan No',
      accessorKey: 'challanNo',
      cell: (info: any) => (
        <div className="font-semibold text-indigo-600 dark:text-indigo-400">
          {info.getValue()}
        </div>
      )
    },
    {
      header: 'Customer',
      accessorKey: 'customer.name',
      cell: (info: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{info.getValue() || 'Unknown'}</div>
          {info.row.original.customer?.company && (
            <div className="text-xs text-gray-500">{info.row.original.customer.company}</div>
          )}
        </div>
      )
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (info: any) => formatDateTime(info.getValue() as string)
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (info: any) => (
        <span className="font-medium">{formatCurrency(info.getValue())}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => <AppStatusBadge status={info.getValue()} />
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => {
        const challan = info.row.original;
        return (
          <div className="flex justify-end gap-2">
            <button 
              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              onClick={() => navigate(`/challans/${challan.id}`)}
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Download PDF"
              onClick={async () => {
                try {
                  await challanApi.downloadPDF(challan.id);
                } catch (err) {
                  console.error('Failed to download PDF', err);
                  alert('Failed to download PDF. Please try again.');
                }
              }}
            >
              <FileText className="w-4 h-4" />
            </button>
            {challan.status === 'DRAFT' && (
              <button 
                className="p-1.5 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                title="Confirm Challan"
                onClick={async () => {
                  try {
                    await challanApi.updateStatus(challan.id, 'CONFIRMED');
                    alert('Challan confirmed successfully!');
                    window.location.reload();
                  } catch (err: any) {
                    console.error('Failed to confirm challan', err);
                    alert(err?.response?.data?.message || 'Failed to confirm challan.');
                  }
                }}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AppPageHeader 
          title="Sales Challans" 
          description="Manage delivery challans and sales invoices."
        />
        <div className="flex items-center gap-2">
          <AppButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/challans/new')}>Create Challan</AppButton>
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
                placeholder="Search by challan no..."
                className="w-64 h-9 pl-9 pr-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <AppTable 
          columns={columns} 
          data={(data as any)?.challans || []} 
          isLoading={isLoading}
        />
        
        {!isLoading && (data as any)?.meta && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
            <div className="text-gray-500">
              Showing <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * 10, (data as any).meta.total)}</span> of <span className="font-medium text-gray-900 dark:text-white">{(data as any).meta.total}</span> results
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
    </div>
  );
};
