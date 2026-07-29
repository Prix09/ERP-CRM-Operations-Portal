import { api } from './api';
import { Product, Category, Warehouse, ApiResponse } from '../types';

export const productApi = {
  getProducts: async (params?: { search?: string; categoryId?: string; warehouseId?: string; lowStock?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ products: Product[]; meta: any }>>('/products', { params });
    return res.data;
  },
  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data!;
  },
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data.data!;
  },
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<ApiResponse<{ imageUrl: string }>>('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data!.imageUrl;
  },
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data!;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<ApiResponse<Category[]>>('/products/meta/categories');
    return res.data.data!;
  },
  getWarehouses: async (): Promise<Warehouse[]> => {
    const res = await api.get<ApiResponse<Warehouse[]>>('/products/meta/warehouses');
    return res.data.data!;
  },
  exportCsv: async (): Promise<void> => {
    const res = await api.get('/products/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  addStockMovement: async (productId: string, data: { type: string; quantity: number; reason: string }): Promise<any> => {
    const res = await api.post(`/products/${productId}/movement`, data);
    return res.data;
  },
  updateStockMovement: async (productId: string, movementId: string, data: { type: string; quantity: number; reason: string }): Promise<any> => {
    const res = await api.put(`/products/${productId}/movement/${movementId}`, data);
    return res.data;
  },
};
