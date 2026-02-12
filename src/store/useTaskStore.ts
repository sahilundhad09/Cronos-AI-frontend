import { create } from 'zustand';
import api from '@/services/api';
import { toast } from 'sonner';

export interface Task {
    id: string;
    project_id: string;
    title: string;
    description: string;
    status_id: string; // Refers to task_statuses table
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    position: number;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    assignees?: any[];
    tags?: any[];
}

export interface TaskStatus {
    id: string;
    project_id: string;
    name: string;
    color: string;
    position: number;
}

interface TaskState {
    tasks: Task[];
    statuses: TaskStatus[];
    isLoading: boolean;
    error: string | null;
    fetchProjectTasks: (projectId: string) => Promise<void>;
    fetchProjectStatuses: (projectId: string) => Promise<void>;
    createTask: (projectId: string, data: Partial<Task>) => Promise<void>;
    moveTask: (taskId: string, newStatusId: string, newPosition: number) => Promise<void>;
    updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    assignMembers: (taskId: string, memberIds: string[]) => Promise<void>;
    removeAssignee: (taskId: string, userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    statuses: [],
    isLoading: false,
    error: null,

    fetchProjectTasks: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/projects/${projectId}/tasks`);
            set({ tasks: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch tasks', isLoading: false });
        }
    },

    fetchProjectStatuses: async (projectId: string) => {
        try {
            const response = await api.get(`/projects/${projectId}/statuses`);
            set({ statuses: response.data.data });
        } catch (error: any) {
            console.error('Failed to fetch statuses', error);
        }
    },

    createTask: async (projectId: string, data) => {
        set({ isLoading: true });
        try {
            const response = await api.post(`/projects/${projectId}/tasks`, data);
            const newTask = response.data.data;
            set((state) => ({
                tasks: [...state.tasks, newTask],
                isLoading: false
            }));
            toast.success('Task Created!', {
                description: `"${data.title}" has been added to the board.`,
            });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to create task', isLoading: false });
            toast.error('Failed to Create Task', {
                description: error.response?.data?.message || 'Please try again.',
            });
            throw error;
        }
    },

    moveTask: async (taskId, newStatusId, newPosition) => {
        // Optimistic update
        const previousTasks = get().tasks;
        const updatedTasks = previousTasks.map(t =>
            t.id === taskId ? { ...t, status_id: newStatusId, position: newPosition } : t
        );
        set({ tasks: updatedTasks });

        try {
            await api.patch(`/tasks/${taskId}/move`, {
                status_id: newStatusId,
                position: newPosition
            });
        } catch (error) {
            // Rollback on error
            set({ tasks: previousTasks });
            console.error('Failed to move task', error);
        }
    },

    updateTask: async (taskId, data) => {
        try {
            const response = await api.put(`/tasks/${taskId}`, data);
            const updatedTask = response.data.data;
            set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
            }));
            toast.success('Task Updated!', {
                description: 'Task has been updated successfully.',
            });
        } catch (error: any) {
            console.error('Failed to update task', error);
            toast.error('Failed to Update Task', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    },

    deleteTask: async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            set((state) => ({
                tasks: state.tasks.filter(t => t.id !== taskId)
            }));
            toast.success('Task Deleted!', {
                description: 'Task has been removed from the board.',
            });
        } catch (error: any) {
            console.error('Failed to delete task', error);
            toast.error('Failed to Delete Task', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    },

    assignMembers: async (taskId, memberIds) => {
        try {
            const response = await api.post(`/tasks/${taskId}/assignees`, {
                project_member_ids: memberIds
            });
            const updatedTask = response.data.data;
            set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
            }));
            toast.success('Members Assigned!', {
                description: 'Team members have been assigned to the task.',
            });
        } catch (error: any) {
            console.error('Failed to assign members', error);
            toast.error('Failed to Assign Members', {
                description: error.response?.data?.message || 'Please try again.',
            });
            throw error;
        }
    },

    removeAssignee: async (taskId, userId) => {
        try {
            await api.delete(`/tasks/${taskId}/assignees/${userId}`);
            // Fetch updated task to be sure
            const response = await api.get(`/tasks/${taskId}`);
            const updatedTask = response.data.data;
            set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
            }));
        } catch (error: any) {
            console.error('Failed to remove assignee', error);
            throw error;
        }
    }
}));
