import React, { useState, useEffect, useRef } from 'react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Brain,
    Send,
    Plus,
    X,
    Loader2,
    Sparkles,
    MessageSquare,
    History
} from 'lucide-react';
import { ChatSessionList } from './ChatSessionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIChatPanelProps {
    projectId: string;
    onClose?: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ projectId, onClose }) => {
    const {
        messages,
        currentSession,
        sessions,
        isSending,
        isLoading,
        sendMessage,
        loadSessions,
        createNewSession,
        setCurrentSession,
        deleteSession,
    } = useAIChatStore();

    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load sessions on mount
    useEffect(() => {
        loadSessions(projectId);
    }, [projectId, loadSessions]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const message = input.trim();
        setInput('');

        try {
            await sendMessage(projectId, message, currentSession?.id);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        createNewSession();
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 border-l border-white/10">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                            <Brain className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-heading font-black text-white uppercase tracking-tight">
                                AI <span className="text-cyan-400">Assistant</span>
                            </h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                Project Intelligence
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleNewChat}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-black uppercase tracking-wider hover:bg-white/5"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            New
                        </Button>
                        {onClose && (
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white/5"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs for Chat and History */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'history')} className="flex-1 flex flex-col min-h-0">
                <div className="border-b border-white/10 px-6 flex-shrink-0">
                    <TabsList className="bg-transparent h-10 p-0 gap-4">
                        <TabsTrigger
                            value="chat"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-10 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-10 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                        >
                            <History className="h-3.5 w-3.5" />
                            History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 px-6 py-4">
                        {isLoading && messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/5 flex items-center justify-center mb-4">
                                    <Sparkles className="h-8 w-8 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-heading font-black text-white mb-2">
                                    Start a Conversation
                                </h3>
                                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                                    Ask me anything about your project. I can help you create tasks, analyze progress, or answer questions.
                                </p>
                                <div className="mt-6 space-y-2 w-full max-w-xs">
                                    <button
                                        onClick={() => setInput("What's the current status of this project?")}
                                        className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/70 transition-all text-sm text-slate-300"
                                    >
                                        <MessageSquare className="h-4 w-4 inline mr-2 text-cyan-400" />
                                        What's the project status?
                                    </button>
                                    <button
                                        onClick={() => setInput("Create 5 tasks for user authentication")}
                                        className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/70 transition-all text-sm text-slate-300"
                                    >
                                        <Sparkles className="h-4 w-4 inline mr-2 text-purple-400" />
                                        Create tasks for me
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        role={message.role}
                                        content={message.content}
                                        timestamp={message.created_at}
                                    />
                                ))}
                                {isSending && (
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                                            <Brain className="h-4 w-4 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="rounded-2xl px-4 py-3 bg-slate-800/50 border border-white/5 inline-block">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">Thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="flex-1 min-h-0 m-0">
                    <ChatSessionList
                        sessions={sessions}
                        currentSession={currentSession}
                        onSelectSession={(session) => {
                            setCurrentSession(session);
                            setActiveTab('chat');
                        }}
                        onDeleteSession={deleteSession}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about your project..."
                        className="min-h-[60px] max-h-[120px] resize-none bg-slate-800/50 border-white/10 focus:border-cyan-500/50 text-white placeholder:text-slate-500 pr-12 text-sm"
                        disabled={isSending}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        size="sm"
                        className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-[10px] text-slate-600 mt-2 text-center uppercase tracking-widest font-black">
                    Powered by Groq • Llama 3.3 70B
                </p>
            </div>
        </div>
    );
};
