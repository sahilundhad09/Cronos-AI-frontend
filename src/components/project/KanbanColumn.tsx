import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Task, TaskStatus } from '@/store/useTaskStore';
import TaskCard from './TaskCard';
import { Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
    return (
        <div className="flex flex-col w-96 h-full bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-sm">
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <div
                        className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(var(--color))] "
                        style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}80` } as React.CSSProperties}
                    />
                    <h3 className="text-xs font-black uppercase text-white tracking-widest leading-none">
                        {status.name}
                    </h3>
                    <span className="text-[10px] font-black text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-md leading-none">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-600 hover:text-white">
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-600 hover:text-white">
                        <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0 transition-colors ${snapshot.isDraggingOver ? 'bg-cyan-500/5' : ''}`}
                    >
                        {tasks
                            .sort((a, b) => a.position - b.position)
                            .map((task, index) => (
                                <TaskCard key={task.id} task={task} index={index} />
                            ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;
