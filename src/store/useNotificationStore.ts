import { create } from 'zustand';
import api from '@/services/api';

export interface Notification {
    id: string;
    user_id: string;
    type: 'task_assigned' | 'comment_mention' | 'workspace_invite' | 'project_invite' | 'project_invite_accepted' | 'task_due' | 'project_update';
    title: string;
    message: string;
    is_read: boolean;
    meta: any;
    created_at: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/notifications');
            set({
                notifications: response.data.data.notifications,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Failed to fetch notifications', error);
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            set({ unreadCount: response.data.data.unreadCount });
        } catch (error: any) {
            console.error('Failed to fetch unread count', error);
        }
    },

    markAsRead: async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error: any) {
            console.error('Failed to mark notification as read', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.patch('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        } catch (error: any) {
            console.error('Failed to mark all as read', error);
        }
    }
}));
