import { api } from './api';
import { User, ApiResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    return res.data.data!;
  },
  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', { name, email, password });
    return res.data.data!;
  },
  forgotPassword: async (email: string): Promise<string> => {
    const res = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data.message;
  },
  me: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    const res = await api.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword });
    return res.data.message;
  },
};
