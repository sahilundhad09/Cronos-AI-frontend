import React, { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useQueryClient } from '@tanstack/react-query';

interface CreateProjectDialogProps {
    trigger?: React.ReactNode;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ trigger }) => {
    const queryClient = useQueryClient();
    const { activeWorkspace } = useWorkspaceStore();
    const { createProject, isLoading } = useProjectStore();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspace) return;

        try {
            await createProject(activeWorkspace.id, {
                name,
                description
            });

            // Invalidate dashboard and project queries
            queryClient.invalidateQueries({ queryKey: ['workspace-projects', activeWorkspace.id] });
            queryClient.invalidateQueries({ queryKey: ['workspace-analytics', activeWorkspace.id] });

            setIsOpen(false);
            setName('');
            setDescription('');
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20">
                        <Plus className="mr-2 h-4 w-4" /> Initialize Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                        New <span className="text-cyan-400">Orchestration</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        Define the parameters for your next mission
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-8">
                        <div className="space-y-2">
                            <Label htmlFor="p-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Name</Label>
                            <Input
                                id="p-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-cyan-500/50 transition-all font-bold"
                                placeholder="e.g. Operation Void"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p-desc" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Objective (Optional)</Label>
                            <Input
                                id="p-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-cyan-500/50 transition-all font-bold"
                                placeholder="Define mission focus..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-500/20"
                        >
                            {isLoading ? 'Processing...' : 'Deploy Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { CreateProjectDialog };
export default CreateProjectDialog;
