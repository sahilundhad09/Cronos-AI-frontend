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
        <div className="flex flex-col w-[86vw] sm:w-80 md:w-96 lg:w-[26rem] flex-shrink-0 h-full bg-[#08090d]/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl group/column">
            <div className="p-3 sm:p-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    <h3 className="text-[11px] sm:text-xs font-black uppercase text-foreground tracking-widest leading-none truncate max-w-[120px] sm:max-w-[180px]">
                        {status.name}
                    </h3>
                    <span className="text-[10px] font-black text-white bg-white/10 px-1.5 py-0.5 rounded-md leading-none">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-white hover:bg-white/5 transition-colors">
                        <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 sm:p-4 overflow-y-auto custom-scrollbar min-h-0 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
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
