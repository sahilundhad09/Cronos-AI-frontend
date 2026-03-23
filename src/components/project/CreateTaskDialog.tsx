import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Zap, Loader2, Sparkles } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useAIStore } from '@/store/useAIStore';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface CreateTaskDialogProps {
    projectId: string;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialStatusId?: string;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ 
    projectId, 
    trigger, 
    isOpen: controlledOpen, 
    onOpenChange: setControlledOpen,
    initialStatusId 
}) => {
    const queryClient = useQueryClient();
    const { activeWorkspace } = useWorkspaceStore();
    const { createTask, isLoading, statuses, fetchProjectStatuses } = useTaskStore();
    const { detailTask } = useAIStore();

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [statusId, setStatusId] = useState(initialStatusId || '');
    const [isDetailing, setIsDetailing] = useState(false);

    const handleAIDetail = async () => {
        if (!title.trim()) return;
        setIsDetailing(true);
        try {
            const detailed = await detailTask(projectId, title, description);
            setDescription(detailed);
        } catch (error) {
            console.error('AI Detailer error:', error);
        } finally {
            setIsDetailing(false);
        }
    };

    useEffect(() => {
        if (isOpen && statuses.length === 0) {
            fetchProjectStatuses(projectId);
        }
    }, [isOpen, projectId, statuses.length, fetchProjectStatuses]);

    useEffect(() => {
        if (statuses.length > 0 && !statusId) {
            setStatusId(initialStatusId || statuses[0].id);
        }
    }, [statuses, statusId, initialStatusId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createTask(projectId, {
                title,
                description,
                priority,
                status_id: statusId
            });

            // Invalidate analytics and dashboard queries
            if (activeWorkspace) {
                queryClient.invalidateQueries({ queryKey: ['workspace-analytics', activeWorkspace.id] });
            }

            setIsOpen(false);
            setTitle('');
            setDescription('');
            setPriority('medium');
        } catch (error) {
            console.error('Failed to create task', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                        New <span className="text-primary">Milestone</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                        Initialize a manual orchestration link
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-8">
                        <div className="space-y-2">
                            <Label htmlFor="t-title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Task Title</Label>
                            <Input
                                id="t-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-secondary/30 border-border rounded-xl h-12 focus:border-primary/50 transition-all font-bold"
                                placeholder="e.g. Implement Neural Interlink"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="t-desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Description</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleAIDetail}
                                    disabled={isDetailing || !title.trim()}
                                    className="h-6 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
                                >
                                    {isDetailing ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-3 w-3" />
                                    )}
                                    AI Detailer
                                </Button>
                            </div>
                            <Textarea
                                id="t-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-secondary/30 border-border rounded-xl min-h-[100px] focus:border-primary/50 transition-all font-bold"
                                placeholder="Define the task parameters..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Priority</Label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full bg-secondary/30 border border-border rounded-xl h-12 px-4 focus:border-primary/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option value="low" className="bg-card">LOW</option>
                                    <option value="medium" className="bg-card">MEDIUM</option>
                                    <option value="high" className="bg-card">HIGH</option>
                                    <option value="urgent" className="bg-card">URGENT</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Initial Column</Label>
                                <select
                                    value={statusId}
                                    onChange={(e) => setStatusId(e.target.value)}
                                    className="w-full bg-secondary/30 border border-border rounded-xl h-12 px-4 focus:border-primary/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                    disabled={statuses.length === 0}
                                >
                                    {statuses.length === 0 ? (
                                        <option value="">SCANNING...</option>
                                    ) : (
                                        statuses.map(s => (
                                            <option key={s.id} value={s.id} className="bg-card">{s.name.toUpperCase()}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading || !statusId}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> SYNCHRONIZING...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" /> INITIALIZE TASK
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { CreateTaskDialog };
export default CreateTaskDialog;
