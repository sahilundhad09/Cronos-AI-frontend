import { useEffect, useRef, useState } from 'react';
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
    History,
    ChevronDown
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
import { useProjectSocket } from '@/hooks/useSocket';

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

    useProjectSocket(projectId);

    const [project, setProject] = useState<any>(null);
    const [showChat, setShowChat] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('kanban');
    const tabScrollRef = useRef<HTMLDivElement | null>(null);

    const { fetchGenerations } = useAIStore();
    const { tasks, statuses } = useTaskStore();
    const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

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
        if (activeWorkspace) fetchProjects(activeWorkspace.id);
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

    useEffect(() => {
        if (tabScrollRef.current) {
            tabScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab]);

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing neural link...</p>
                </div>
            </div>
        );
    }

    const isLead = project.your_role === 'lead' || activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin';

    const tabs = [
        { value: 'kanban',       label: 'Board',          icon: LayoutDashboard, iconClass: 'text-slate-400' },
        { value: 'orchestrator', label: 'AI Orchestrator', icon: Brain,           iconClass: 'text-cyan-400'  },
        { value: 'team',         label: 'Specialists',     icon: Users,           iconClass: 'text-slate-400' },
        { value: 'activity',     label: 'Stream',          icon: Activity,        iconClass: 'text-emerald-400' },
    ];

    const currentTab = [...tabs, { value: 'settings', label: 'Parameters', icon: Settings, iconClass: 'text-slate-400' }]
        .find(t => t.value === activeTab) ?? tabs[0];
    const CurrentIcon = currentTab.icon;

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ── Header ── */}
            <header className="border-b border-white/[0.06] bg-[#030408]/80 backdrop-blur-xl flex-shrink-0">
                <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-4">

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="text-slate-600 hover:text-slate-300 -ml-2 gap-1.5 font-bold uppercase text-[9px] tracking-widest mb-3 h-7 px-2"
                    >
                        <ChevronLeft className="h-3 w-3" /> Back to Fleet
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        {/* Project identity */}
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
                                <Target className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-heading font-black tracking-tighter uppercase italic text-white truncate leading-none">
                                    {project.name}
                                </h1>
                                <p className="text-slate-600 font-bold uppercase text-[9px] tracking-widest leading-relaxed line-clamp-1 max-w-xl">
                                    {project.description || 'No primary objective defined for this orchestration.'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">

                            {/* Neural sync bar — md+ */}
                            <div className="hidden md:flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-cyan-400/70 uppercase tracking-[0.2em] animate-pulse">Neural Sync</span>
                                    <span className="text-[10px] font-black text-white tabular-nums">{syncProgress}%</span>
                                </div>
                                <progress
                                    value={syncProgress}
                                    max={100}
                                    className="w-28 lg:w-36 h-[3px] overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-white/[0.06] [&::-webkit-progress-value]:bg-cyan-500 [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-cyan-500"
                                    title="Neural sync progress"
                                />
                            </div>

                            <div className="hidden md:block w-px h-5 bg-white/10" />

                            {/* Buttons */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={() => navigate(`/projects/${projectId}/settings`)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] text-slate-400 hover:text-white font-black uppercase text-[9px] tracking-widest gap-1.5 transition-all rounded-lg"
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Settings</span>
                                </Button>

                                <Button
                                    onClick={() => setShowChat(!showChat)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 bg-purple-500/[0.07] border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-500/[0.12] text-purple-300 hover:text-purple-200 font-black uppercase text-[9px] tracking-widest gap-1.5 transition-all rounded-lg"
                                >
                                    <Brain className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">AI Assistant</span>
                                </Button>

                                <PermissionGate roles={['owner', 'admin']}>
                                    <CreateTaskDialog projectId={projectId!} />
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main / Tabs ── */}
            <main className="flex-1 overflow-hidden flex flex-col min-h-0">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => { setActiveTab(v); setMobileMenuOpen(false); }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    {/* Tab bar */}
                    <div className="border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 flex-shrink-0 relative">

                        {/* Desktop */}
                        <div className="hidden sm:block">
                            <TabsList className="bg-transparent h-11 p-0 gap-0 justify-start w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
                                {tabs.map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="
                                            relative flex-shrink-0 mr-6 last:mr-0
                                            bg-transparent border-0 rounded-none h-11 px-0
                                            text-slate-600 data-[state=active]:text-white
                                            font-black uppercase text-[9px] tracking-widest
                                            transition-colors gap-1.5 hover:text-slate-400
                                            after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]
                                            after:bg-cyan-400 after:rounded-t-full after:scale-x-0
                                            data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200
                                        "
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                                <PermissionGate roles={['owner', 'admin']}>
                                    <TabsTrigger
                                        value="settings"
                                        className="
                                            relative flex-shrink-0 ml-auto
                                            bg-transparent border-0 rounded-none h-11 px-0
                                            text-slate-600 data-[state=active]:text-white
                                            font-black uppercase text-[9px] tracking-widest
                                            transition-colors gap-1.5 hover:text-slate-400
                                            after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]
                                            after:bg-cyan-400 after:rounded-t-full after:scale-x-0
                                            data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200
                                        "
                                    >
                                        <Settings className="h-3.5 w-3.5" /> Parameters
                                    </TabsTrigger>
                                </PermissionGate>
                            </TabsList>
                        </div>

                        {/* Mobile trigger */}
                        <div className="flex sm:hidden items-center h-11">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex items-center gap-2.5 w-full"
                                aria-label="Toggle section tabs"
                            >
                                <CurrentIcon className={`h-3.5 w-3.5 flex-shrink-0 ${currentTab.iconClass}`} />
                                <span className="text-white font-black uppercase text-[10px] tracking-widest flex-1 text-left">{currentTab.label}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Mobile dropdown */}
                        {mobileMenuOpen && (
                            <div className="absolute top-full left-0 right-0 z-30 bg-[#080C14] border-b border-white/[0.08] shadow-2xl shadow-black/60 sm:hidden">
                                {tabs.map(({ value, label, icon: Icon, iconClass }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-l-2 transition-all ${
                                            activeTab === value
                                                ? 'border-l-cyan-400 bg-cyan-500/[0.06] text-white'
                                                : 'border-l-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.025]'
                                        }`}
                                    >
                                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${activeTab === value ? iconClass : 'text-slate-700'}`} />
                                        <span className="font-black uppercase text-[10px] tracking-widest">{label}</span>
                                        {activeTab === value && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />}
                                    </button>
                                ))}
                                <PermissionGate roles={['owner', 'admin']}>
                                    <button
                                        onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-l-2 transition-all ${
                                            activeTab === 'settings'
                                                ? 'border-l-cyan-400 bg-cyan-500/[0.06] text-white'
                                                : 'border-l-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.025]'
                                        }`}
                                    >
                                        <Settings className={`h-3.5 w-3.5 flex-shrink-0 ${activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-700'}`} />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Parameters</span>
                                        {activeTab === 'settings' && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />}
                                    </button>
                                </PermissionGate>
                            </div>
                        )}
                    </div>

                    {/* Content area */}
                    <div ref={tabScrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 min-h-0">
                        <div className="h-full w-full flex-1 flex flex-col min-h-0 pt-4 sm:pt-5 pb-4">

                            {/* Board */}
                            <TabsContent value="kanban" className="m-0 flex-1 flex flex-col min-h-0">
                                <KanbanBoard projectId={projectId!} />
                            </TabsContent>

                            {/* Orchestrator */}
                            <TabsContent value="orchestrator" className="m-0 flex-1 flex flex-col min-h-0">
                                <div className="w-full max-w-5xl mx-auto flex-1 min-h-0">
                                    <AIOrchestrator projectId={projectId!} isActive={activeTab === 'orchestrator'} />
                                </div>
                            </TabsContent>

                            {/* Team */}
                            <TabsContent value="team" className="m-0 flex-1 flex flex-col gap-6 pr-1">

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-heading font-black text-white uppercase italic tracking-tight">Active Personnel</h3>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Specialists currently assigned to this mission sector</p>
                                    </div>
                                    {isLead && <ProjectInviteDialog projectId={projectId!} />}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {projectMembers.map((member) => (
                                        <Card key={member.id} className="bg-white/[0.025] border-white/[0.06] hover:border-cyan-500/25 hover:bg-white/[0.04] transition-all duration-300 group overflow-hidden">
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-white/[0.06] flex items-center justify-center text-cyan-400 font-black text-sm overflow-hidden">
                                                    {member.user.avatar_url ? (
                                                        <img src={member.user.avatar_url} alt={member.user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>{member.user.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate">{member.user.name}</h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Shield className="h-2.5 w-2.5 text-cyan-500/60 flex-shrink-0" />
                                                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest truncate">{member.project_role}</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="border-white/[0.06] text-[8px] font-black tracking-widest uppercase flex-shrink-0 text-slate-600">
                                                    {member.workspace_role}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {isLead && projectInvitations.filter(i => i.status === 'pending').length > 0 && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-heading font-black text-white uppercase italic tracking-tight">Pending Authorizations</h3>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Awaiting sector entry confirmation from specialists</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {projectInvitations.filter(i => i.status === 'pending').map((invite) => (
                                                <Card key={invite.id} className="bg-white/[0.02] border border-dashed border-amber-500/20 relative overflow-hidden">
                                                    <div className="absolute top-2.5 right-2.5">
                                                        <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                                                    </div>
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-500">
                                                                <Users size={15} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-[11px] font-bold text-white uppercase truncate">{invite.invitee?.user?.name || 'Unknown User'}</h4>
                                                                <p className="text-[8px] text-slate-600 font-bold uppercase truncate">{invite.invitee?.user?.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                                                            <div className="flex items-center gap-1.5">
                                                                <Shield className="h-2.5 w-2.5 text-cyan-500/60" />
                                                                <span className="text-[8px] text-slate-600 font-black uppercase">{invite.role}</span>
                                                            </div>
                                                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[8px] uppercase font-black">pending</Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {projectInvitations.some(i => i.invitee?.user?.id === user?.id && i.status === 'pending') && (
                                    <div className="p-6 sm:p-8 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/20 flex flex-col items-center gap-5 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                            <Shield size={24} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="text-lg sm:text-xl font-heading font-black text-white uppercase italic tracking-tight">Mission Authorization Detected</h3>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto">
                                                You have been invited to join this mission sector as a specialist. Confirm authorization to proceed.
                                            </p>
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
                                            className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black px-8 h-10 rounded-xl uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20 gap-2 w-full sm:w-auto transition-all"
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> Confirm Authorization
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Activity */}
                            <TabsContent value="activity" className="m-0 flex-1 min-h-0 pr-1">
                                <div className="space-y-5 max-w-3xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-heading font-black text-white uppercase italic tracking-tight">Mission Stream</h3>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Real-time chronicle of neural status transitions</p>
                                        </div>
                                        <History size={18} className="text-emerald-500/40 flex-shrink-0" />
                                    </div>

                                    <div className="space-y-2">
                                        {(projectActivities || []).length > 0 ? (
                                            (projectActivities || []).map((activity: any) => (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] border-l-2 border-l-cyan-500/25 hover:border-l-cyan-400/50 hover:bg-white/[0.035] transition-all"
                                                >
                                                    <div className="h-7 w-7 rounded-lg bg-slate-800/80 border border-white/[0.06] flex items-center justify-center relative flex-shrink-0 mt-0.5">
                                                        {activity.actor?.avatar_url ? (
                                                            <img src={activity.actor.avatar_url} alt={activity.actor.name} className="h-full w-full object-cover rounded-lg" />
                                                        ) : (
                                                            <span className="text-[9px] font-black text-cyan-400">{activity.actor?.name?.charAt(0)}</span>
                                                        )}
                                                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-[#030408] rounded-full flex items-center justify-center">
                                                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-[11px] text-white/80 font-medium leading-snug">
                                                                <span className="text-cyan-400 font-bold">{activity.actor?.name}</span>
                                                                {' '}moved{' '}
                                                                <span className="italic text-white/90">"{activity.meta?.task_title}"</span>
                                                            </p>
                                                            <span className="text-[8px] font-black text-slate-700 uppercase flex-shrink-0 tabular-nums mt-0.5">
                                                                {format(new Date(activity.created_at), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-600 line-through">
                                                                {activity.meta?.old_status}
                                                            </span>
                                                            <span className="text-slate-700 text-xs">→</span>
                                                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                                {activity.meta?.new_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center justify-center gap-3">
                                                <Activity className="h-8 w-8 text-emerald-500/15" />
                                                <div>
                                                    <h3 className="text-sm font-heading font-black text-slate-600 uppercase italic tracking-widest">Neural Silence</h3>
                                                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-1">No activity detected in this sector yet.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Settings */}
                            <TabsContent value="settings" className="m-0 flex-1 min-h-0">
                                <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.06] rounded-2xl h-full flex flex-col items-center justify-center gap-3">
                                    <Settings className="h-9 w-9 text-slate-800" />
                                    <div>
                                        <h3 className="text-sm font-heading font-black text-slate-600 uppercase italic tracking-widest">Mission Parameters</h3>
                                        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-1">Configuring sector variables and access overrides...</p>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </div>
                </Tabs>
            </main>

            {/* AI Chat panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[30rem] bg-[#080C18] shadow-2xl shadow-black/60 border-l border-white/[0.06] transition-transform duration-300 ease-in-out z-50 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                <AIChatPanel projectId={projectId!} onClose={() => setShowChat(false)} />
            </div>

            {showChat && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default ProjectDetailsPage;