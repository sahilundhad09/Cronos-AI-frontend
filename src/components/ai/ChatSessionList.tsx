import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, Clock } from 'lucide-react';
import { ChatSession } from '@/store/useAIChatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSessionListProps {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    onSelectSession: (session: ChatSession) => void;
    onDeleteSession: (sessionId: string) => void;
    isLoading: boolean;
}

export const ChatSessionList: React.FC<ChatSessionListProps> = ({
    sessions,
    currentSession,
    onSelectSession,
    onDeleteSession,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="py-8 text-center">
                <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    No chat history yet
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="space-y-2 p-2">
                {sessions.map((session) => {
                    const isActive = currentSession?.id === session.id;
                    const lastMessage = session.messages?.[0];

                    return (
                        <div
                            key={session.id}
                            className={`group relative rounded-xl p-3 cursor-pointer transition-all ${isActive
                                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                                    : 'bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-white/10'
                                }`}
                            onClick={() => onSelectSession(session)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isActive
                                        ? 'bg-cyan-500/20 border border-cyan-500/30'
                                        : 'bg-slate-700/50 border border-white/5'
                                    }`}>
                                    <MessageSquare className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'
                                        }`}>
                                        {session.title}
                                    </h4>
                                    {lastMessage && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {lastMessage.content.substring(0, 50)}...
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3 text-slate-600" />
                                        <span className="text-[10px] text-slate-600 uppercase tracking-wider font-black">
                                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSession(session.id);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
};
