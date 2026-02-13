import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser
                ? 'bg-cyan-500/20 border border-cyan-500/30'
                : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10'
                }`}>
                {isUser ? (
                    <User className="h-4 w-4 text-cyan-400" />
                ) : (
                    <Brain className="h-4 w-4 text-purple-400" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 ${isUser
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'bg-slate-800/50 border border-white/5'
                    }`}>
                    {isUser ? (
                        <p className="text-sm text-white leading-relaxed">{content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-sm text-slate-200 leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    code: ({ children }) => (
                                        <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-cyan-400 text-xs font-mono">
                                            {children}
                                        </code>
                                    ),
                                    pre: ({ children }) => (
                                        <pre className="bg-slate-900/50 p-3 rounded-lg overflow-x-auto mb-2">
                                            {children}
                                        </pre>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                <span className={`text-[10px] text-slate-500 mt-1 block ${isUser ? 'text-right' : 'text-left'}`}>
                    {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                </span>
            </div>
        </div>
    );
};
