import React, { useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useTaskStore } from '@/store/useTaskStore';
import KanbanColumn from './KanbanColumn';
import { LayoutDashboard } from 'lucide-react';

interface KanbanBoardProps {
    projectId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
    const {
        tasks,
        statuses,
        isLoading,
        fetchProjectTasks,
        fetchProjectStatuses,
        moveTask
    } = useTaskStore();

    useEffect(() => {
        if (projectId) {
            fetchProjectTasks(projectId);
            fetchProjectStatuses(projectId);
        }
    }, [projectId, fetchProjectTasks, fetchProjectStatuses]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Trigger optimistic move in store
        moveTask(draggableId, destination.droppableId, destination.index);
    };

    if (isLoading && statuses.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4 opacity-50">
                    <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing Board State...</p>
                </div>
            </div>
        );
    }

    if (!isLoading && statuses.length === 0) {
        return (
            <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl h-full flex flex-col items-center justify-center">
                <LayoutDashboard className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-heading font-black text-slate-500 uppercase italic tracking-widest">Signal Lost</h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">No task statuses found for this orchestration. Parameters may be corrupted.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden min-h-0">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 flex-1 h-full min-h-0 overflow-x-auto custom-scrollbar">
                    {statuses
                        .sort((a, b) => a.position - b.position)
                        .map((status) => (
                            <KanbanColumn
                                key={status.id}
                                status={status}
                                tasks={tasks.filter((t) => t.status_id === status.id)}
                            />
                        ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;
