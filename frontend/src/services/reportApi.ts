import { api } from './api';
import { DashboardAnalytics, ApiResponse } from '../types';

export const reportApi = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const res = await api.get<ApiResponse<DashboardAnalytics>>('/reports/dashboard');
    return res.data.data!;
  },
  getSalesReport: async () => {
    const res = await api.get<ApiResponse<any>>('/reports/sales');
    return res.data.data;
  },
  getInventoryReport: async () => {
    const res = await api.get<ApiResponse<any>>('/reports/inventory');
    return res.data.data;
  },
  getCustomerReport: async () => {
    const res = await api.get<ApiResponse<any>>('/reports/customers');
    return res.data.data;
  },
};
