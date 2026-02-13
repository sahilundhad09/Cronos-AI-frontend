import { create } from 'zustand';
import api from '@/services/api';
import { toast } from 'sonner';

export interface ChatMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface ChatSession {
    id: string;
    workspace_id: string;
    project_id: string;
    created_by: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages?: ChatMessage[];
}

interface AIChatState {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    messages: ChatMessage[];
    isLoading: boolean;
    isSending: boolean;
    error: string | null;

    // Actions
    sendMessage: (projectId: string, message: string, sessionId?: string) => Promise<void>;
    loadSessions: (projectId: string) => Promise<void>;
    loadSessionHistory: (sessionId: string) => Promise<void>;
    setCurrentSession: (session: ChatSession | null) => void;
    createNewSession: () => void;
    deleteSession: (sessionId: string) => Promise<void>;
    clearError: () => void;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
    sessions: [],
    currentSession: null,
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,

    sendMessage: async (projectId: string, message: string, sessionId?: string) => {
        set({ isSending: true, error: null });
        try {
            console.log('💬 Sending message:', { projectId, message, sessionId });
            const response = await api.post(`/projects/${projectId}/ai/chat`, {
                message,
                session_id: sessionId
            });

            console.log('✅ Message response:', response.data);
            const { session_id, user_message, ai_message } = response.data.data;

            // Add messages to current chat
            set((state) => ({
                messages: [...state.messages, user_message, ai_message],
                isSending: false,
                currentSession: state.currentSession || {
                    id: session_id,
                    project_id: projectId,
                    title: message.substring(0, 50),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    workspace_id: '',
                    created_by: ''
                }
            }));

            // Reload sessions to update list
            console.log('🔄 Reloading sessions...');
            await get().loadSessions(projectId);

        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to send message';
            set({ error: message, isSending: false });
            console.error('❌ Send message error:', error);
            toast.error('Chat Error', {
                description: message,
            });
            throw error;
        }
    },

    loadSessions: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            console.log('📚 Loading sessions for project:', projectId);
            const response = await api.get(`/projects/${projectId}/ai/chat/sessions`);
            console.log('📋 Full response:', response);
            console.log('📋 Response data:', response.data);

            // Handle different response structures
            let sessions = [];
            if (response.data.data && response.data.data.sessions) {
                sessions = response.data.data.sessions;
            } else if (response.data.sessions) {
                sessions = response.data.sessions;
            } else if (Array.isArray(response.data.data)) {
                sessions = response.data.data;
            } else if (Array.isArray(response.data)) {
                sessions = response.data;
            }

            console.log('✅ Parsed sessions:', sessions.length, 'sessions found');
            console.log('📝 Sessions array:', sessions);

            set({
                sessions: sessions,
                isLoading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load chat sessions';
            set({ error: message, isLoading: false });
            console.error('❌ Failed to load sessions:', error);
            console.error('❌ Error response:', error.response?.data);
        }
    },

    loadSessionHistory: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/ai/chat/sessions/${sessionId}`);
            const { session, messages } = response.data.data;

            set({
                currentSession: session,
                messages: messages || [],
                isLoading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to load chat history';
            set({ error: message, isLoading: false });
            toast.error('Load Error', {
                description: message,
            });
        }
    },

    setCurrentSession: (session: ChatSession | null) => {
        set({ currentSession: session, messages: [] });
        if (session) {
            get().loadSessionHistory(session.id);
        }
    },

    createNewSession: () => {
        set({ currentSession: null, messages: [] });
    },

    deleteSession: async (sessionId: string) => {
        try {
            await api.delete(`/ai/chat/sessions/${sessionId}`);

            set((state) => ({
                sessions: state.sessions.filter(s => s.id !== sessionId),
                currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
                messages: state.currentSession?.id === sessionId ? [] : state.messages
            }));

            toast.success('Session Deleted', {
                description: 'Chat session has been removed.',
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete session';
            toast.error('Delete Error', {
                description: message,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
