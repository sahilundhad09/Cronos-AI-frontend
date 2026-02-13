import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, Loader2, Check, Users } from 'lucide-react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { Badge } from '@/components/ui/badge';

interface AssignTaskDialogProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

const AssignTaskDialog: React.FC<AssignTaskDialogProps> = ({ task, isOpen, onClose }) => {
    const { projectMembers, fetchProjectMembers } = useProjectStore();
    const { assignMembers, removeAssignee } = useTaskStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && task.project_id) {
            fetchProjectMembers(task.project_id);
        }
    }, [isOpen, task.project_id, fetchProjectMembers]);

    const isAssigned = (memberId: string) => {
        // memberId here is the project_member_id
        return task.assignees?.some((a: any) =>
            a.project_member_id === memberId ||
            a.id === memberId ||
            a.user?.id === memberId // Fallback for various data structures
        );
    };

    const handleToggleAssignment = async (memberId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (isAssigned(memberId)) {
                // Find the assignee ID to remove
                const assignee = task.assignees?.find((a: any) => a.project_member_id === memberId || a.id === memberId);
                if (assignee) {
                    await removeAssignee(task.id, assignee.id);
                }
            } else {
                await assignMembers(task.id, [memberId]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authorization Override Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                        Specialist <span className="text-cyan-400">Deployment</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        Assign personnel to mission sector: {task.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Users size={14} className="text-cyan-500" /> Project Roster
                            </h4>
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] uppercase font-black">
                                {projectMembers.length} Specialists Available
                            </Badge>
                        </div>

                        <div className="h-[300px] pr-2 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                {projectMembers.map((member) => {
                                    const assigned = isAssigned(member.id);
                                    return (
                                        <div
                                            key={member.id}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${assigned
                                                ? 'bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                                }`}
                                            onClick={() => !isLoading && handleToggleAssignment(member.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-cyan-400 font-bold overflow-hidden">
                                                        {member.user.avatar_url ? (
                                                            <img src={member.user.avatar_url} alt={member.user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span>{member.user.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{member.user.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-3 w-3 text-cyan-500" />
                                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{member.project_role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${assigned
                                                    ? 'bg-cyan-500 text-[#030408]'
                                                    : 'bg-white/5 text-slate-700 opacity-0 group-hover:opacity-100'
                                                    }`}>
                                                    {assigned ? <Check size={14} strokeWidth={4} /> : <UserPlus size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-white"
                    >
                        Close Link
                    </Button>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-[#0A0D18]/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-50">
                        <div className="flex flex-col items-center gap-3 text-cyan-500">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Updating Permissions...</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AssignTaskDialog;
