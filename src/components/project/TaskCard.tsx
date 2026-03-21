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

interface TaskCardProps {
    task: Task;
    index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
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
            <Draggable draggableId={task.id} index={index}>
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
                                bg-[#0A0D18] border-white/[0.06]
                                hover:border-cyan-500/25 hover:bg-white/[0.03]
                                transition-all duration-200 group cursor-pointer
                                ${snapshot.isDragging
                                    ? 'shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500/40 scale-[1.01]'
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
                                                        : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed opacity-20'
                                                }`}
                                            >
                                                <CheckCircle2 size={11} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-white/60 hover:text-white transition-colors flex-shrink-0 p-0.5 rounded"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Title + description */}
                                <div className="space-y-1">
                                    <h4 className="text-[13px] font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p className="text-[10px] text-white/85 font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                {/* Footer: meta + assignees */}
                                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">

                                    {/* Left meta */}
                                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                                        {task.due_date && (
                                            <div className="flex items-center gap-1 text-white/80">
                                                <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                                <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                                                    {format(new Date(task.due_date), 'MMM d')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-white/60">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-2.5 w-2.5" />
                                                <span className="text-[8px] font-black tracking-widest">2</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Paperclip className="h-2.5 w-2.5" />
                                                <span className="text-[8px] font-black tracking-widest">1</span>
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
                                                        className="h-5 w-5 rounded-md bg-white/20 border border-[#0A0D18] flex items-center justify-center text-[7px] font-black text-white/60 overflow-hidden"
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
                                                    <div className="h-5 w-5 rounded-md bg-white/20 border border-[#0A0D18] flex items-center justify-center text-[7px] font-black text-white/60">
                                                        +{task.assignees.length - 3}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-1.5 group/assign">
                                                <span className="text-[7px] font-black text-white/60 uppercase tracking-widest opacity-0 group-hover/assign:opacity-100 transition-opacity">
                                                    Assign
                                                </span>
                                                <div className="h-5 w-5 rounded-md border border-dashed border-white/[0.2] flex items-center justify-center text-white/60 group-hover:border-cyan-500/40 group-hover:text-cyan-500 transition-colors">
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