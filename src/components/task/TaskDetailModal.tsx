import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Calendar,
    Flag,
    User,
    MessageSquare,
    Paperclip,
    CheckCircle2,
    Edit2,
    Trash2,
    Send,
    Download,
    Zap,
    FileText,
    Clock,
    Plus,
    Loader2,
    Upload,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { format } from 'date-fns';
import api from '@/services/api';
import { toast } from 'sonner';
import CommentSummarizer from '../project/CommentSummarizer';

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

interface Comment {
    id: string;
    message: string;
    created_by: string;
    created_at: string;
    user: {
        name: string;
        email: string;
        avatar_url?: string;
    };
}

interface Attachment {
    id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    uploaded_by: string;
    created_at: string;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
    const { updateTask, deleteTask } = useTaskStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState<Partial<Task>>({});
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(true);
    const [activeMobileTab, setActiveMobileTab] = useState<'details' | 'comments' | 'assets'>('details');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (task && isOpen) {
            setEditedTask(task);
            fetchComments();
            fetchAttachments();
            setPendingFile(null);
            setIsMobileDetailsOpen(true);
            setActiveMobileTab('details');
        }
    }, [task, isOpen]);

    const fetchComments = async () => {
        if (!task) return;
        try {
            const response = await api.get(`/tasks/${task.id}/comments`);
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const fetchAttachments = async () => {
        if (!task) return;
        try {
            const response = await api.get(`/tasks/${task.id}/attachments`);
            setAttachments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch attachments:', error);
        }
    };

    const handleSave = async () => {
        if (!task) return;
        try {
            await updateTask(task.id, editedTask);
            setIsEditing(false);
            toast.success('Task Updated!', {
                description: 'Changes have been saved successfully.',
            });
        } catch (error) {
            toast.error('Update Failed', {
                description: 'Could not save changes. Please try again.',
            });
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(task.id);
                toast.success('Task Deleted!');
                onClose();
            } catch (error) {
                toast.error('Delete Failed', {
                    description: 'Could not delete task. Please try again.',
                });
            }
        }
    };

    const handleAddComment = async () => {
        if (!task || !newComment.trim()) return;
        try {
            await api.post(`/tasks/${task.id}/comments`, {
                message: newComment
            });
            setNewComment('');
            fetchComments();
            toast.success('Comment Added!');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!task || !e.target.files?.[0]) return;
        setPendingFile(e.target.files[0]);
    };

    const handleConfirmUpload = async () => {
        if (!task || !pendingFile) return;
        const formData = new FormData();
        formData.append('file', pendingFile);

        setIsUploading(true);
        try {
            await api.post(`/tasks/${task.id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAttachments();
            setPendingFile(null);
            toast.success('Tactical Asset Linked!', {
                description: `${pendingFile.name} is now persistent in the cloud vault.`
            });
        } catch (error) {
            toast.error('Uplink Failed', {
                description: 'The neural link was interrupted during transmission.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePending = () => {
        setPendingFile(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (!task) return null;

    // Mobile Tab Component
    const MobileTabBar = () => (
        <div className="lg:hidden sticky top-[65px] sm:top-[73px] z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-2 flex gap-1">
            {[
                { id: 'details', label: 'Mission', icon: FileText },
                { id: 'comments', label: 'Comms', icon: MessageSquare, count: comments.length },
                { id: 'assets', label: 'Assets', icon: Paperclip, count: attachments.length }
            ].map((tab) => (
                <Button
                    key={tab.id}
                    variant={activeMobileTab === tab.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveMobileTab(tab.id as any)}
                    className="flex-1 gap-1.5 h-9 text-[10px] font-black uppercase tracking-wider rounded-lg"
                >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                        <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-primary/20">
                            {tab.count}
                        </Badge>
                    )}
                </Button>
            ))}
        </div>
    );

    // Priority & Deadline Card for Mobile
    const MobilePriorityCard = () => (
        <div className="lg:hidden bg-secondary/20 rounded-xl p-4 space-y-3 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Priority</span>
                </div>
                {isEditing ? (
                    <select
                        value={editedTask.priority || 'medium'}
                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                        className="bg-secondary/40 border border-border/50 rounded-lg px-2 py-1 text-xs font-black uppercase"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                ) : (
                    <Badge className={`${getPriorityColor(task.priority)} text-[9px] px-2 py-1`}>
                        <Flag className="h-2.5 w-2.5 mr-1" />
                        {task.priority || 'Medium'}
                    </Badge>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Deadline</span>
                </div>
                {isEditing ? (
                    <Input
                        type="date"
                        value={editedTask.due_date ? format(new Date(editedTask.due_date), 'yyyy-MM-dd') : ''}
                        onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                        className="w-auto h-8 text-xs bg-secondary/40 rounded-lg"
                    />
                ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                        <Clock className="h-3 w-3 text-primary" />
                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No deadline'}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Specialists</span>
                </div>
                <span className="text-[10px] font-bold">
                    {task.assignees?.length || 0} Assigned
                </span>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl w-[100vw] h-[100vh] max-h-[100vh] sm:w-[95vw] sm:h-auto sm:max-h-[90vh] bg-card border-0 sm:border-2 border-border/80 hover:border-primary/70 transition-colors text-foreground p-0 overflow-hidden shadow-none sm:shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] rounded-none sm:rounded-2xl sm:rounded-3xl">
                {/* Header */}
                <DialogHeader className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 border-b border-border bg-secondary/10 sticky top-0 z-20 bg-card/95 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 flex items-start gap-2 sm:gap-3">
                            {/* Favicon-style Icon */}
                            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary animate-pulse" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <Input
                                        value={editedTask.title || ''}
                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                        className="text-sm sm:text-lg md:text-2xl font-black bg-secondary/30 border-border rounded-xl"
                                        placeholder="Task title"
                                    />
                                ) : (
                                    <DialogTitle className="text-base sm:text-xl md:text-2xl font-black text-foreground italic uppercase tracking-tight break-words leading-tight">
                                        {task.title}
                                    </DialogTitle>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-5 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" /> 
                                        <span className="hidden xs:inline">Save</span>
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-4 rounded-lg sm:rounded-xl">
                                        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1" />
                                        <span className="hidden xs:inline">Cancel</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 hover:bg-primary/10 hover:text-primary rounded-lg sm:rounded-xl transition-all">
                                        <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                    <Button onClick={handleDelete} size="sm" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg sm:rounded-xl transition-all">
                                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                    {/* Mobile Close Button */}
                                    <Button 
                                        onClick={onClose} 
                                        size="sm" 
                                        variant="ghost" 
                                        className="lg:hidden h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Mobile Tab Bar */}
                <MobileTabBar />

                {/* Mobile Priority Card - Visible only on mobile when details tab is active */}
                {activeMobileTab === 'details' && (
                    <div className="lg:hidden px-4 pt-3">
                        <MobilePriorityCard />
                    </div>
                )}

                <ScrollArea className="h-[calc(100vh-120px)] sm:h-[calc(90vh-100px)]" ref={scrollRef}>
                    {/* Desktop Layout - Hidden on mobile */}
                    <div className="hidden lg:flex flex-col lg:flex-row min-h-full">
                        {/* Main Content Area */}
                        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 lg:space-y-10 lg:border-r border-border/30">
                            {/* Mission Briefing */}
                            <div className="space-y-3 sm:space-y-4">
                                <label className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2">
                                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                    Mission Briefing
                                </label>
                                {isEditing ? (
                                    <Textarea
                                        value={editedTask.description || ''}
                                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                        className="min-h-[150px] sm:min-h-[180px] md:min-h-[200px] bg-secondary/30 border-border rounded-xl sm:rounded-2xl resize-none p-4 sm:p-5 md:p-6 text-xs sm:text-sm leading-relaxed font-semibold focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                        placeholder="Define the mission parameters..."
                                    />
                                ) : (
                                    <div className="bg-secondary/10 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 border border-border/30 shadow-inner relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
                                        <p className="text-xs sm:text-sm md:text-base text-foreground/90 leading-relaxed font-bold italic tracking-tight break-words">
                                            {task.description || 'No briefing parameters provided for this segment.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Secure Comms Log */}
                            <div className="space-y-6 sm:space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <label className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                        Secure Comms Log ({comments.length})
                                    </label>
                                </div>

                                <CommentSummarizer
                                    projectId={task.project_id}
                                    comments={comments}
                                />

                                <div className="space-y-4 sm:space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="group/comment relative">
                                            <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
                                                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 border-2 border-border/50 shrink-0 shadow-lg group-hover/comment:border-primary/30 transition-colors">
                                                    <AvatarImage src={comment.user?.avatar_url} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs font-black uppercase">
                                                        {comment.user?.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 bg-secondary/20 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] p-3 sm:p-4 md:p-6 border border-border/40 hover:border-primary/20 transition-all shadow-sm">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-foreground flex items-center gap-2 flex-wrap">
                                                            {comment.user?.name}
                                                            <span className="h-1 w-1 rounded-full bg-primary/40 hidden sm:inline" />
                                                            <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground/50">Operative Verified</span>
                                                        </span>
                                                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/40 italic">
                                                            {format(new Date(comment.created_at), 'MMM dd | HH:mm')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-foreground/80 font-bold leading-relaxed break-words tracking-tight">
                                                        {comment.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-card/80 backdrop-blur-md p-2 -m-2 rounded-2xl z-10 border border-white/5 shadow-2xl">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Transmit secure message..."
                                        className="flex-1 bg-secondary/40 border-border/50 rounded-xl resize-none min-h-[70px] sm:min-h-[80px] md:min-h-[100px] p-3 sm:p-4 md:p-5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none shadow-inner"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                handleAddComment();
                                            }
                                        }}
                                    />
                                    <Button 
                                        onClick={handleAddComment} 
                                        disabled={!newComment.trim()} 
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 sm:w-20 h-10 sm:h-auto rounded-xl flex items-center justify-center transition-all active:scale-95"
                                    >
                                        <Send className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                        <span className="hidden sm:inline ml-1 text-xs font-black uppercase tracking-wider">Send</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Area - Desktop */}
                        <div className="w-full lg:w-[300px] xl:w-[320px] bg-secondary/5 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 lg:space-y-10 shrink-0">
                            {/* Priority & Deadline Section */}
                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-3 sm:space-y-4">
                                    <label className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2">
                                        <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                        Task Priority
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={editedTask.priority || 'medium'}
                                            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                                            className="w-full bg-secondary/40 border border-border/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-all font-black uppercase tracking-widest"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    ) : (
                                        <Badge className={`${getPriorityColor(task.priority)} shadow-lg shadow-primary/5 font-black uppercase tracking-widest text-[8px] sm:text-[9px] px-3 sm:px-4 py-1.5 sm:py-2 border-2 rounded-xl w-full justify-center gap-1 sm:gap-2`}>
                                            <Flag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                            {task.priority || 'Medium'}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <label className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2">
                                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                        Protocol Deadline
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={editedTask.due_date ? format(new Date(editedTask.due_date), 'yyyy-MM-dd') : ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                                            className="bg-secondary/40 border-border/50 rounded-xl h-10 sm:h-12 px-3 sm:px-4 font-black text-[10px] sm:text-xs uppercase tracking-widest"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] md:text-[10px] font-black text-foreground/70 bg-secondary/30 w-full py-2.5 sm:py-3 rounded-xl border border-border/60 shadow-inner hover:border-primary/40 transition-all">
                                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                                            <span className="break-words text-center">
                                                {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'NO LIMIT DETECTED'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Specialist Section */}
                            <div className="space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2">
                                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                        Target Specialists
                                    </label>
                                </div>
                                <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto">
                                    {task.assignees && task.assignees.length > 0 ? (
                                        task.assignees.map((assignee: any) => (
                                            <div key={assignee.id} className="flex items-center gap-2 sm:gap-3 bg-secondary/40 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-border/40 hover:border-primary/40 transition-all shadow-sm cursor-default">
                                                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 border-2 border-border/50 ring-4 ring-primary/5 shadow-md">
                                                    <AvatarImage src={assignee.user?.avatar_url} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase">
                                                        {assignee.user?.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground/90 truncate">
                                                        {assignee.user?.name || 'Unknown Specialist'}
                                                    </span>
                                                    <span className="text-[6px] sm:text-[7px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] sm:tracking-[0.2em] animate-pulse">Neural Link Active</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 sm:py-6 px-3 sm:px-4 border-2 border-dashed border-border/30 rounded-xl sm:rounded-2xl">
                                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">No specialist locked on target</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Assets Section */}
                            <div className="space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-2">
                                        <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                        Tactical Assets
                                    </label>
                                    <label className="cursor-pointer group/upload">
                                        <input type="file" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                                        <div className={`p-1.5 sm:p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover/upload:bg-primary/20 transition-all ${isUploading || pendingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Plus className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    </label>
                                </div>

                                {pendingFile && (
                                    <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-xl">
                                                <Upload className="h-4 w-4 text-primary animate-bounce" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-foreground truncate uppercase">{pendingFile.name}</p>
                                                <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest leading-none mt-1">Staging for Uplink...</p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={handleRemovePending}
                                                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        <Button 
                                            onClick={handleConfirmUpload}
                                            disabled={isUploading}
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                            {isUploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    Secure Asset Uplink
                                                    <Zap className="ml-2 h-3.5 w-3.5 fill-primary-foreground" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[250px] overflow-y-auto pr-1">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className="flex items-center justify-between bg-primary/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 border border-primary/10 hover:border-primary/40 hover:bg-primary/10 transition-all shadow-sm">
                                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                                                <div className="p-1.5 sm:p-2 md:p-2.5 bg-card border border-border/50 rounded-lg sm:rounded-xl shadow-inner">
                                                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-foreground truncate uppercase tracking-tight">{attachment.file_name}</p>
                                                    <p className="text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/50">{formatFileSize(attachment.file_size)}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 text-muted-foreground hover:text-primary transition-all hover:bg-primary/10 rounded-lg shrink-0"
                                                onClick={() => window.open(attachment.file_url, '_blank')}
                                            >
                                                <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {attachments.length === 0 && (
                                        <div className="text-center py-6 sm:py-8 px-3 sm:px-4 border-2 border-dashed border-border/30 rounded-xl sm:rounded-2xl bg-secondary/10">
                                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">No asset uplinks detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout - Visible only on mobile */}
                    <div className="lg:hidden px-4 pb-20 space-y-6">
                        {/* Details Tab Content */}
                        {activeMobileTab === 'details' && (
                            <>
                                {/* Mission Briefing */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                        Mission Briefing
                                    </label>
                                    {isEditing ? (
                                        <Textarea
                                            value={editedTask.description || ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                            className="min-h-[120px] bg-secondary/30 border-border rounded-xl resize-none p-4 text-sm font-semibold"
                                            placeholder="Define the mission parameters..."
                                        />
                                    ) : (
                                        <div className="bg-secondary/10 rounded-xl p-4 border border-border/30">
                                            <p className="text-sm text-foreground/90 leading-relaxed font-bold break-words">
                                                {task.description || 'No briefing parameters provided for this segment.'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Specialists List */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                        Target Specialists
                                    </label>
                                    <div className="space-y-2">
                                        {task.assignees && task.assignees.length > 0 ? (
                                            task.assignees.map((assignee: any) => (
                                                <div key={assignee.id} className="flex items-center gap-3 bg-secondary/40 rounded-xl px-3 py-2 border border-border/40">
                                                    <Avatar className="h-8 w-8 border-2 border-border/50">
                                                        <AvatarImage src={assignee.user?.avatar_url} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black uppercase">
                                                            {assignee.user?.name?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">{assignee.user?.name || 'Unknown Specialist'}</p>
                                                        <p className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Neural Link Active</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 border-2 border-dashed border-border/30 rounded-xl">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">No specialist assigned</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Comments Tab Content */}
                        {activeMobileTab === 'comments' && (
                            <div className="space-y-4 pb-4">
                                {/* Comments List */}
                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No comms transmissions</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar className="h-8 w-8 shrink-0 border-2 border-border/50">
                                                    <AvatarImage src={comment.user?.avatar_url} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                                                        {comment.user?.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 bg-secondary/20 rounded-xl p-3 border border-border/40">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black uppercase">{comment.user?.name}</span>
                                                        <span className="text-[7px] font-black text-muted-foreground/40">
                                                            {format(new Date(comment.created_at), 'MMM dd | HH:mm')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold leading-relaxed break-words">{comment.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Comment Input */}
                                <div className="sticky bottom-0 bg-card/95 backdrop-blur-md pt-4 pb-2">
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Transmit secure message..."
                                            className="flex-1 bg-secondary/40 border-border/50 rounded-xl resize-none min-h-[70px] text-sm font-bold"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                    handleAddComment();
                                                }
                                            }}
                                        />
                                        <Button 
                                            onClick={handleAddComment} 
                                            disabled={!newComment.trim()} 
                                            className="bg-primary hover:bg-primary/90 h-auto rounded-xl px-4"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assets Tab Content */}
                        {activeMobileTab === 'assets' && (
                            <div className="space-y-4 pb-4">
                                {/* Upload Area */}
                                <div className="flex justify-end">
                                    <label className="cursor-pointer group/upload">
                                        <input type="file" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                                        <div className={`p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover/upload:bg-primary/20 transition-all ${isUploading || pendingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Plus className="h-5 w-5 text-primary" />
                                        </div>
                                    </label>
                                </div>

                                {/* Pending File */}
                                {pendingFile && (
                                    <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-3 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                                <Upload className="h-4 w-4 text-primary animate-bounce" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black truncate">{pendingFile.name}</p>
                                                <p className="text-[7px] font-black text-primary/60 uppercase">Ready for uplink</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={handleRemovePending} className="h-7 w-7">
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <Button 
                                            onClick={handleConfirmUpload}
                                            disabled={isUploading}
                                            className="w-full bg-primary h-9 text-[9px] font-black uppercase"
                                        >
                                            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm Uplink'}
                                        </Button>
                                    </div>
                                )}

                                {/* Assets List */}
                                <div className="space-y-2">
                                    {attachments.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-xl">
                                            <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">No assets attached</p>
                                        </div>
                                    ) : (
                                        attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between bg-primary/5 rounded-xl p-3 border border-primary/10">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div className="p-1.5 bg-card border border-border/50 rounded-lg">
                                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[9px] font-black truncate">{attachment.file_name}</p>
                                                        <p className="text-[7px] font-black text-muted-foreground/50">{formatFileSize(attachment.file_size)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => window.open(attachment.file_url, '_blank')}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer - Sticky on mobile */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-secondary/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sticky bottom-0 bg-card/95 backdrop-blur-md z-20">
                    <div className="flex items-center gap-2 sm:gap-4 opacity-50 flex-wrap justify-center">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Protocol Nominal</span>
                        </div>
                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Sync-Node: v4.0.0</span>
                    </div>
                    <Button 
                        onClick={onClose} 
                        variant="outline" 
                        className="border-border/60 hover:bg-secondary/80 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] h-8 sm:h-9 md:h-10 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <span className="group-hover:opacity-70 transition-opacity">Close Mission</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailModal;