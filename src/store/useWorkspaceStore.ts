import { create } from 'zustand';
import api from '@/services/api';

interface Workspace {
    id: string;
    name: string;
    description: string;
    logo_url?: string;
    role: 'owner' | 'admin' | 'member';
    owner_id: string;
    joined_at: string;
}

interface WorkspaceState {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    isLoading: boolean;
    error: string | null;
    fetchWorkspaces: () => Promise<void>;
    setActiveWorkspace: (id: string) => void;
    createWorkspace: (data: { name: string; description?: string }) => Promise<void>;
    acceptWorkspaceInvitation: (token: string) => Promise<void>;
    declineWorkspaceInvitation: (token: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
    workspaces: [],
    activeWorkspace: null,
    isLoading: false,
    error: null,

    fetchWorkspaces: async () => {
        // Only set loading if we don't have workspaces yet to avoid flickering on every Page change
        if (get().workspaces.length === 0) {
            set({ isLoading: true, error: null });
        }
        try {
            const response = await api.get('/workspaces');
            const workspaces = response.data.data.map((ws: any) => ({
                ...ws,
                role: ws.role || ws.your_role // Normalization
            }));

            set({
                workspaces,
                isLoading: false
            });

            // Set active workspace to the first one if none is active
            if (workspaces.length > 0 && !get().activeWorkspace) {
                set({ activeWorkspace: workspaces[0] });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch workspaces',
                isLoading: false
            });
        }
    },

    setActiveWorkspace: (id) => {
        const workspace = get().workspaces.find(w => w.id === id);
        if (workspace) {
            const normalizedWorkspace = {
                ...workspace,
                role: workspace.role || (workspace as any).your_role
            };
            set({ activeWorkspace: normalizedWorkspace });
            localStorage.setItem('lastActiveWorkspaceId', id);
        }
    },

    createWorkspace: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/workspaces', data);
            const newWorkspace = {
                ...response.data.data,
                role: 'owner'
            };

            set(state => ({
                workspaces: [newWorkspace, ...state.workspaces],
                activeWorkspace: newWorkspace,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create workspace',
                isLoading: false
            });
            throw error;
        }
    },

    acceptWorkspaceInvitation: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/workspaces/invitations/${token}/accept`);
            const newWorkspace = response.data.data;

            set(state => ({
                workspaces: [newWorkspace, ...state.workspaces],
                activeWorkspace: newWorkspace,
                isLoading: false
            }));

            // Refresh workspaces list to be sure
            get().fetchWorkspaces();
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to accept invitation',
                isLoading: false
            });
            throw error;
        }
    },

    declineWorkspaceInvitation: async (token) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/workspaces/invitations/${token}/decline`);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to decline invitation',
                isLoading: false
            });
            throw error;
        }
    }
}));
