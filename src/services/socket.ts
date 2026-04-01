import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

/**
 * Get or create the socket connection (singleton)
 */
export function getSocket(): Socket | null {
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;

    const currentToken = socket?.auth && (socket.auth as any).token;
    
    // If socket exists but token has changed, disconnect it to force a new one
    if (socket && currentToken !== token) {
        console.log('🔌 Auth token changed, recreating socket connection...');
        socket.disconnect();
        socket = null;
    }

    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
        console.error('🔌 Socket connection error:', err.message);
        
        // If authentication fails, disconnect and wait for a new token
        if (err.message === 'Authentication required' || 
            err.message === 'Invalid token' || 
            err.message === 'Token expired' ||
            err.message === 'jwt expired') {
            console.warn('🔌 Authentication error, disconnecting socket...');
            socket?.disconnect();
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
}

/**
 * Disconnect the socket (call on logout)
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

/**
 * Join a project room to receive real-time task updates
 */
export function joinProject(projectId: string) {
    const s = getSocket();
    if (s) {
        s.emit('join:project', projectId);
    }
}

/**
 * Leave a project room
 */
export function leaveProject(projectId: string) {
    const s = getSocket();
    if (s) {
        s.emit('leave:project', projectId);
    }
}

/**
 * Join a workspace room
 */
export function joinWorkspace(workspaceId: string) {
    const s = getSocket();
    if (s) {
        s.emit('join:workspace', workspaceId);
    }
}

/**
 * Leave a workspace room
 */
export function leaveWorkspace(workspaceId: string) {
    const s = getSocket();
    if (s) {
        s.emit('leave:workspace', workspaceId);
    }
}

/**
 * Subscribe to a socket event
 */
export function onSocketEvent(event: string, callback: (...args: any[]) => void) {
    const s = getSocket();
    if (s) {
        s.on(event, callback);
    }
    return () => {
        if (s) {
            s.off(event, callback);
        }
    };
}
