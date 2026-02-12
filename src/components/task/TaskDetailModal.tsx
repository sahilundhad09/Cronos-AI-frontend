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
    X,
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
    Download
} from 'lucide-react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { format } from 'date-fns';
import api from '@/services/api';
import { toast } from 'sonner';

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

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, projectId }) => {
    const { updateTask, deleteTask } = useTaskStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState<Partial<Task>>({});
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

    useEffect(() => {
        if (task && isOpen) {
            setEditedTask(task);
            fetchComments();
            fetchAttachments();
        }
    }, [task, isOpen]);

    const fetchComments = async () => {
        if (!task) return;
        setIsLoadingComments(true);
        try {
            const response = await api.get(`/tasks/${task.id}/comments`);
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const fetchAttachments = async () => {
        if (!task) return;
        setIsLoadingAttachments(true);
        try {
            const response = await api.get(`/tasks/${task.id}/attachments`);
            setAttachments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch attachments:', error);
        } finally {
            setIsLoadingAttachments(false);
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
            <DialogContent className="max-w-4xl max-h-[90vh] bg-[#0A0D18] border-white/10 text-white p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                            {isEditing ? (
                                <Input
                                    value={editedTask.title || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    className="text-xl font-bold bg-white/5 border-white/10"
                                />
                            ) : (
                                <DialogTitle className="text-2xl font-bold text-white">{task.title}</DialogTitle>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-400">
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Save
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost">
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleDelete} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <Button onClick={onClose} size="sm" variant="ghost">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-100px)]">
                    <div className="p-6 space-y-6">
                        {/* Task Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                                {isEditing ? (
                                    <select
                                        value={editedTask.priority || 'medium'}
                                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                ) : (
                                    <Badge className={getPriorityColor(task.priority)}>
                                        <Flag className="h-3 w-3 mr-1" />
                                        {task.priority}
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Due Date</label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={editedTask.due_date ? format(new Date(editedTask.due_date), 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                            {isEditing ? (
                                <Textarea
                                    value={editedTask.description || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    className="min-h-[120px] bg-white/5 border-white/10 resize-none"
                                    placeholder="Add a description..."
                                />
                            ) : (
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {task.description || 'No description provided'}
                                </p>
                            )}
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Assignees */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Assignees
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {task.assignees && task.assignees.length > 0 ? (
                                    task.assignees.map((assignee: any) => (
                                        <div key={assignee.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">
                                                    {assignee.user?.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-slate-300">{assignee.user?.name || 'Unknown'}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">No assignees</p>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Comments */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comments ({comments.length})
                            </label>

                            <div className="space-y-3">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">
                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white">{comment.user?.name}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300">{comment.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-white/5 border-white/10 resize-none min-h-[80px]"
                                />
                                <Button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-cyan-500 hover:bg-cyan-400">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Attachments */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Attachments ({attachments.length})
                                </label>
                                <label className="cursor-pointer">
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400" asChild>
                                        <span>
                                            <Upload className="h-4 w-4 mr-2" /> Upload
                                        </span>
                                    </Button>
                                </label>
                            </div>

                            <div className="space-y-2">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Paperclip className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{attachment.file_name}</p>
                                                <p className="text-xs text-slate-500">{formatFileSize(attachment.file_size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(attachment.file_url, '_blank')}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {attachments.length === 0 && (
                                    <p className="text-sm text-slate-500">No attachments</p>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailModal;
