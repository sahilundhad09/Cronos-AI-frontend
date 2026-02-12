import { create } from 'zustand';
import api from '@/services/api';
import { toast } from 'sonner';

export interface AIGeneration {
    id: string;
    project_id: string;
    prompt: string;
    generated_tasks: any[];
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

interface AIState {
    generations: AIGeneration[];
    isGenerating: boolean;
    error: string | null;
    generateTasks: (projectId: string, description: string, count?: number) => Promise<AIGeneration>;
    acceptGeneration: (projectId: string, generationId: string, taskIndices?: number[]) => Promise<void>;
    fetchGenerations: (projectId: string) => Promise<void>;
}

export const useAIStore = create<AIState>((set) => ({
    generations: [],
    isGenerating: false,
    error: null,

    fetchGenerations: async (projectId: string) => {
        try {
            const response = await api.get(`/projects/${projectId}/ai/generations`);
            set({ generations: response.data.data });
        } catch (error: any) {
            console.error('Failed to fetch AI generations', error);
        }
    },

    generateTasks: async (projectId: string, prompt: string, count?: number) => {
        set({ isGenerating: true, error: null });
        try {
            const response = await api.post(`/projects/${projectId}/ai/generate-tasks`, {
                prompt,
                count: count || 8
            });
            const newGen = response.data.data;
            set((state) => ({
                generations: [newGen, ...state.generations],
                isGenerating: false
            }));
            toast.success('Tasks Generated!', {
                description: `AI created ${newGen.generated_tasks.length} tasks. Review and deploy them to your board.`,
                duration: 5000,
            });
            return newGen;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Neural engine failure. Transmission interrupted.';
            set({ error: message, isGenerating: false });
            toast.error('Task Generation Failed', {
                description: message,
                duration: 6000,
            });
            throw error;
        }
    },

    acceptGeneration: async (projectId, generationId, task_indices) => {
        set({ isGenerating: true });
        try {
            // Find the generation to get task count if indices not provided
            const generation = useAIStore.getState().generations.find(g => g.id === generationId);
            const indices = task_indices || (generation ? generation.generated_tasks.map((_, i) => i) : []);

            await api.post(`/projects/${projectId}/ai/generations/${generationId}/accept`, {
                task_indices: indices
            });
            set((state) => ({
                generations: state.generations.map(g =>
                    g.id === generationId ? { ...g, status: 'accepted' } : g
                ),
                isGenerating: false
            }));
            toast.success('Tasks Deployed!', {
                description: `${indices.length} AI-generated tasks have been added to your Kanban board.`,
                duration: 5000,
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to initialize tasks.';
            set({ error: message, isGenerating: false });
            toast.error('Deployment Failed', {
                description: message,
            });
            throw error;
        }
    },
}));
