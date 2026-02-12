import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    Trash2,
    Clock,
    MoreVertical
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TeamPage = () => {
    const { activeWorkspace } = useWorkspaceStore();
    const queryClient = useQueryClient();
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [mutationError, setMutationError] = useState<string | null>(null);

    // Fetch members
    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: ['workspace-members', activeWorkspace?.id],
        queryFn: async () => {
            const response = await api.get(`/workspaces/${activeWorkspace?.id}/members`);
            return response.data.data;
        },
        enabled: !!activeWorkspace
    });

    // Fetch pending invitations
    const { data: invitations, isLoading: invitesLoading } = useQuery({
        queryKey: ['workspace-invitations', activeWorkspace?.id],
        queryFn: async () => {
            const response = await api.get(`/workspaces/${activeWorkspace?.id}/invitations`);
            return response.data.data;
        },
        enabled: !!activeWorkspace && (activeWorkspace.role === 'owner' || activeWorkspace.role === 'admin')
    });

    // Send invitation mutation
    const inviteMutation = useMutation({
        mutationFn: async (data: { email: string; role: string }) => {
            setMutationError(null);
            return api.post(`/workspaces/${activeWorkspace?.id}/invitations`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
            setIsInviteOpen(false);
            setInviteEmail('');
            setMutationError(null);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to transmit neural link. Connection interrupted.';
            setMutationError(message);
        }
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    };

    if (!activeWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-6 text-center">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-6 max-w-sm">
                    <Users className="h-12 w-12 text-slate-500 mb-4 mx-auto opacity-20" />
                    <h2 className="text-2xl font-heading font-black text-white italic uppercase tracking-tighter">Sector <span className="text-cyan-400">Offline</span></h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4 leading-relaxed">
                        No active workspace selected. Please initialize or switch to a command center to manage personnel.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-heading font-black tracking-tighter uppercase italic">
                        Team <span className="text-cyan-400">Nexus</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Managing personnel for workspace: {activeWorkspace?.name || 'Loading...'}
                    </p>
                </div>
                <PermissionGate roles={['owner', 'admin']}>
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20">
                                <UserPlus className="mr-2 h-4 w-4" /> Invite Specialist
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                                    Invite <span className="text-cyan-400">Member</span>
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                    Expand your neural network
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleInvite}>
                                <div className="grid gap-6 py-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:border-cyan-500/50 transition-all font-bold"
                                                placeholder="specialist@neural.net"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Clearance (Role)</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setInviteRole('member')}
                                                className={`p-4 rounded-xl border text-left transition-all ${inviteRole === 'member' ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                            >
                                                <p className="text-xs font-black uppercase">Member</p>
                                                <p className="text-[9px] font-bold opacity-60">Standard operational access</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInviteRole('admin')}
                                                className={`p-4 rounded-xl border text-left transition-all ${inviteRole === 'admin' ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                            >
                                                <p className="text-xs font-black uppercase">Admin</p>
                                                <p className="text-[9px] font-bold opacity-60">High-level sector command</p>
                                            </button>
                                        </div>
                                    </div>
                                    {mutationError && (
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                                            Error: {mutationError}
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={inviteMutation.isPending}
                                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-500/20"
                                    >
                                        {inviteMutation.isPending ? 'Sending Neural Link...' : 'Send Access Invitation'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PermissionGate>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personnel List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <Users className="h-5 w-5 text-cyan-500" />
                        <h2 className="text-xl font-heading font-black tracking-tight uppercase italic">Active <span className="text-slate-500">Personnel</span></h2>
                        <span className="ml-auto bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-white/5">{members?.length || 0} Total</span>
                    </div>

                    <Card className="bg-[#0A0D18] border-white/5">
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {membersLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl" />
                                            <div className="space-y-2">
                                                <div className="w-32 h-4 bg-white/5 rounded" />
                                                <div className="w-24 h-3 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                    ))
                                ) : members?.map((memberByRole: any) => (
                                    <div key={memberByRole.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 rounded-xl border border-white/5">
                                                    <AvatarImage src={memberByRole.User?.avatar_url} />
                                                    <AvatarFallback className="bg-cyan-500 text-[#030408] font-black">
                                                        {memberByRole.User?.name?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-[#0A0D18] ${memberByRole.role === 'owner' ? 'bg-amber-500' : memberByRole.role === 'admin' ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                                                    <Shield className="h-2 w-2 text-[#030408]" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                                    {memberByRole.User?.name} {memberByRole.User?.id === activeWorkspace?.owner_id && '(Primary Operator)'}
                                                </h3>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{memberByRole.User?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${memberByRole.role === 'owner' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : memberByRole.role === 'admin' ? 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' : 'border-slate-500/20 text-slate-500'}`}>
                                                    {memberByRole.role} Access
                                                </p>
                                            </div>
                                            <PermissionGate roles={['owner', 'admin']}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-[#0A0D18] border-white/5 text-white p-2">
                                                        <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest">Edit Clearance</DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem className="rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest">Revoke Access</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </PermissionGate>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invitations & Meta */}
                <div className="space-y-8">
                    {/* Role Info Card */}
                    <Card className="bg-gradient-to-br from-[#0A0D18] to-[#0D1222] border border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-heading font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                <Shield className="h-5 w-5 text-cyan-500" /> Hierarchy Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Owner: Full System Authority</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Admin: Management Privileges</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Member: Operational Level</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Invitations */}
                    <PermissionGate roles={['owner', 'admin']}>
                        <div className="space-y-6">
                            <h3 className="text-sm font-heading font-black text-slate-400 uppercase italic tracking-widest flex items-center gap-2 px-2">
                                <Clock className="h-4 w-4 text-cyan-500" /> Pending <span className="text-slate-600">Links</span>
                            </h3>
                            <div className="space-y-3">
                                {invitesLoading ? (
                                    Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 animate-pulse h-16" />
                                    ))
                                ) : invitations?.length > 0 ? (
                                    invitations.map((inv: any) => (
                                        <div key={inv.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 group hover:border-cyan-500/30 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-white font-bold">{inv.email}</p>
                                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{inv.role} Interface</p>
                                                </div>
                                                <button className="text-slate-600 hover:text-red-500 transition-colors">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-xl">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-wider">No pending transmissions</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </PermissionGate>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;
