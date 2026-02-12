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
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, Shield, Users } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import api from '@/services/api';

interface ProjectInviteDialogProps {
    projectId: string;
}

const ProjectInviteDialog: React.FC<ProjectInviteDialogProps> = ({ projectId }) => {
    const { activeWorkspace } = useWorkspaceStore();
    const { inviteToProject, fetchProjectInvitations } = useProjectStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [role, setRole] = useState<'lead' | 'member' | 'viewer'>('member');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && activeWorkspace) {
            fetchWorkspaceMembers();
        }
    }, [isOpen, activeWorkspace]);

    const fetchWorkspaceMembers = async () => {
        try {
            const response = await api.get(`/workspaces/${activeWorkspace?.id}/members`);
            setWorkspaceMembers(response.data.data);
        } catch (err) {
            console.error('Failed to fetch workspace members', err);
        }
    };

    const handleInvite = async () => {
        if (!selectedMemberId) return;
        setIsLoading(true);
        setError(null);
        try {
            await inviteToProject(projectId, selectedMemberId, role);
            await fetchProjectInvitations(projectId);
            setIsOpen(false);
            setSelectedMemberId('');
            setRole('member');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Specialist
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                        Project <span className="text-cyan-400">Expansion</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        Authorize a specialist to join this mission orchestration
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-8">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Users size={14} className="text-cyan-500" /> Workspace Personnel
                        </Label>
                        <select
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 focus:border-cyan-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-[#0A0D18]">SELECT SPECIALIST...</option>
                            {workspaceMembers.map((member) => (
                                <option key={member.id} value={member.id} className="bg-[#0A0D18]">
                                    {member.user.name} ({member.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Shield size={14} className="text-cyan-500" /> Mission Clearance
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['lead', 'member', 'viewer'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${role === r
                                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleInvite}
                        disabled={isLoading || !selectedMemberId}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-500/20 gap-3"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> AUTHORIZING...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" /> SEND MISSION INVITE
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export { ProjectInviteDialog };
export default ProjectInviteDialog;
