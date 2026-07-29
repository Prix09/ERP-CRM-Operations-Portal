import { api } from './api';
import { Customer, CustomerNote, ApiResponse } from '../types';

export const customerApi = {
  getCustomers: async (params?: { search?: string; type?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ customers: Customer[]; meta: any }>>('/customers', { params });
    return res.data;
  },
  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data!;
  },
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data!;
  },
  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data!;
  },
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
  addNote: async (customerId: string, data: { note: string; type?: string; followUpDate?: string | null }): Promise<CustomerNote> => {
    const res = await api.post<ApiResponse<CustomerNote>>(`/customers/${customerId}/notes`, data);
    return res.data.data!;
  },
  exportCsv: async (): Promise<void> => {
    const res = await api.get('/customers/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
