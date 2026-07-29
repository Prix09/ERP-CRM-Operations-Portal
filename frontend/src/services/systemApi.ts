import { api } from './api';
import { Customer, Product, SalesChallan, User, ApiResponse } from '../types';

export interface GlobalSearchResult {
  customers: Array<Pick<Customer, 'id' | 'name' | 'company' | 'email' | 'type'>>;
  products: Array<Pick<Product, 'id' | 'sku' | 'name' | 'price' | 'stock'>>;
  challans: Array<Pick<SalesChallan, 'id' | 'challanNo' | 'status' | 'total' | 'createdAt'>>;
  users: Array<Pick<User, 'id' | 'name' | 'email' | 'role'>>;
}

export const systemApi = {
  globalSearch: async (q: string): Promise<GlobalSearchResult> => {
    const res = await api.get<ApiResponse<GlobalSearchResult>>('/system/search', { params: { q } });
    return res.data.data!;
  },
};
