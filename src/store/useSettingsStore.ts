import { create } from 'zustand';
import api from '@/services/api';
import { toast } from 'sonner';

// Types
export interface Project {
    id: string;
    workspace_id: string;
    name: string;
    description: string | null;
    color: string | null;
    start_date: string | null;
    end_date: string | null;
    archived: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    settings?: Record<string, any>;
}

export interface Workspace {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    settings?: Record<string, any>;
}

export interface ProjectMember {
    id: string;
    project_id: string;
    workspace_member_id: string;
    project_role: 'lead' | 'member' | 'viewer';
    joined_at: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar_url?: string;
    };
}

export interface WorkspaceMember {
    id: string;
    workspace_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar_url?: string;
    };
}

export interface Label {
    id: string;
    project_id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface TaskStatus {
    id: string;
    project_id: string;
    name: string;
    color: string;
    position: number;
    created_at: string;
}

export interface Invitation {
    id: string;
    workspace_id: string;
    email: string;
    role: 'admin' | 'member';
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    token: string;
    invited_by: string;
    created_at: string;
    expires_at: string;
}

interface SettingsState {
    // Project settings
    currentProject: Project | null;
    projectMembers: ProjectMember[];
    projectLabels: Label[];
    projectStatuses: TaskStatus[];

    // Workspace settings
    currentWorkspace: Workspace | null;
    workspaceMembers: WorkspaceMember[];
    workspaceInvitations: Invitation[];

    // Loading states
    loadingStates: {
        project: boolean;
        workspace: boolean;
        members: boolean;
        labels: boolean;
        statuses: boolean;
        invitations: boolean;
    };
    isSaving: boolean;
    error: string | null;

    // Project actions
    loadProjectSettings: (projectId: string) => Promise<void>;
    updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
    archiveProject: (projectId: string, archived: boolean) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;

    // Workspace actions
    loadWorkspaceSettings: (workspaceId: string) => Promise<void>;
    updateWorkspace: (workspaceId: string, data: Partial<Workspace>) => Promise<void>;
    deleteWorkspace: (workspaceId: string) => Promise<void>;

    // Project member actions
    loadProjectMembers: (projectId: string) => Promise<void>;
    addProjectMember: (projectId: string, workspaceMemberId: string, role: string) => Promise<void>;
    updateProjectMemberRole: (projectId: string, memberId: string, role: string) => Promise<void>;
    removeProjectMember: (projectId: string, memberId: string) => Promise<void>;

    // Workspace member actions
    loadWorkspaceMembers: (workspaceId: string) => Promise<void>;
    inviteWorkspaceMember: (workspaceId: string, email: string, role: string) => Promise<void>;
    updateWorkspaceMemberRole: (workspaceId: string, memberId: string, role: string) => Promise<void>;
    removeWorkspaceMember: (workspaceId: string, memberId: string) => Promise<void>;
    loadWorkspaceInvitations: (workspaceId: string) => Promise<void>;
    cancelInvitation: (workspaceId: string, invitationId: string) => Promise<void>;

    // Label actions
    loadProjectLabels: (projectId: string) => Promise<void>;
    createLabel: (projectId: string, name: string, color: string) => Promise<void>;
    updateLabel: (projectId: string, labelId: string, name: string, color: string) => Promise<void>;
    deleteLabel: (projectId: string, labelId: string) => Promise<void>;

    // Status actions
    loadProjectStatuses: (projectId: string) => Promise<void>;
    createStatus: (projectId: string, name: string, color: string, position?: number) => Promise<void>;
    updateStatus: (projectId: string, statusId: string, name: string, color: string, position?: number) => Promise<void>;
    deleteStatus: (projectId: string, statusId: string, moveTasksToStatusId?: string) => Promise<void>;

