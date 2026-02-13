import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            setAuth: (user, accessToken, refreshToken) => {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, isAuthenticated: true, accessToken, refreshToken });
            },
            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
            },
            updateUser: (updatedUser: Partial<User>) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedUser } : null,
                })),
            updateProfile: async (data: Partial<User>) => {
                const response = await api.put('/auth/profile', data);
                get().updateUser(response.data.data);
            },
            changePassword: async (currentPassword, newPassword) => {
                await api.post('/auth/change-password', { currentPassword, newPassword });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
