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
            loadWorkspaceInvitations(workspaceId, 'pending');
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
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/5';
            case 'admin':
                return 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5';
            case 'member':
                return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            default:
                return 'bg-muted/10 text-muted-foreground border-border';
        }
    };

    if (isLoading && workspaceMembers.length === 0) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-lg sm:text-xl font-heading font-black text-foreground uppercase tracking-tight italic">
                        Active Members
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-black mt-1.5">
                        Manage your team and their neural access levels
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6 sm:px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-heading font-black uppercase tracking-tight italic text-foreground">
                                    Invite to Workspace
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-xs font-semibold leading-relaxed">
                                    Invite a new member to join your command center. Access level determines neural interface capabilities.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleInvite} className="space-y-4 py-4">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                        <Input
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="colleague@example.com"
                                            className="pl-10.5 bg-secondary/30 border-border text-foreground h-11"
                                            type="email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground">
                                        Initial Role
                                    </Label>
                                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                                        <SelectTrigger className="bg-secondary/30 border-border text-foreground h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="member" className="text-foreground focus:bg-primary/10">Member - Standard access</SelectItem>
                                            <SelectItem value="admin" className="text-foreground focus:bg-primary/10">Admin - Workspace management</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter className="pt-6 sm:flex sm:justify-end gap-3 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsInviteDialogOpen(false)}
                                        className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest w-full sm:w-auto mb-2 sm:mb-0"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !inviteEmail}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-lg shadow-primary/20 w-full sm:w-auto"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Syncing...
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
            <div className="relative group/search">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within/search:text-primary transition-colors" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter team by name or identifier..."
                    className="pl-11 bg-secondary/30 border-border text-foreground h-12 focus:border-primary/50 transition-all font-semibold italic text-sm"
                />
            </div>

            {/* Members List */}
            <div className="bg-card/50 border border-border rounded-xl shadow-sm overflow-hidden">
                {filteredMembers.length === 0 ? (
                    <div className="p-8 sm:p-16 text-center">
                        <p className="text-muted-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] italic">
                            {searchQuery ? 'Zero matches found in terminal.' : 'No active members detected in this sector.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredMembers.map((member: any) => (
                            <div
                                key={member.id}
                                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-primary/[0.02] transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-11 w-11 border border-border shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary font-black uppercase tracking-tighter text-sm">
                                            {getInitials(member.user?.name || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-foreground font-black uppercase text-[13px] tracking-tight">{member.user?.name}</p>
                                            {member.role === 'owner' && (
                                                <Shield className="h-3 w-3 text-amber-500 shadow-sm" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-0.5 opacity-70">{member.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Select
                                        value={member.role}
                                        onValueChange={(newRole: string) => handleRoleChange(member.id, newRole)}
                                        disabled={isSaving || member.role === 'owner'}
                                    >
                                        <SelectTrigger className={`w-32 h-9 text-[10px] font-black uppercase tracking-widest border-border transition-all ${getRoleBadgeColor(member.role)}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="owner" className="text-foreground text-[10px] uppercase font-black disabled" disabled>Owner</SelectItem>
                                            <SelectItem value="admin" className="text-foreground text-[10px] uppercase font-black focus:bg-primary/10">Admin Access</SelectItem>
                                            <SelectItem value="member" className="text-foreground text-[10px] uppercase font-black focus:bg-primary/10">Standard Access</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {member.role !== 'owner' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.id, member.user?.name || 'this member')}
                                            className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all rounded-lg"
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
                <div className="space-y-6 pt-6">
                    <div>
                        <h2 className="text-xl font-heading font-black text-foreground uppercase tracking-tight italic">
                            Pending Invitations
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-black mt-1.5">
                            Active signals awaiting acknowledgement in the network
                        </p>
                    </div>
                    <div className="bg-card/30 border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-border">
                            {workspaceInvitations.map((invite: any) => (
                                <div
                                    key={invite.id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-primary/[0.01] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center shadow-inner">
                                            <Mail className="h-5 w-5 text-muted-foreground/40" />
                                        </div>
                                        <div>
                                            <p className="text-foreground font-black uppercase text-[13px] tracking-tight">{invite.email}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black h-4.5 px-2 ${getRoleBadgeColor(invite.role)}`}>
                                                    {invite.role}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5 font-bold uppercase tracking-tighter italic">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    Dispatched {new Date(invite.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] uppercase tracking-widest px-3 py-1 font-black italic">
                                            Pending
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCancelInvite(invite.id, invite.email)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
