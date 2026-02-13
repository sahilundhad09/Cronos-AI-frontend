import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Trash2,
    Loader2,
    Search,
    UserPlus,
    Mail,
    Shield,
    Clock,
    XCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface WorkspaceMemberManagementProps {
    workspaceId: string;
}

export const WorkspaceMemberManagement: React.FC<WorkspaceMemberManagementProps> = ({ workspaceId }) => {
    const workspaceMembers = useSettingsStore(state => state.workspaceMembers);
    const workspaceInvitations = useSettingsStore(state => state.workspaceInvitations);
    const loadWorkspaceMembers = useSettingsStore(state => state.loadWorkspaceMembers);
    const inviteWorkspaceMember = useSettingsStore(state => state.inviteWorkspaceMember);
    const updateWorkspaceMemberRole = useSettingsStore(state => state.updateWorkspaceMemberRole);
    const removeWorkspaceMember = useSettingsStore(state => state.removeWorkspaceMember);
    const loadWorkspaceInvitations = useSettingsStore(state => state.loadWorkspaceInvitations);
    const cancelInvitation = useSettingsStore(state => state.cancelInvitation);
    const isMembersLoading = useSettingsStore(state => state.loadingStates.members);
    const isInvitationsLoading = useSettingsStore(state => state.loadingStates.invitations);
    const isSaving = useSettingsStore(state => state.isSaving);

    const isLoading = isMembersLoading || isInvitationsLoading;

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

    useEffect(() => {
        if (workspaceId) {
            loadWorkspaceMembers(workspaceId);
            loadWorkspaceInvitations(workspaceId);
        }
    }, [workspaceId, loadWorkspaceMembers, loadWorkspaceInvitations]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        try {
            await inviteWorkspaceMember(workspaceId, inviteEmail, inviteRole);
            setIsInviteDialogOpen(false);
            setInviteEmail('');
            setInviteRole('member');
        } catch (error) {
            console.error('Failed to send invitation:', error);
        }
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        try {
            await updateWorkspaceMemberRole(workspaceId, memberId, newRole);
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove ${memberName} from this workspace? All their project access within this workspace will also be revoked.`
        );

        if (confirmed) {
            try {
                await removeWorkspaceMember(workspaceId, memberId);
            } catch (error) {
                console.error('Failed to remove member:', error);
            }
        }
    };

    const handleCancelInvite = async (invitationId: string, email: string) => {
        const confirmed = window.confirm(`Are you sure you want to cancel the invitation for ${email}?`);

        if (confirmed) {
            try {
                await cancelInvitation(workspaceId, invitationId);
            } catch (error) {
                console.error('Failed to cancel invitation:', error);
            }
        }
    };

    // Filter members by search query
    const filteredMembers = workspaceMembers.filter((member: any) =>
        member.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'admin':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'member':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (isLoading && workspaceMembers.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight">
                        Active Members
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage your team and their neural access levels
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10">
                            <DialogHeader>
                                <DialogTitle className="text-white font-heading font-black uppercase tracking-tight">
                                    Invite to Workspace
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Invite a new member to join your command center.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleInvite} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-black text-slate-400">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="colleague@example.com"
                                            className="pl-10 bg-slate-800/50 border-white/10 text-white"
                                            type="email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-black text-slate-400">
                                        Initial Role
                                    </Label>
                                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                                        <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10">
                                            <SelectItem value="member" className="text-white">Member - Standard access</SelectItem>
                                            <SelectItem value="admin" className="text-white">Admin - Workspace management</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsInviteDialogOpen(false)}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !inviteEmail}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Invitation'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="pl-10 bg-slate-900/50 border-white/10 text-white"
                />
            </div>

            {/* Members List */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl">
                {filteredMembers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 text-sm">
                            {searchQuery ? 'No members found matching your search.' : 'No active members yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredMembers.map((member: any) => (
                            <div
                                key={member.id}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white/10">
                                        <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white font-bold">
                                            {getInitials(member.user?.name || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium">{member.user?.name}</p>
                                            {member.role === 'owner' && (
                                                <Shield className="h-3 w-3 text-amber-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">{member.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select
                                        value={member.role}
                                        onValueChange={(newRole: string) => handleRoleChange(member.id, newRole)}
                                        disabled={isSaving || member.role === 'owner'}
                                    >
                                        <SelectTrigger className={`w-28 h-8 text-xs font-bold uppercase tracking-widest border-white/10 transition-all ${getRoleBadgeColor(member.role)}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10">
                                            <SelectItem value="owner" className="text-white text-xs disabled" disabled>Owner</SelectItem>
                                            <SelectItem value="admin" className="text-white text-xs">Admin</SelectItem>
                                            <SelectItem value="member" className="text-white text-xs">Member</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {member.role !== 'owner' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.id, member.user?.name || 'this member')}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invitations Section */}
            {workspaceInvitations.length > 0 && (
                <div className="space-y-4 pt-4">
                    <div>
                        <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight">
                            Pending Invitations
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Signals sent waiting for acknowledgement
                        </p>
                    </div>
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {workspaceInvitations.map((invite: any) => (
                                <div
                                    key={invite.id}
                                    className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{invite.email}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className={`text-[9px] uppercase tracking-tighter h-4 ${getRoleBadgeColor(invite.role)}`}>
                                                    {invite.role}
                                                </Badge>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold italic">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    Sent {new Date(invite.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase tracking-widest px-2 py-0.5">
                                            Pending
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCancelInvite(invite.id, invite.email)}
                                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
