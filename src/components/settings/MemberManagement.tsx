import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectInviteDialog } from '@/components/project/ProjectInviteDialog';

interface MemberManagementProps {
    projectId: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ projectId }) => {
    const projectMembers = useSettingsStore(state => state.projectMembers);
    const loadProjectMembers = useSettingsStore(state => state.loadProjectMembers);
    const updateProjectMemberRole = useSettingsStore(state => state.updateProjectMemberRole);
    const removeProjectMember = useSettingsStore(state => state.removeProjectMember);
    const isLoading = useSettingsStore(state => state.loadingStates.members);
    const isSaving = useSettingsStore(state => state.isSaving);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProjectMembers(projectId);
    }, [projectId, loadProjectMembers]);

    const handleRoleChange = async (memberId: string, newRole: string) => {
        try {
            await updateProjectMemberRole(projectId, memberId, newRole);
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove ${memberName} from this project?`
        );

        if (confirmed) {
            try {
                await removeProjectMember(projectId, memberId);
            } catch (error) {
                console.error('Failed to remove member:', error);
            }
        }
    };

    // Filter members by search query
    const filteredMembers = projectMembers.filter((member: any) =>
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base sm:text-lg font-heading font-black text-foreground uppercase tracking-tight">
                        Project Members
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        Manage who has access to this project
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <ProjectInviteDialog projectId={projectId} />
                </div>
            </div>

            {/* Search */}
            {projectMembers.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search members..."
                        className="pl-10 bg-secondary/30 border-border text-foreground"
                    />
                </div>
            )}

            {/* Members List */}
            <div className="bg-card/50 border border-border rounded-xl mt-4">
                {filteredMembers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic opacity-50">
                            {searchQuery ? 'Zero results in terminal' : 'No operatives in this sector'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredMembers.map((member: any) => (
                            <div
                                key={member.id}
                                className="p-3 sm:p-4 flex flex-col xs:flex-row xs:items-center justify-between hover:bg-secondary/20 transition-colors group gap-3 sm:gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-border/50 shrink-0">
                                        <AvatarImage src={member.user?.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {getInitials(member.user?.name || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-foreground font-bold text-sm tracking-tight truncate">{member.user?.name}</p>
                                        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70 truncate">{member.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-3 w-full xs:w-auto">
                                    <Select
                                        value={member.project_role}
                                        onValueChange={(newRole: string) => handleRoleChange(member.id, newRole)}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger className="w-full xs:w-28 sm:w-32 bg-secondary/30 border-border text-foreground h-9 xs:h-8 text-[10px] sm:text-[11px] font-black uppercase tracking-tight">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="lead" className="text-foreground text-[10px] sm:text-[11px] font-black uppercase tracking-tight">
                                                Lead
                                            </SelectItem>
                                            <SelectItem value="member" className="text-foreground text-[10px] sm:text-[11px] font-black uppercase tracking-tight">
                                                Member
                                            </SelectItem>
                                            <SelectItem value="viewer" className="text-foreground text-[10px] sm:text-[11px] font-black uppercase tracking-tight">
                                                Viewer
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.id, member.user?.name || 'this member')}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-9 w-9 xs:h-8 xs:w-8 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Member Count */}
            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center opacity-60">
                {projectMembers.length} {projectMembers.length === 1 ? 'operative' : 'operatives'} in this sector
            </div>
        </div>
    );
};
