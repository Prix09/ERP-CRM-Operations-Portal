import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, Clock, FileText } from 'lucide-react';
import { reportApi } from '../../services/reportApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppStatCard } from '../../components/ui/AppStatCard';
import { AppCard } from '../../components/ui/AppCard';
import { AppSkeleton } from '../../components/ui/AppSkeleton';
import { formatCurrency } from '../../utils/formatters';

import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const response = await reportApi.getDashboardAnalytics();
      return response;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AppPageHeader title="Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AppSkeleton className="h-32 rounded-xl" />
          <AppSkeleton className="h-32 rounded-xl" />
          <AppSkeleton className="h-32 rounded-xl" />
          <AppSkeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AppSkeleton className="lg:col-span-2 h-96 rounded-xl" />
          <AppSkeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AppPageHeader title="Dashboard" />
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AppPageHeader 
        title="Dashboard" 
        description="Overview of your business metrics and recent activities."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <AppStatCard
          title="Total Revenue"
          value={formatCurrency(data?.kpis?.todaySalesRevenue || 0)}
          icon={DollarSign}
          change="12.5%"
          isPositive={true}
        />
        <AppStatCard
          title="Total Customers"
          value={(data?.kpis?.totalCustomers || 0).toLocaleString()}
          icon={Users}
          change="5.2%"
          isPositive={true}
        />
        <AppStatCard
          title="Total Products"
          value={(data?.kpis?.totalProducts || 0).toLocaleString()}
          icon={Package}
        />
        <AppStatCard
          title="Low Stock Alerts"
          value={(data?.kpis?.lowStockCount || 0).toLocaleString()}
          icon={ShoppingCart}
          change="2.1%"
          isPositive={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <AppCard className="lg:col-span-2">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Challans</h3>
            <button 
              onClick={() => navigate('/challans')} 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Challan No</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data?.recentChallans?.length ? data.recentChallans.map((row: any) => (
                  <tr key={row.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.challanNo}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{row.customer?.company || row.customer?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white text-right font-medium">{formatCurrency(row.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${
                        row.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400' :
                        row.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent challans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AppCard>

        <AppCard>
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
          </div>
          <div className="p-6 space-y-6">
            {data?.recentActivities?.length ? data.recentActivities.map((activity: any, i: number) => {
              const ActivityIcon = activity.entity === 'Sales Challan' ? FileText : 
                                   activity.entity === 'Inventory' ? Package : 
                                   activity.entity === 'Customer CRM' ? Users : 
                                   activity.entity === 'User Management' ? Users : Clock;
                                   
              const colorClass = activity.action === 'CONFIRMED' ? 'text-emerald-500' :
                                 activity.action === 'LOW_STOCK' ? 'text-orange-500' :
                                 'text-blue-500';
              const bgClass = activity.action === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                              activity.action === 'LOW_STOCK' ? 'bg-orange-100 dark:bg-orange-900/30' :
                              'bg-blue-100 dark:bg-blue-900/30';

              return (
                <div key={activity.id || i} className="flex gap-4">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                    <ActivityIcon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.entity} {activity.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activity.details}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-sm text-gray-500 text-center py-4">No recent activities found.</div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 rounded-b-xl">
             <button className="w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
               View All Activities
             </button>
          </div>
        </AppCard>
      </div>
    </div>
  );
};
