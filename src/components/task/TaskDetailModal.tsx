import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Upload,
    Download,
    Zap
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

    useEffect(() => {
        if (task && isOpen) {
            setEditedTask(task);
            fetchComments();
            fetchAttachments();
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!task || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/tasks/${task.id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAttachments();
            toast.success('File Uploaded!');
        } catch (error) {
            toast.error('Upload Failed');
        }
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl w-[calc(100%-1rem)] max-h-[95vh] bg-card border-2 border-border/80 hover:border-primary/70 transition-colors text-foreground p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] rounded-2xl sm:rounded-3xl">
                {/* Header */}
                <DialogHeader className="px-4 sm:px-8 py-5 sm:py-7 border-b border-border bg-secondary/10">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 flex items-start gap-3">
                            {/* Favicon-style Icon */}
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <Input
                                        value={editedTask.title || ''}
                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                        className="text-lg sm:text-2xl font-black bg-secondary/30 border-border rounded-xl"
                                    />
                                ) : (
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-foreground italic uppercase tracking-tight truncate leading-tight mt-1 sm:mt-2">
                                        {task.title}
                                    </DialogTitle>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-[10px] h-9 px-5 rounded-xl shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl">
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary rounded-xl transition-all border border-transparent hover:border-primary/20">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleDelete} size="sm" variant="ghost" className="h-10 w-10 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-transparent hover:border-destructive/20">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="h-[calc(95vh-140px)] sm:h-[calc(90vh-120px)]">
                    <div className="p-4 sm:p-10 space-y-8 sm:space-y-10">
                        {/* Task Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Mission Priority</label>
                                {isEditing ? (
                                    <select
                                        value={editedTask.priority || 'medium'}
                                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                ) : (
                                    <div className="flex">
                                        <Badge className={`${getPriorityColor(task.priority)} shadow-md font-black uppercase tracking-widest text-[9px] px-3 py-1 border rounded-lg`}>
                                            <Flag className="h-3 w-3 mr-2" />
                                            {task.priority}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Deadline Pin</label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={editedTask.due_date ? format(new Date(editedTask.due_date), 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                                        className="bg-secondary/30 border-border rounded-xl h-11 px-4 font-bold"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 text-sm font-black text-foreground/70 bg-secondary/20 w-fit px-4 py-2 rounded-xl border border-border/40 shadow-sm transition-all hover:bg-secondary/30">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No Horizon Set'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-border/30" />

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Mission Briefing</label>
                            {isEditing ? (
                                <Textarea
                                    value={editedTask.description || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    className="min-h-[160px] bg-secondary/30 border-border rounded-2xl resize-none p-5 text-sm leading-relaxed font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Define the mission parameters..."
                                />
                            ) : (
                                <div className="bg-secondary/10 rounded-2xl p-5 border border-border/30">
                                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-semibold">
                                        {task.description || 'No briefing parameters provided for this segment.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator className="bg-border/30" />

                        {/* Assignees */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Active Specialists
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {task.assignees && task.assignees.length > 0 ? (
                                    task.assignees.map((assignee: any) => (
                                        <div key={assignee.id} className="flex items-center gap-3 bg-secondary/30 rounded-2xl px-4 py-2.5 border border-border/60 hover:border-primary/40 transition-all shadow-sm group/specialist cursor-default">
                                            <Avatar className="h-8 w-8 border border-border/50 ring-2 ring-primary/5">
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                                    {assignee.user?.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/90 leading-tight">
                                                    {assignee.user?.name || 'Unknown Specialist'}
                                                </span>
                                                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Verified Operative</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic py-2">No specialist locked on target</p>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-border/30" />

                        {/* Comments */}
                        <div className="space-y-6 sm:space-y-8">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                < MessageSquare className="h-4 w-4 text-primary" />
                                Secure Comms Log ({comments.length})
                            </label>

                            <CommentSummarizer
                                projectId={task.project_id}
                                comments={comments}
                            />

                            <div className="space-y-5">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-secondary/20 rounded-2xl p-5 sm:p-6 border border-border/40 hover:border-primary/20 transition-all shadow-sm">
                                        <div className="flex items-start gap-4 sm:gap-5">
                                            <Avatar className="h-10 w-10 border border-border/50 shrink-0">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                                                    <span className="text-xs font-black uppercase tracking-tight text-foreground">
                                                        {comment.user?.name}
                                                    </span>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                                                        {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/80 font-semibold leading-relaxed break-words">
                                                    {comment.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Enter secure message..."
                                    className="flex-1 bg-secondary/30 border-border rounded-2xl resize-none min-h-[100px] sm:min-h-[120px] p-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-semibold outline-none"
                                />
                                <Button 
                                    onClick={handleAddComment} 
                                    disabled={!newComment.trim()} 
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 sm:w-16 sm:h-auto rounded-2xl flex items-center justify-center transition-all active:scale-95 group/send"
                                >
                                    <Send className="h-6 w-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-border/30" />

                        {/* Attachments */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-primary" />
                                    Mission Assets ({attachments.length})
                                </label>
                                <label className="cursor-pointer">
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 text-[9px] font-black uppercase tracking-widest h-9 px-6 rounded-xl transition-all" asChild>
                                        <span>
                                            <Upload className="h-3.5 w-3.5 mr-2" /> Upload Asset
                                        </span>
                                    </Button>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between bg-secondary/20 rounded-2xl p-4 border border-border/40 hover:border-primary/30 transition-all shadow-sm group/att">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="p-2.5 bg-primary/10 rounded-xl group-hover/att:bg-primary/20 transition-colors">
                                                <Paperclip className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{attachment.file_name}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{formatFileSize(attachment.file_size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-10 w-10 p-0 text-muted-foreground hover:text-primary transition-all hover:bg-primary/10 rounded-xl"
                                            onClick={() => window.open(attachment.file_url, '_blank')}
                                        >
                                            <Download className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                                {attachments.length === 0 && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic py-4 text-center w-full border border-dashed border-border/40 rounded-2xl">No asset uplinks detected in this sector</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Close Button */}
                        <div className="flex justify-center sm:justify-end pt-8">
                            <Button 
                                onClick={onClose} 
                                variant="outline" 
                                className="border-border/60 hover:bg-secondary/50 text-[10px] font-black uppercase tracking-[0.3em] h-12 px-10 rounded-2xl shadow-md transition-all active:scale-95 group/close w-full sm:w-auto"
                            >
                                <span className="group-hover:opacity-70 transition-opacity">Abort Link Persistence</span>
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailModal;
