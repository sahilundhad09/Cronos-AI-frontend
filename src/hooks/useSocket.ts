import { useEffect, useRef } from 'react';
import { getSocket, joinProject, leaveProject, disconnectSocket, onSocketEvent } from '@/services/socket';
import { useTaskStore } from '@/store/useTaskStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { toast } from 'sonner';

/**
 * Hook to manage socket connection and listen for real-time task events for a project
 */
export function useProjectSocket(projectId: string | null | undefined) {
    const prevProjectId = useRef<string | null>(null);
    const fetchProjectTasks = useTaskStore((s) => s.fetchProjectTasks);

    useEffect(() => {
        if (!projectId) return;

        const socket = getSocket();
        if (!socket) return;

        // Leave previous project room
        if (prevProjectId.current && prevProjectId.current !== projectId) {
            leaveProject(prevProjectId.current);
        }

        // Join new project room
        joinProject(projectId);
        prevProjectId.current = projectId;

        // Listen for task events
        const unsubCreated = onSocketEvent('task:created', (_task: any) => {
            // Refresh the full task list to get correct positions
            fetchProjectTasks(projectId);
            toast.info('New Task Created', {
                description: `"${_task.title}" was added to the board.`,
            });
        });

        const unsubUpdated = onSocketEvent('task:updated', (_task: any) => {
            fetchProjectTasks(projectId);
            toast.info('Task Updated', {
                description: `"${_task.title}" was updated.`,
            });
        });

        const unsubMoved = onSocketEvent('task:moved', () => {
            fetchProjectTasks(projectId);
        });

        const unsubDeleted = onSocketEvent('task:deleted', () => {
            fetchProjectTasks(projectId);
            toast.info('Task Deleted', {
                description: 'A task was removed from the board.',
            });
        });

        return () => {
            unsubCreated();
            unsubUpdated();
            unsubMoved();
            unsubDeleted();
            if (projectId) leaveProject(projectId);
        };
    }, [projectId, fetchProjectTasks]);
}

/**
 * Hook to listen for real-time notifications
 */
export function useNotificationSocket() {
    const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const unsub = onSocketEvent('notification:new', (notification: any) => {
            fetchNotifications();
            fetchUnreadCount();
            toast.info(notification.title || 'New Notification', {
                description: notification.message || 'You have a new notification.',
            });
        });

        return () => {
            unsub();
        };
    }, [fetchNotifications, fetchUnreadCount]);
}

/**
 * Hook to initialize socket connection on app mount and disconnect on logout
 */
export function useSocketInit() {
    useEffect(() => {
        // Initialize socket connection
        getSocket();

        return () => {
            disconnectSocket();
        };
    }, []);
}
