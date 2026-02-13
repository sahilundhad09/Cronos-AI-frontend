import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    Settings,
    Brain,
    ChevronLeft,
    Activity,
    Target,
    LayoutDashboard,
    Clock,
    Shield,
    CheckCircle2,
    History
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate } from '@/components/auth/PermissionGate';
import KanbanBoard from '@/components/project/KanbanBoard';
import AIOrchestrator from '@/components/project/AIOrchestrator';
import { CreateTaskDialog } from '@/components/project/CreateTaskDialog';
import { ProjectInviteDialog } from '@/components/project/ProjectInviteDialog';
import { useAIStore } from '@/store/useAIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { AIChatPanel } from '@/components/ai/AIChatPanel';

const ProjectDetailsPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const {
        projects,
        fetchProjects,
        projectMembers,
        fetchProjectMembers,
        projectInvitations,
        fetchProjectInvitations,
        acceptProjectInvitation,
        projectActivities,
        fetchProjectActivities
    } = useProjectStore();
    const { activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();

    const [project, setProject] = useState<any>(null);
    const [showChat, setShowChat] = useState(false);

    const { fetchGenerations } = useAIStore();
    const { tasks, statuses } = useTaskStore();
    const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

    // Calculate Neural Sync Progress
    const calculateSyncProgress = () => {
        if (tasks.length === 0) return 0;
        const doneStatusIds = statuses
            .filter(s => s.name.toLowerCase().includes('done') || s.name.toLowerCase().includes('completed'))
            .map(s => s.id);

        const completedTasks = tasks.filter(t => doneStatusIds.includes(t.status_id)).length;
        return Math.round((completedTasks / tasks.length) * 100);
    };

    const syncProgress = calculateSyncProgress();

    useEffect(() => {
        if (activeWorkspace) {
            fetchProjects(activeWorkspace.id);
        }
    }, [activeWorkspace, fetchProjects]);

    useEffect(() => {
        if (projectId) {
            fetchGenerations(projectId);
            fetchProjectMembers(projectId);
            fetchProjectInvitations(projectId);
            fetchProjectActivities(projectId);
        }
    }, [projectId, fetchGenerations, fetchProjectMembers, fetchProjectInvitations]);

    useEffect(() => {
        if (projects.length > 0 && projectId) {
            const found = projects.find(p => p.id === projectId);
            setProject(found);
        }
    }, [projects, projectId]);

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing neural link...</p>
                </div>
            </div>
        );
    }

    const isLead = project.your_role === 'lead' || activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin';

    return (
        <div className="h-full flex flex-col bg-[#030408] overflow-hidden">
            {/* Project Header */}
            <header className="border-b border-white/5 bg-[#030408]/50 backdrop-blur-xl px-6 py-4 flex-shrink-0">
                <div className="mx-auto space-y-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="text-slate-500 hover:text-white -ml-2 gap-2 font-bold uppercase text-[9px] tracking-widest"
                    >
                        <ChevronLeft className="h-3 w-3" /> Back to Fleet
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                    <Target className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h1 className="text-4xl font-heading font-black tracking-tighter uppercase italic text-white text-glow-cyan">
                                    {project.name}
                                </h1>
                            </div>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed max-w-2xl">
                                {project.description || 'No primary objective defined for this orchestration.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="flex items-center gap-2 mb-1 justify-end">
                                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] animate-pulse">Neural Sync</span>
                                    <span className="text-[10px] font-black text-white">{syncProgress}%</span>
                                </div>
                                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-1000 ease-out"
                                        style={{ width: `${syncProgress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => navigate(`/projects/${projectId}/settings`)}
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 bg-slate-800/50 border-white/10 hover:border-cyan-500/50 text-white font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Button>
                                <Button
                                    onClick={() => setShowChat(!showChat)}
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30 hover:border-cyan-500/50 text-white font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                                >
                                    <Brain className="h-4 w-4 text-purple-400" />
                                    AI Assistant
                                </Button>
                                <PermissionGate roles={['owner', 'admin']}>
                                    <CreateTaskDialog projectId={projectId!} />
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabbed Interface */}
            <main className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="kanban" className="flex-1 flex flex-col min-h-0">
                    <div className="border-b border-white/5 px-6 flex-shrink-0">
                        <div className="mx-auto">
                            <TabsList className="bg-transparent h-12 p-0 gap-6 justify-start">
                                <TabsTrigger
                                    value="kanban"
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-12 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" /> Board
                                </TabsTrigger>
                                <TabsTrigger
                                    value="orchestrator"
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-14 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                                >
                                    <Brain className="h-4 w-4 text-cyan-500" /> AI Orchestrator
                                </TabsTrigger>
                                <TabsTrigger
                                    value="team"
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-12 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                                >
                                    <Users className="h-4 w-4" /> Specialists
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-12 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                                >
                                    <Activity className="h-4 w-4 text-emerald-500" /> Stream
                                </TabsTrigger>
                                <PermissionGate roles={['owner', 'admin']}>
                                    <TabsTrigger
                                        value="settings"
                                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-12 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                                    >
                                        <Settings className="h-4 w-4" /> Parameters
                                    </TabsTrigger>
                                </PermissionGate>
                            </TabsList>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden px-6 min-h-0 flex flex-col">
                        <div className="h-full w-full flex-1 flex flex-col min-h-0">
                            <TabsContent value="kanban" className="m-0 flex-1 flex flex-col min-h-0">
                                <KanbanBoard projectId={projectId!} />
                            </TabsContent>

                            <TabsContent value="orchestrator" className="m-0 flex-1 flex flex-col min-h-0">
                                <AIOrchestrator projectId={projectId!} />
                            </TabsContent>

                            <TabsContent value="team" className="m-0 flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-heading font-black text-white uppercase italic tracking-tighter">Active Personnel</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Specialists currently assigned to this mission sector</p>
                                    </div>
                                    {isLead && <ProjectInviteDialog projectId={projectId!} />}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {projectMembers.map((member) => (
                                        <Card key={member.id} className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all group overflow-hidden">
                                            <CardContent className="p-5 flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/5 flex items-center justify-center text-cyan-400 font-black text-lg overflow-hidden relative">
                                                    {member.user.avatar_url ? (
                                                        <img src={member.user.avatar_url} alt={member.user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>{member.user.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{member.user.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-3 w-3 text-cyan-500" />
                                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{member.project_role}</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="border-white/5 text-[9px] font-black tracking-widest uppercase">
                                                    {member.workspace_role}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {isLead && projectInvitations.length > 0 && (
                                    <div className="space-y-6 mt-4">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-heading font-black text-white uppercase italic tracking-tighter">Pending Authorizations</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Awaiting sector entry confirmation from specialists</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {projectInvitations.filter(i => i.status === 'pending').map((invite) => (
                                                <Card key={invite.id} className="bg-white/[0.02] border-white/5 border-dashed relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2">
                                                        <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                                    </div>
                                                    <CardContent className="p-5 space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                                                                <Users size={18} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-white uppercase">{invite.invitee?.user?.name || 'Unknown User'}</h4>
                                                                <p className="text-[9px] text-slate-500 font-bold uppercase">{invite.invitee?.user?.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-3 w-3 text-cyan-500" />
                                                                <span className="text-[9px] text-slate-500 font-black uppercase">{invite.role}</span>
                                                            </div>
                                                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] uppercase font-black">pending</Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* User's own pending invites logic */}
                                {projectInvitations.some(i => i.invitee?.user?.id === user?.id && i.status === 'pending') && (
                                    <div className="p-8 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                            <Shield size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-heading font-black text-white uppercase italic tracking-tighter">Mission Authorization Detected</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-md">You have been invited to join this mission sector as a specialist. Confirm authorization to proceed.</p>
                                        </div>
                                        <Button
                                            onClick={async () => {
                                                const invite = projectInvitations.find(i => i.invitee?.user?.id === user?.id && i.status === 'pending');
                                                if (invite) {
                                                    await acceptProjectInvitation(projectId!, invite.id);
                                                    fetchNotifications();
                                                    fetchUnreadCount();
                                                }
                                            }}
                                            className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black px-10 h-12 rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20 gap-3"
                                        >
                                            <CheckCircle2 className="h-5 w-5" /> Confirm Authorization
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="activity" className="m-0 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-heading font-black text-white uppercase italic tracking-tighter text-glow-cyan">Mission Stream</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time chronicle of all neural status transitions</p>
                                        </div>
                                        <History size={20} className="text-cyan-500/50" />
                                    </div>

                                    <div className="space-y-3">
                                        {(projectActivities || []).length > 0 ? (
                                            (projectActivities || []).map((activity: any) => (
                                                <Card key={activity.id} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all border-l-2 border-l-cyan-500/30">
                                                    <CardContent className="p-4 flex items-center gap-4">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center relative flex-shrink-0">
                                                            {activity.actor?.avatar_url ? (
                                                                <img src={activity.actor.avatar_url} alt={activity.actor.name} className="h-full w-full object-cover rounded-lg" />
                                                            ) : (
                                                                <span className="text-[10px] font-black text-cyan-400">{activity.actor?.name.charAt(0)}</span>
                                                            )}
                                                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#030408] rounded-full flex items-center justify-center">
                                                                <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#06b6d4]" />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-baseline justify-between gap-4">
                                                                <p className="text-[11px] text-white font-bold leading-tight">
                                                                    <span className="text-cyan-400 underline decoration-cyan-500/20 underline-offset-2">{activity.actor?.name}</span>
                                                                    {" "}transferred mission unit{" "}
                                                                    <span className="italic text-slate-200">"{activity.meta?.task_title}"</span>
                                                                </p>
                                                                <span className="text-[8px] font-black text-slate-600 uppercase flex-shrink-0">
                                                                    {format(new Date(activity.created_at), 'HH:mm:ss')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-500 line-through decoration-slate-700 decoration-2">
                                                                    {activity.meta?.old_status}
                                                                </span>
                                                                <div className="h-px w-3 bg-slate-800" />
                                                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                                                    {activity.meta?.new_status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl h-full flex flex-col items-center justify-center">
                                                <Activity className="h-10 w-10 text-emerald-500/20 mx-auto mb-4" />
                                                <h3 className="text-lg font-heading font-black text-slate-500 uppercase italic tracking-widest">Neural Silence</h3>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">No activity detected in this mission sector yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="m-0 flex-1 min-h-0">
                                <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl h-full flex flex-col items-center justify-center">
                                    <Settings className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                                    <h3 className="text-lg font-heading font-black text-slate-500 uppercase italic tracking-widest">Mission Parameters</h3>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Configuring sector variables and access overrides...</p>
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </main>

            {/* AI Chat Sliding Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[28rem] bg-slate-900 shadow-2xl border-l border-white/10 transition-transform duration-300 ease-in-out z-50 ${showChat ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <AIChatPanel projectId={projectId!} onClose={() => setShowChat(false)} />
            </div>

            {/* Overlay when chat is open */}
            {showChat && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default ProjectDetailsPage;
