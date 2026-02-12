import { create } from 'zustand';
import api from '@/services/api';

export interface Project {
    id: string;
    workspace_id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'completed';
    progress: number;
    created_at: string;
    updated_at: string;
    owner_id: string;
}

interface ProjectState {
    projects: Project[];
    activeProject: Project | null;
    projectMembers: any[];
    projectInvitations: any[];
    projectActivities: any[];
    isLoading: boolean;
    error: string | null;
    fetchProjects: (workspaceId: string) => Promise<void>;
    fetchProjectById: (projectId: string) => Promise<void>;
    createProject: (workspaceId: string, data: { name: string; description?: string }) => Promise<void>;
    setActiveProject: (project: Project | null) => void;
    fetchProjectMembers: (projectId: string) => Promise<void>;
    inviteToProject: (projectId: string, workspaceMemberId: string, role: string) => Promise<void>;
    fetchProjectInvitations: (projectId: string) => Promise<void>;
    acceptProjectInvitation: (projectId: string, invitationId: string) => Promise<void>;
    fetchProjectActivities: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    activeProject: null,
    projectMembers: [],
    projectInvitations: [],
    projectActivities: [],
    isLoading: false,
    error: null,

    fetchProjects: async (workspaceId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/workspaces/${workspaceId}/projects`);
            set({
                projects: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch projects',
                isLoading: false
            });
        }
    },

    fetchProjectById: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/projects/${projectId}`);
            set({
                activeProject: response.data.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch project',
                isLoading: false
            });
        }
    },

    createProject: async (workspaceId: string, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/workspaces/${workspaceId}/projects`, data);
            const newProject = response.data.data;
            set((state) => ({
                projects: [newProject, ...state.projects],
                isLoading: false
            }));
            return newProject;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create project',
                isLoading: false
            });
            throw error;
        }
    },

    setActiveProject: (project) => set({ activeProject: project }),

    fetchProjectMembers: async (projectId: string) => {
        try {
            const response = await api.get(`/projects/${projectId}/members`);
            set({ projectMembers: response.data.data });
        } catch (error: any) {
            console.error('Failed to fetch project members', error);
        }
    },

    inviteToProject: async (projectId, workspaceMemberId, role) => {
        try {
            await api.post(`/projects/${projectId}/invites`, {
                workspace_member_id: workspaceMemberId,
                project_role: role
            });
            // Refresh invitations
            const response = await api.get(`/projects/${projectId}/invites`);
            set({ projectInvitations: response.data.data });
        } catch (error: any) {
            throw error;
        }
    },

    fetchProjectInvitations: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}/invites`);
            set({ projectInvitations: response.data.data });
        } catch (error: any) {
            console.error('Failed to fetch project invitations', error);
        }
    },

    acceptProjectInvitation: async (projectId, invitationId) => {
        try {
            await api.post(`/projects/${projectId}/invites/${invitationId}/accept`);
            // Refresh members and invitations
            const membersRes = await api.get(`/projects/${projectId}/members`);
            const invitesRes = await api.get(`/projects/${projectId}/invites`);
            set({
                projectMembers: membersRes.data.data,
                projectInvitations: invitesRes.data.data
            });
        } catch (error: any) {
            throw error;
        }
    },

    fetchProjectActivities: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}/activity`);
            set({ projectActivities: response.data.data });
        } catch (error: any) {
            console.error('Failed to fetch project activity', error);
        }
    }
}));
