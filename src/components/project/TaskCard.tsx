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
                        className={`mb-4 select-none ${snapshot.isDragging ? 'z-50' : ''}`}
                    >
                        <Card
                            onClick={() => setIsDetailModalOpen(true)}
                            className={`bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer ${snapshot.isDragging ? 'shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500/50' : ''}`}
                        >
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={priorityColors[task.priority] || 'outline'} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                                            {task.priority}
                                        </Badge>
                                        {!task.completed_at && (
                                            <button
                                                title={isAssignee ? "Quick Complete" : "Only assignees can complete this task"}
                                                onClick={handleQuickComplete}
                                                disabled={!isAssignee}
                                                className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${isAssignee
                                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 opacity-40 hover:opacity-100 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer'
                                                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-600 cursor-not-allowed opacity-30'
                                                    }`}
                                            >
                                                <CheckCircle2 size={14} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                    <button className="text-slate-700 hover:text-white transition-colors">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {task.due_date && (
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">
                                                    {format(new Date(task.due_date), 'MMM d')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                <span className="text-[8px] font-black tracking-widest">2</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Paperclip className="h-3 w-3" />
                                                <span className="text-[8px] font-black tracking-widest">1</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => setIsAssignDialogOpen(true)}
                                    >
                                        {task.assignees && task.assignees.length > 0 ? (
                                            task.assignees.map((a: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="h-6 w-6 rounded-lg bg-slate-800 border-2 border-[#0A0D18] flex items-center justify-center text-[8px] font-black text-slate-500 overflow-hidden"
                                                    title={a.user?.name || a.name}
                                                >
                                                    {(a.user?.avatar_url || a.avatar_url) ? (
                                                        <img src={a.user?.avatar_url || a.avatar_url} alt={a.user?.name || a.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        (a.user?.name || a.name)?.substring(0, 1).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-2 group/assign">
                                                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover/assign:opacity-100 transition-opacity">Deploy</span>
                                                <div className="h-6 w-6 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-slate-700 group-hover:border-cyan-500/50 group-hover:text-cyan-500 transition-colors">
                                                    <UserPlus className="h-3 w-3" />
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
