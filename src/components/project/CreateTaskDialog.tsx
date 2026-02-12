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
import { Plus, Zap, Loader2 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface CreateTaskDialogProps {
    projectId: string;
    trigger?: React.ReactNode;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ projectId, trigger }) => {
    const queryClient = useQueryClient();
    const { activeWorkspace } = useWorkspaceStore();
    const { createTask, isLoading, statuses, fetchProjectStatuses } = useTaskStore();

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [statusId, setStatusId] = useState('');

    useEffect(() => {
        if (isOpen && statuses.length === 0) {
            fetchProjectStatuses(projectId);
        }
    }, [isOpen, projectId, statuses.length, fetchProjectStatuses]);

    useEffect(() => {
        if (statuses.length > 0 && !statusId) {
            setStatusId(statuses[0].id);
        }
    }, [statuses, statusId]);

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
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20">
                        <Plus className="mr-2 h-4 w-4" /> New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                        New <span className="text-cyan-400">Milestone</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        Initialize a manual orchestration link
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-8">
                        <div className="space-y-2">
                            <Label htmlFor="t-title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Title</Label>
                            <Input
                                id="t-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-cyan-500/50 transition-all font-bold"
                                placeholder="e.g. Implement Neural Interlink"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="t-desc" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                            <Textarea
                                id="t-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:border-cyan-500/50 transition-all font-bold"
                                placeholder="Define the task parameters..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</Label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 focus:border-cyan-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option value="low" className="bg-[#0A0D18]">LOW</option>
                                    <option value="medium" className="bg-[#0A0D18]">MEDIUM</option>
                                    <option value="high" className="bg-[#0A0D18]">HIGH</option>
                                    <option value="urgent" className="bg-[#0A0D18]">URGENT</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initial Column</Label>
                                <select
                                    value={statusId}
                                    onChange={(e) => setStatusId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 focus:border-cyan-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                    disabled={statuses.length === 0}
                                >
                                    {statuses.length === 0 ? (
                                        <option value="">SCANNING...</option>
                                    ) : (
                                        statuses.map(s => (
                                            <option key={s.id} value={s.id} className="bg-[#0A0D18]">{s.name.toUpperCase()}</option>
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
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-500/20 gap-3"
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