    // Utility
    clearError: () => void;
    reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    // Initial state
    currentProject: null,
    projectMembers: [],
    projectLabels: [],
    projectStatuses: [],
    currentWorkspace: null,
    workspaceMembers: [],
    workspaceInvitations: [],
    loadingStates: {
        project: false,
        workspace: false,
        members: false,
        labels: false,
        statuses: false,
        invitations: false,
    },
    isSaving: false,
    error: null,

    // Project actions
    loadProjectSettings: async (projectId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, project: true },
            error: null
        }));
        try {
            const response = await api.get(`/projects/${projectId}`);
            set((state) => ({
                currentProject: response.data.data,
                loadingStates: { ...state.loadingStates, project: false }
            }));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load project settings';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, project: false }
            }));
            toast.error('Load Error', { description: message });
        }
    },

    updateProject: async (projectId: string, data: Partial<Project>) => {
        set({ isSaving: true, error: null });
        try {
            const response = await api.put(`/projects/${projectId}`, data);
            set({
                currentProject: response.data.data,
                isSaving: false
            });
            toast.success('Project Updated', {
                description: 'Project settings have been saved successfully.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update project';
            set({ error: message, isSaving: false });
            toast.error('Update Error', { description: message });
            throw error;
        }
    },

    archiveProject: async (projectId: string, archived: boolean) => {
        set({ isSaving: true, error: null });
        try {
            const response = await api.patch(`/projects/${projectId}/archive`, { archived });
            set({
                currentProject: response.data.data,
                isSaving: false
            });
            toast.success(archived ? 'Project Archived' : 'Project Unarchived', {
                description: archived ? 'Project has been archived.' : 'Project has been restored.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to archive project';
            set({ error: message, isSaving: false });
            toast.error('Archive Error', { description: message });
            throw error;
        }
    },

    deleteProject: async (projectId: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.delete(`/projects/${projectId}`);
            set({ currentProject: null, isSaving: false });
            toast.success('Project Deleted', {
                description: 'Project has been permanently deleted.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete project';
            set({ error: message, isSaving: false });
            toast.error('Delete Error', { description: message });
            throw error;
        }
    },

    // Workspace actions
    loadWorkspaceSettings: async (workspaceId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, workspace: true },
            error: null
        }));
        try {
            const response = await api.get(`/workspaces/${workspaceId}`);
            set((state) => ({
                currentWorkspace: response.data.data,
                loadingStates: { ...state.loadingStates, workspace: false }
            }));
            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load workspace settings';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, workspace: false }
            }));
            toast.error('Load Error', { description: message });
            return null;
        }
    },

    updateWorkspace: async (workspaceId: string, data: Partial<Workspace>) => {
        set({ isSaving: true, error: null });
        try {
            const response = await api.put(`/workspaces/${workspaceId}`, data);
            set({
                currentWorkspace: response.data.data,
                isSaving: false
            });
            toast.success('Workspace Updated', {
                description: 'Workspace settings have been saved successfully.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update workspace';
            set({ error: message, isSaving: false });
            toast.error('Update Error', { description: message });
            throw error;
        }
    },

    deleteWorkspace: async (workspaceId: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.delete(`/workspaces/${workspaceId}`);
            set({ currentWorkspace: null, isSaving: false });
            toast.success('Workspace Deleted', {
                description: 'Workspace has been permanently deleted.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete workspace';
            set({ error: message, isSaving: false });
            toast.error('Delete Error', { description: message });
            throw error;
        }
    },

    // Project member actions
    loadProjectMembers: async (projectId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, members: true },
            error: null
        }));
        try {
            const response = await api.get(`/projects/${projectId}/members`);
            set((state) => ({
                projectMembers: response.data.data || [],
                loadingStates: { ...state.loadingStates, members: false }
            }));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load project members';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, members: false }
            }));
            toast.error('Load Error', { description: message });
        }
    },

    addProjectMember: async (projectId: string, workspaceMemberId: string, role: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.post(`/projects/${projectId}/members`, {
                workspace_member_id: workspaceMemberId,
                project_role: role
            });
            await get().loadProjectMembers(projectId);
            set({ isSaving: false });
            toast.success('Member Added', {
                description: 'Member has been added to the project.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add member';
            set({ error: message, isSaving: false });
            toast.error('Add Error', { description: message });
            throw error;
        }
    },

    updateProjectMemberRole: async (projectId: string, memberId: string, role: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.put(`/projects/${projectId}/members/${memberId}`, {
                project_role: role
            });
            await get().loadProjectMembers(projectId);
            set({ isSaving: false });
            toast.success('Role Updated', {
                description: 'Member role has been updated.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update role';
            set({ error: message, isSaving: false });
            toast.error('Update Error', { description: message });
            throw error;
        }
    },

    removeProjectMember: async (projectId: string, memberId: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.delete(`/projects/${projectId}/members/${memberId}`);
            await get().loadProjectMembers(projectId);
            set({ isSaving: false });
            toast.success('Member Removed', {
                description: 'Member has been removed from the project.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to remove member';
            set({ error: message, isSaving: false });
            toast.error('Remove Error', { description: message });
            throw error;
        }
    },

    // Workspace member actions
    loadWorkspaceMembers: async (workspaceId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, members: true },
            error: null
        }));
        try {
            const response = await api.get(`/workspaces/${workspaceId}/members`);
            set((state) => ({
                workspaceMembers: response.data.data || [],
                loadingStates: { ...state.loadingStates, members: false }
            }));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load workspace members';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, members: false }
            }));
            toast.error('Load Error', { description: message });
        }
    },

    inviteWorkspaceMember: async (workspaceId: string, email: string, role: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.post(`/workspaces/${workspaceId}/invitations`, { email, role });
            await get().loadWorkspaceInvitations(workspaceId);
            set({ isSaving: false });
            toast.success('Invitation Sent', {
                description: `Invitation sent to ${email}.`
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to send invitation';
            set({ error: message, isSaving: false });
            toast.error('Invitation Error', { description: message });
            throw error;
        }
    },

    updateWorkspaceMemberRole: async (workspaceId: string, memberId: string, role: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.put(`/workspaces/${workspaceId}/members/${memberId}`, { role });
            await get().loadWorkspaceMembers(workspaceId);
            set({ isSaving: false });
            toast.success('Role Updated', {
                description: 'Member role has been updated.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update role';
            set({ error: message, isSaving: false });
            toast.error('Update Error', { description: message });
            throw error;
        }
    },

    removeWorkspaceMember: async (workspaceId: string, memberId: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
            await get().loadWorkspaceMembers(workspaceId);
            set({ isSaving: false });
            toast.success('Member Removed', {
                description: 'Member has been removed from the workspace.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to remove member';
            set({ error: message, isSaving: false });
            toast.error('Remove Error', { description: message });
            throw error;
        }
    },

    loadWorkspaceInvitations: async (workspaceId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, invitations: true },
            error: null
        }));
        try {
            const response = await api.get(`/workspaces/${workspaceId}/invitations`);
            set((state) => ({
                workspaceInvitations: response.data.data || [],
                loadingStates: { ...state.loadingStates, invitations: false }
            }));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load invitations';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, invitations: false }
            }));
            toast.error('Load Error', { description: message });
        }
    },

    cancelInvitation: async (workspaceId: string, invitationId: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
            await get().loadWorkspaceInvitations(workspaceId);
            set({ isSaving: false });
            toast.success('Invitation Cancelled', {
                description: 'Invitation has been cancelled.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to cancel invitation';
            set({ error: message, isSaving: false });
            toast.error('Cancel Error', { description: message });
            throw error;
        }
    },

    // Label actions
    loadProjectLabels: async (projectId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, labels: true },
            error: null
        }));
        try {
            const response = await api.get(`/projects/${projectId}/labels`);
            set((state) => ({
                projectLabels: response.data.data || [],
                loadingStates: { ...state.loadingStates, labels: false }
            }));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load labels';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, labels: false }
            }));
            toast.error('Load Error', { description: message });
        }
    },

    createLabel: async (projectId: string, name: string, color: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.post(`/projects/${projectId}/labels`, { name, color });
            await get().loadProjectLabels(projectId);
            set({ isSaving: false });
            toast.success('Label Created', {
                description: `Label "${name}" has been created.`
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create label';
            set({ error: message, isSaving: false });
            toast.error('Create Error', { description: message });
            throw error;
        }
    },

    updateLabel: async (projectId: string, labelId: string, name: string, color: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.put(`/projects/${projectId}/labels/${labelId}`, { name, color });
            await get().loadProjectLabels(projectId);
            set({ isSaving: false });
            toast.success('Label Updated', {
                description: 'Label has been updated.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update label';
            set({ error: message, isSaving: false });
            toast.error('Update Error', { description: message });
            throw error;
        }
    },

    deleteLabel: async (projectId: string, labelId: string) => {
        set({ isSaving: true, error: null });
        try {
            await api.delete(`/projects/${projectId}/labels/${labelId}`);
            await get().loadProjectLabels(projectId);
            set({ isSaving: false });
            toast.success('Label Deleted', {
                description: 'Label has been deleted.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete label';
            set({ error: message, isSaving: false });
            toast.error('Delete Error', { description: message });
            throw error;
        }
    },

    // Status actions
    loadProjectStatuses: async (projectId: string) => {
        set((state) => ({
            loadingStates: { ...state.loadingStates, statuses: true },
            error: null
        }));
        try {
            const response = await api.get(`/projects/${projectId}/statuses`);
            set((state) => ({
                projectStatuses: response.data.data || [],
                loadingStates: { ...state.loadingStates, statuses: false }
            }));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load statuses';
            set((state) => ({
                error: message,
                loadingStates: { ...state.loadingStates, statuses: false }
            }));
            toast.error('Load Error', { description: message });
        }
    },

    createStatus: async (projectId: string, name: string, color: string, position?: number) => {
        set({ isSaving: true, error: null });
        try {
            await api.post(`/projects/${projectId}/statuses`, { name, color, position });
            await get().loadProjectStatuses(projectId);
            set({ isSaving: false });
            toast.success('Status Created', {
                description: `Status "${name}" has been created.`
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create status';
            set({ error: message, isSaving: false });
            toast.error('Create Error', { description: message });
            throw error;
        }
    },

    updateStatus: async (projectId: string, statusId: string, name: string, color: string, position?: number) => {
        set({ isSaving: true, error: null });
        try {
            await api.put(`/projects/${projectId}/statuses/${statusId}`, { name, color, position });
            await get().loadProjectStatuses(projectId);
            set({ isSaving: false });
            toast.success('Status Updated', {
                description: 'Status has been updated.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update status';
            set({ error: message, isSaving: false });
            toast.error('Update Error', { description: message });
            throw error;
        }
    },

    deleteStatus: async (projectId: string, statusId: string, moveTasksToStatusId?: string) => {
        set({ isSaving: true, error: null });
        try {
            const params = moveTasksToStatusId ? { move_tasks_to_status_id: moveTasksToStatusId } : {};
            await api.delete(`/projects/${projectId}/statuses/${statusId}`, { params });
            await get().loadProjectStatuses(projectId);
            set({ isSaving: false });
            toast.success('Status Deleted', {
                description: 'Status has been deleted.'
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete status';
            set({ error: message, isSaving: false });
            toast.error('Delete Error', { description: message });
            throw error;
        }
    },

    // Utility
    clearError: () => set({ error: null }),
    reset: () => set({
        currentProject: null,
        projectMembers: [],
        projectLabels: [],
        projectStatuses: [],
        currentWorkspace: null,
        workspaceMembers: [],
        workspaceInvitations: [],
        loadingStates: {
            project: false,
            workspace: false,
            members: false,
            labels: false,
            statuses: false,
            invitations: false,
        },
        isSaving: false,
        error: null
    })
}));
