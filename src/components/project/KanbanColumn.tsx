import React from 'react';
import StrictModeDroppable from './StrictModeDroppable';
import { Task, TaskStatus } from '@/store/useTaskStore';
import TaskCard from './TaskCard';
import {
    MoreVertical,
    Trash2,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateTaskDialog from './CreateTaskDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskStore } from '@/store/useTaskStore';

interface KanbanColumnProps {
    status: TaskStatus;
    projectId: string;
    tasks: Task[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, projectId, tasks }) => {
    const { deleteStatus } = useTaskStore();

    const handleDeleteColumn = () => {
        if (window.confirm(`Are you sure you want to delete the "${status.name}" column? This will not delete the tasks.`)) {
            deleteStatus(status.id);
        }
    };

    return (
        <div className="flex flex-col w-[86vw] sm:w-80 md:w-96 lg:w-[26rem] flex-shrink-0 h-full bg-card/80 border border-border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl group/column hover:border-primary/40 transition-all duration-300">
            <div className="p-3 sm:p-4 flex items-center justify-between border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    <h3 className="text-[11px] sm:text-xs font-black uppercase text-foreground tracking-widest leading-none truncate max-w-[120px] sm:max-w-[180px]">
                        {status.name}
                    </h3>
                    <span className="text-[10px] font-black text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md leading-none">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <CreateTaskDialog
                        projectId={projectId}
                        initialStatusId={status.id}
                        trigger={
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        }
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                            <DropdownMenuItem 
                                onClick={handleDeleteColumn}
                                className="text-[10px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <StrictModeDroppable droppableId={status.id}>
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
            </StrictModeDroppable>
        </div>
    );
};

export default KanbanColumn;
