import { api } from './api';
import { User, Role, ApiResponse } from '../types';

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data.data!;
  },
  createUser: async (data: { name: string; email: string; password: string; role: Role }): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data!;
  },
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data!;
  },
};
