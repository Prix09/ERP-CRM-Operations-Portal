import { api } from './api';
import { InventoryLog, MovementType, ApiResponse } from '../types';

export const inventoryApi = {
  getLogs: async (params?: { search?: string; productId?: string; type?: MovementType; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ logs: InventoryLog[]; meta: any }>>('/inventory/logs', { params });
    return res.data;
  },
  createMovement: async (data: {
    productId: string;
    warehouseId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    referenceNo?: string | null;
  }): Promise<InventoryLog> => {
    const res = await api.post<ApiResponse<InventoryLog>>('/inventory/movements', data);
    return res.data.data!;
  },
  exportCsvUrl: '/api/v1/inventory/export/csv',
};
