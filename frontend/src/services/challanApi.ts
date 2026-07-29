import { api } from './api';
import { SalesChallan, ChallanStatus, ApiResponse } from '../types';

export const challanApi = {
  getChallans: async (params?: { search?: string; status?: ChallanStatus; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ challans: SalesChallan[]; meta: any }>>('/challans', { params });
    return res.data;
  },
  getChallanById: async (id: string): Promise<SalesChallan> => {
    const res = await api.get<ApiResponse<SalesChallan>>(`/challans/${id}`);
    return res.data.data!;
  },
  createChallan: async (data: {
    customerId: string;
    notes?: string | null;
    tax?: number;
    status?: ChallanStatus;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<SalesChallan> => {
    const res = await api.post<ApiResponse<SalesChallan>>('/challans', data);
    return res.data.data!;
  },
  
  downloadPDF: async (id: string): Promise<void> => {
    const res = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `challan-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
  updateStatus: async (id: string, status: ChallanStatus): Promise<SalesChallan> => {
    const res = await api.patch<ApiResponse<SalesChallan>>(`/challans/${id}/status`, { status });
    return res.data.data!;
  },

};
