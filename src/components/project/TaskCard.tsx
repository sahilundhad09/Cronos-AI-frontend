import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from '@/store/useTaskStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, Paperclip, MoreHorizontal, UserPlus, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import AssignTaskDialog from './AssignTaskDialog';
import TaskDetailModal from '../task/TaskDetailModal';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowRightLeft, FileText, UserPlus as UserPlusIcon } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    index: number;
    isLead?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, isLead }) => {
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const { statuses, moveTask } = useTaskStore();
    const currentUser = useAuthStore((state) => state.user);

    // Check if current user is assigned to this task
    const isAssignee = task.assignees?.some((assignee: any) =>
        assignee.user_id === currentUser?.id || assignee.user?.id === currentUser?.id
    );

    const handleQuickComplete = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isAssignee) {
            toast.error('Permission Denied', {
                description: 'Only assigned team members can mark this task as complete.',
            });
            return;
        }

        const doneStatus = statuses.find(s =>
            s.name.toLowerCase().includes('done') ||
            s.name.toLowerCase().includes('completed')
        );
        if (doneStatus) {
            moveTask(task.id, doneStatus.id, 0);
            toast.success('Task Completed!', {
                description: `"${task.title}" has been marked as done.`,
            });
        }
    };

    const priorityColors: Record<string, any> = {
        low: 'emerald',
        medium: 'amber',
        high: 'red',
        urgent: 'destructive'
    };

    return (
        <>
            <Draggable draggableId={task.id} index={index} isDragDisabled={!isAssignee}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-3 select-none ${snapshot.isDragging ? 'z-50' : ''}`}
                    >
                        <Card
                            onClick={() => setIsDetailModalOpen(true)}
                            className={`
                                bg-card border-border/50
                                transition-all duration-200 group
                                ${isAssignee 
                                    ? 'hover:border-primary/25 hover:bg-accent/30 cursor-pointer' 
                                    : 'cursor-default opacity-90'
                                }
                                ${snapshot.isDragging
                                    ? 'shadow-2xl shadow-primary/20 ring-1 ring-primary/40 scale-[1.01]'
                                    : ''
                                }
                            `}
                        >
                            <CardContent className="p-3.5 space-y-3">

                                {/* Top row: priority badge + complete + menu */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 mt-3">
                                        <Badge
                                            variant={priorityColors[task.priority] || 'outline'}
                                            className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0 h-4 flex-shrink-0"
                                        >
                                            {task.priority}
                                        </Badge>

                                        {!task.completed_at && (
                                            <button
                                                title={isAssignee ? 'Quick Complete' : 'Only assignees can complete this task'}
                                                onClick={handleQuickComplete}
                                                disabled={!isAssignee}
                                                className={`h-5 w-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                                                    isAssignee
                                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 opacity-40 hover:opacity-100 cursor-pointer'
                                                        : 'bg-muted border border-border text-muted-foreground/20 cursor-not-allowed opacity-20'
                                                }`}
                                            >
                                                <CheckCircle2 size={11} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 hover:bg-secondary/50 rounded-lg outline-none"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-xl rounded-xl p-1.5" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem 
                                                onClick={() => setIsDetailModalOpen(true)}
                                                className="rounded-lg gap-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer py-2"
                                            >
                                                <FileText className="h-3.5 w-3.5 text-primary" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            {isLead && (
                                                <DropdownMenuItem 
                                                    onClick={() => setIsAssignDialogOpen(true)}
                                                    className="rounded-lg gap-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer py-2"
                                                >
                                                    <UserPlusIcon className="h-3.5 w-3.5 text-amber-400" />
                                                    Manage Specialists
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator className="bg-border/50" />

                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger 
                                                    disabled={!isAssignee && !isLead}
                                                    className={`rounded-lg gap-2.5 text-[11px] font-bold uppercase tracking-widest py-2 ${(!isAssignee && !isLead) ? 'opacity-50' : 'cursor-pointer'}`}
                                                >
                                                    <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                                                    Move to Column
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="bg-card border-border shadow-2xl rounded-xl p-1.5 min-w-[160px]">
                                                    {statuses.filter(s => s.id !== task.status_id).map((status) => (
                                                        <DropdownMenuItem
                                                            key={status.id}
                                                            onClick={() => {
                                                                moveTask(task.id, status.id, 0);
                                                                toast.success('Task Transferred', {
                                                                    description: `Moved to ${status.name}`
                                                                });
                                                            }}
                                                            className="rounded-lg text-[10px] font-black uppercase tracking-[0.15em] cursor-pointer py-2 px-3"
                                                        >
                                                            {status.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    {statuses.length <= 1 && (
                                                        <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 py-2 italic text-center">
                                                            No other sectors
                                                        </div>
                                                    )}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Title + description */}
                                <div className="space-y-1">
                                    <h4 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p className="text-[10px] text-foreground/85 font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                {/* Footer: meta + assignees */}
                                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">

                                    {/* Left meta */}
                                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                                        {task.due_date && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                                <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                                                    {format(new Date(task.due_date), 'MMM d')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-muted-foreground/60">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-2.5 w-2.5" />
                                                <span className="text-[8px] font-black tracking-widest">{task.comment_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Paperclip className="h-2.5 w-2.5" />
                                                <span className="text-[8px] font-black tracking-widest">{task.attachment_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: assignees */}
                                    <div
                                        className="flex -space-x-1.5 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                                        onClick={(e) => { e.stopPropagation(); setIsAssignDialogOpen(true); }}
                                    >
                                        {task.assignees && task.assignees.length > 0 ? (
                                            <>
                                                {task.assignees.slice(0, 3).map((a: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="h-5 w-5 rounded-md bg-muted border border-card flex items-center justify-center text-[7px] font-black text-muted-foreground overflow-hidden"
                                                        title={a.user?.name || a.name}
                                                    >
                                                        {(a.user?.avatar_url || a.avatar_url) ? (
                                                            <img
                                                                src={a.user?.avatar_url || a.avatar_url}
                                                                alt={a.user?.name || a.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            (a.user?.name || a.name)?.substring(0, 1).toUpperCase() || 'U'
                                                        )}
                                                    </div>
                                                ))}
                                                {task.assignees.length > 3 && (
                                                    <div className="h-5 w-5 rounded-md bg-muted border border-card flex items-center justify-center text-[7px] font-black text-muted-foreground">
                                                        +{task.assignees.length - 3}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-1.5 group/assign">
                                                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-0 group-hover/assign:opacity-100 transition-opacity">
                                                    Assign
                                                </span>
                                                <div className="h-5 w-5 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                                                    <UserPlus className="h-2.5 w-2.5" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                )}
            </Draggable>

            <AssignTaskDialog
                task={task}
                isOpen={isAssignDialogOpen}
                onClose={() => setIsAssignDialogOpen(false)}
            />

            <TaskDetailModal
                task={task}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                projectId={task.project_id}
            />
        </>
    );
};

export default TaskCard;