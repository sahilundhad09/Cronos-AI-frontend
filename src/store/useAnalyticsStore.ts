import { create } from 'zustand';
import api from '@/services/api';
import { toast } from 'sonner';

interface TaskStats {
    total: number;
    completed: number;
    byStatus: Record<string, number>;
    byPriority: { low: number; medium: number; high: number; urgent: number };
    overdue: number;
    completionRate: number;
}

interface AssigneeWorkload {
    member: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
    taskCount: number;
    completedCount: number;
}

interface BurndownPoint {
    date: string;
    completed: number;
    remaining: number;
}

interface ProjectAnalytics {
    taskStats: TaskStats;
    assigneeWorkload: AssigneeWorkload[];
    burndownData: BurndownPoint[];
    recentActivity: any[];
}

interface WorkspaceAnalytics {
    projectCount: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    statusBreakdown: { todo: number; inProgress: number; done: number };
    memberCount: number;
    recentActivity: any[];
}

interface UserPerformance {
    tasksAssigned: number;
    tasksCompleted: number;
    completionRate: number;
    onTimeDelivery: number;
    averageCompletionTime: number;
    tasksByPriority: { low: number; medium: number; high: number; urgent: number };
    recentTasks: any[];
    pendingTasks: any[];
}

interface AIAnalysis {
    analysis: string;
    stats: WorkspaceAnalytics;
    generated_at: string;
}

interface GrowthVelocity {
    week: string;
    completed: number;
    label: string;
}

interface IndividualGrowth {
    velocity: GrowthVelocity[];
    focusArea: { todo: number; inProgress: number; done: number };
    consistency: { streak: number; totalActiveDays: number; activeDays: string[] };
    performance: { onTimeRate: number; avgCompletionDays: number };
}

interface MemberGrowth {
    id: string;
    name: string;
    avatar_url: string | null;
    email: string;
    role: string;
    metrics: {
        completedTasks: number;
        velocity: number;
        streak: number;
        onTimeRate: number;
    };
}

interface ProjectMemberGrowth {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
    metrics: {
        assigned: number;
        completed: number;
        completionRate: number;
    };
}

interface AnalyticsState {
    projectAnalytics: ProjectAnalytics | null;
    workspaceAnalytics: WorkspaceAnalytics | null;
    userPerformance: UserPerformance | null;
    aiAnalysis: AIAnalysis | null;
    individualGrowth: IndividualGrowth | null;
    workspaceGrowth: MemberGrowth[] | null;
    projectGrowth: ProjectMemberGrowth[] | null;
    isLoading: boolean;
    isAnalyzing: boolean;
    error: string | null;

    fetchProjectAnalytics: (projectId: string) => Promise<void>;
    fetchWorkspaceAnalytics: (workspaceId: string) => Promise<void>;
    fetchUserPerformance: () => Promise<void>;
    analyzeWorkspace: (workspaceId: string) => Promise<void>;
    fetchIndividualGrowth: (workspaceId?: string) => Promise<void>;
    fetchWorkspaceGrowth: (workspaceId: string) => Promise<void>;
    fetchProjectGrowth: (projectId: string) => Promise<void>;
    clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
    projectAnalytics: null,
    workspaceAnalytics: null,
    userPerformance: null,
    aiAnalysis: null,
    individualGrowth: null,
    workspaceGrowth: null,
    projectGrowth: null,
    isLoading: false,
    isAnalyzing: false,
    error: null,

    fetchProjectAnalytics: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/projects/${projectId}/analytics`);
            set({ projectAnalytics: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch project analytics', isLoading: false });
        }
    },

    fetchWorkspaceAnalytics: async (workspaceId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/workspaces/${workspaceId}/analytics`);
            set({ workspaceAnalytics: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch workspace analytics', isLoading: false });
        }
    },

    fetchUserPerformance: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/users/me/performance');
            set({ userPerformance: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch performance metrics', isLoading: false });
        }
    },

    analyzeWorkspace: async (workspaceId: string) => {
        set({ isAnalyzing: true, error: null });
        try {
            const response = await api.get(`/workspaces/${workspaceId}/analyze`);
            set({ aiAnalysis: response.data.data, isAnalyzing: false });
            toast.success('AI Analysis Complete', {
                description: 'Workspace has been analyzed successfully.',
            });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to analyze workspace', isAnalyzing: false });
            toast.error('Analysis Failed', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    },

    fetchIndividualGrowth: async (workspaceId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const url = workspaceId 
                ? `/analytics/growth/me?workspaceId=${workspaceId}`
                : '/analytics/growth/me';
            const response = await api.get(url);
            set({ individualGrowth: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch growth metrics', isLoading: false });
        }
    },

    fetchWorkspaceGrowth: async (workspaceId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/workspaces/${workspaceId}/analytics/growth`);
            set({ workspaceGrowth: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch workspace growth', isLoading: false });
        }
    },

    fetchProjectGrowth: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/projects/${projectId}/analytics/growth`);
            set({ projectGrowth: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch project growth', isLoading: false });
        }
    },

    clearAnalytics: () => set({
        projectAnalytics: null,
        workspaceAnalytics: null,
        userPerformance: null,
        aiAnalysis: null,
        individualGrowth: null,
        workspaceGrowth: null,
        projectGrowth: null,
        error: null
    }),
}));
