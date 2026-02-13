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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight">
                        Project Members
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage who has access to this project
                    </p>
                </div>
                <ProjectInviteDialog projectId={projectId} />
            </div>

            {/* Search */}
            {projectMembers.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search members..."
                        className="pl-10 bg-slate-800/50 border-white/10 text-white"
                    />
                </div>
            )}

            {/* Members List */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl">
                {filteredMembers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 text-sm">
                            {searchQuery ? 'No members found matching your search.' : 'No members yet. Invite members to collaborate on this project.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredMembers.map((member: any) => (
                            <div
                                key={member.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white/10">
                                        <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white font-bold">
                                            {getInitials(member.user?.name || 'U')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-white font-medium">{member.user?.name}</p>
                                        <p className="text-xs text-slate-500">{member.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select
                                        value={member.project_role}
                                        onValueChange={(newRole: string) => handleRoleChange(member.id, newRole)}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger className="w-32 bg-slate-800/50 border-white/10 text-white h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10">
                                            <SelectItem value="lead" className="text-white text-xs">
                                                Lead
                                            </SelectItem>
                                            <SelectItem value="member" className="text-white text-xs">
                                                Member
                                            </SelectItem>
                                            <SelectItem value="viewer" className="text-white text-xs">
                                                Viewer
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.id, member.user?.name || 'this member')}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <div className="text-xs text-slate-500 text-center">
                {projectMembers.length} {projectMembers.length === 1 ? 'member' : 'members'} in this project
            </div>
        </div>
    );
};
