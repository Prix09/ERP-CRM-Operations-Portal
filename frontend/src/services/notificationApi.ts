import { api } from './api';
import { NotificationItem, ApiResponse } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<{ notifications: NotificationItem[]; unreadCount: number }> => {
    const res = await api.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications');
    return { notifications: res.data.data?.notifications || [], unreadCount: res.data.data?.unreadCount || 0 };
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
