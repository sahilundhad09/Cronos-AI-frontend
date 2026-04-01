import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    Settings,
    Brain,
    ChevronLeft,
    Activity,
    Target,
    LayoutDashboard,
    Shield,
    CheckCircle2,
    History,
    ChevronDown,
    ChevronRight,
    Trash2,
    MoreVertical,
    Settings2
    Sparkles
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KanbanBoard from '@/components/project/KanbanBoard';
import AIOrchestrator from '@/components/project/AIOrchestrator';
import { CreateTaskDialog } from '@/components/project/CreateTaskDialog';
import { ProjectInviteDialog } from '@/components/project/ProjectInviteDialog';
import { useAIStore } from '@/store/useAIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { useProjectSocket } from '@/hooks/useSocket';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AISuggestionsPanel from '@/components/project/AISuggestionsPanel';

const ProjectDetailsPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        projects,
        fetchProjects,
        projectMembers,
        fetchProjectMembers,
        projectInvitations,
        fetchProjectInvitations,
        acceptProjectInvitation,
        projectActivities,
        fetchProjectActivities,
        updateProject
    } = useProjectStore();
    const { activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();

    useProjectSocket(projectId);

    const [project, setProject] = useState<any>(null);
    const [showChat, setShowChat] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('kanban');
    const tabScrollRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { fetchGenerations } = useAIStore();
    const { tasks, statuses } = useTaskStore();
    const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

    const isCaptureMode = useMemo(() => {
        const q = new URLSearchParams(location.search || '');
        const normalized = new Set(['1', 'true', 'yes', 'full', 'on']);
        const captureValue = (q.get('capture') || '').toLowerCase();
        const screenshotValue = (q.get('screenshot') || '').toLowerCase();
        const fullshotValue = (q.get('fullshot') || '').toLowerCase();

        return (
            normalized.has(captureValue) ||
            normalized.has(screenshotValue) ||
            normalized.has(fullshotValue)
        );
    }, [location.search]);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUploadImage = async () => {
        if (!selectedFile || !projectId) return;

        setIsUploading(true);
        try {
            await useProjectStore.getState().uploadProjectImage(projectId, selectedFile);
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Failed to upload image', error);
        } finally {
            setIsUploading(false);
        }
    };

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Synchronizing neural link...</p>
                </div>
            </div>
        );
    }

    const isLead = project.your_role === 'lead' || activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin';

    const tabs = [
        { value: 'kanban',       label: 'Board',          icon: LayoutDashboard, iconClass: 'text-muted-foreground' },
        { value: 'orchestrator', label: 'AI Orchestrator', icon: Brain,           iconClass: 'text-primary'  },
        { value: 'team',         label: 'Specialists',     icon: Users,           iconClass: 'text-muted-foreground' },
        { value: 'activity',     label: 'Stream',          icon: Activity,        iconClass: 'text-emerald-400' },
    ].filter(t => t.value !== 'orchestrator' || isLead);

    const currentTab = [...tabs, { value: 'settings', label: 'Parameters', icon: Settings, iconClass: 'text-muted-foreground' }]
        .find(t => t.value === activeTab) ?? tabs[0];
    const CurrentIcon = currentTab.icon;

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ── Header ── */}
            <header className="border-b border-border bg-card/80 backdrop-blur-xl flex-shrink-0">
                <div className="px-3 sm:px-6 lg:px-8 pt-3 pb-4">

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="text-muted-foreground hover:text-foreground -ml-2 gap-1.5 font-bold uppercase text-[9px] tracking-widest mb-3 h-7 px-2"
                    >
                        <ChevronLeft className="h-3 w-3" /> Back to Fleet
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        {/* Project identity */}
                        <div className="flex items-start gap-4 min-w-0">
                            <div 
                                className="mt-0.5 w-14 h-14 rounded-2xl border flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-500 shadow-xl group/icon"
                                style={{ 
                                    backgroundColor: project.color ? `${project.color}15` : 'rgba(var(--primary),0.1)',
                                    borderColor: project.color ? `${project.color}30` : 'rgba(var(--primary),0.2)'
                                }}
                            >
                                {project.image_url ? (
                                    <img 
                                        src={project.image_url} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/icon:scale-110" 
                                    />
                                ) : (
                                    <Target 
                                        className="h-6 w-6 transition-colors duration-500" 
                                        style={{ color: project.color || 'var(--primary)' }}
                                    />
                                )}
                            </div>
                            <div className="min-w-0 space-y-1.5 pt-1">
                                <h1 className="text-xl sm:text-2xl lg:text-[1.85rem] font-heading font-black tracking-tighter uppercase italic text-foreground truncate leading-none">
                                    {project.name}
                                </h1>
                                <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-[0.15em] leading-relaxed line-clamp-1 max-w-xl opacity-70">
                                    {project.description || 'No primary objective defined for this orchestration.'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">

                            {/* Neural sync bar — md+ */}
                            <div className="hidden md:flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-primary/70 uppercase tracking-[0.2em] animate-pulse">Neural Sync</span>
                                    <span className="text-[10px] font-black text-foreground tabular-nums">{syncProgress}%</span>
                                </div>
                                <progress
                                    value={syncProgress}
                                    max={100}
                                    className="w-28 lg:w-36 h-[3px] overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-primary"
                                    title="Neural sync progress"
                                />
                            </div>

                            <div className="hidden md:block w-px h-5 bg-border" />

                            {/* Buttons */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {isLead && (
                                    <>
                                        <Button
                                            onClick={() => navigate(`/projects/${projectId}/settings`)}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 bg-muted/30 border-border hover:border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground font-black uppercase text-[9px] tracking-widest gap-1.5 transition-all rounded-lg"
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
                                    </>
                                )}

                                {isLead && <CreateTaskDialog projectId={projectId!} />}
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
                    <div className="border-b border-border px-4 sm:px-6 lg:px-8 flex-shrink-0 relative">

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
                                            text-muted-foreground data-[state=active]:text-foreground
                                            font-black uppercase text-[9px] tracking-widest
                                            transition-colors gap-1.5 hover:text-muted-foreground/80
                                            after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]
                                            after:bg-primary after:rounded-t-full after:scale-x-0
                                            data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200
                                        "
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                                {(activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin' || isLead) && (
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
                                <TabsTrigger
                                    value="insights"
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-12 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2"
                                >
                                    <Sparkles className="h-4 w-4 text-purple-500" /> AI Insights
                                </TabsTrigger>
                                <PermissionGate roles={['owner', 'admin']}>
                                    <TabsTrigger
                                        value="settings"
                                        className="
                                            relative flex-shrink-0 ml-auto
                                            bg-transparent border-0 rounded-none h-11 px-0
                                            text-muted-foreground data-[state=active]:text-foreground
                                            font-black uppercase text-[9px] tracking-widest
                                            transition-colors gap-1.5 hover:text-muted-foreground/80
                                            after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]
                                            after:bg-primary after:rounded-t-full after:scale-x-0
                                            data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200
                                        "
                                    >
                                        <Settings className="h-3.5 w-3.5" /> Parameters
                                    </TabsTrigger>
                                )}
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
                                <span className="text-foreground font-black uppercase text-[10px] tracking-widest flex-1 text-left">{currentTab.label}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Mobile dropdown */}
                        {mobileMenuOpen && (
                            <div className="absolute top-full left-0 right-0 z-30 bg-background border-b border-border shadow-2xl shadow-black/20 sm:hidden">
                                {tabs.map(({ value, label, icon: Icon, iconClass }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setActiveTab(value); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-l-2 transition-all ${
                                            activeTab === value
                                                ? 'border-l-primary bg-primary/[0.06] text-foreground'
                                                : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                        }`}
                                    >
                                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${activeTab === value ? iconClass : 'opacity-20'}`} />
                                        <span className="font-black uppercase text-[10px] tracking-widest">{label}</span>
                                        {activeTab === value && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
                                    </button>
                                ))}
                                {(activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin' || isLead) && (
                                    <button
                                        onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-l-2 transition-all ${
                                            activeTab === 'settings'
                                                ? 'border-l-primary bg-primary/[0.06] text-foreground'
                                                : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                        }`}
                                    >
                                        <Settings className={`h-3.5 w-3.5 flex-shrink-0 ${activeTab === 'settings' ? 'text-primary' : 'opacity-20'}`} />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Parameters</span>
                                        {activeTab === 'settings' && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content area */}
                    <div ref={tabScrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 min-h-0 capture-scroll" data-screenshot-scroll="true">
                        <div className="h-full w-full flex-1 flex flex-col min-h-0 pt-4 sm:pt-5 pb-4">

                            {/* Board */}
                            <TabsContent value="kanban" className="m-0 flex-1 flex flex-col min-h-0">
                                <KanbanBoard projectId={projectId!} isLead={isLead} />
                            </TabsContent>

                            {/* Orchestrator */}
                            <TabsContent value="orchestrator" className="m-0 flex-1 flex flex-col min-h-0">
                                <div className="w-full max-w-5xl mx-auto flex-1 min-h-0 mt-4">
                                    <AIOrchestrator projectId={projectId!} isActive={activeTab === 'orchestrator'} canInitialize={isLead} />
                                </div>
                            </TabsContent>

                            {/* Team */}
                            <TabsContent value="team" className="m-0 flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
                                
                                {/* Header */}
                                {isLead && (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-5 w-5 text-cyan-400" />
                                        </div>
                                        <div>
                                        <h2 className="text-lg font-heading font-black text-foreground uppercase italic tracking-tight leading-none">Specialists Assembly</h2>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1.5">{projectMembers.length} Active · Sector Personnel Management</p>
                                        </div>
                            <TabsContent value="insights" className="m-0 h-full overflow-y-auto custom-scrollbar w-full py-4">
                                <AISuggestionsPanel projectId={projectId!} />
                            </TabsContent>

                            <TabsContent value="team" className="m-0 flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-heading font-black text-white uppercase italic tracking-tighter">Active Personnel</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Specialists currently assigned to this mission sector</p>
                                    </div>
                                    <ProjectInviteDialog projectId={projectId!} />
                                    </div>
                                )}

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    
                                    {/* Active Personnel */}
                                    <div className={` ${projectInvitations.filter(i => i.status === 'pending').length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
                                    <div className="flex items-center gap-3 pl-4 border-l-2 border-primary/40">
                                        <div>
                                        <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em]">Active Personnel</h3>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            {projectMembers.length} Authorized Units Synced
                                        </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto capture-scroll" data-screenshot-scroll="true">
                                        {projectMembers.map((member) => (
                                        <Card
                                            key={member.id}
                                            className="group bg-card/40 border-primary/40 hover:border-primary/90 transition-all duration-300 rounded-2xl overflow-hidden pt-4"
                                        >
                                            <CardContent className="p-5 flex items-center gap-4">
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-12 w-12 rounded-xl border-2 border-border shadow-xl">
                                                <AvatarImage src={member.user?.avatar_url} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-black text-base italic">
                                                    {member.user?.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-background border border-border shadow-md">
                                                <Shield className="h-2.5 w-2.5 text-primary" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                                {member.user?.name}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate mt-0.5">
                                                {member.project_role || 'Specialist'}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] text-emerald-400/70 font-black uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                            {isLead && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-all opacity-0 group-hover:opacity-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground backdrop-blur-2xl p-1.5 rounded-xl min-w-[160px]">
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/projects/${projectId}/settings?tab=members`)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-foreground focus:text-foreground focus:bg-accent cursor-pointer rounded-lg h-9"
                                                    >
                                                        <Settings2 className="h-3.5 w-3.5 mr-2.5" /> Change Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => console.log('Remove member')}
                                                        className="text-[10px] font-black uppercase tracking-widest text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg h-9"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2.5" /> Revoke Access
                                                    </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            </CardContent>
                                        </Card>
                                        ))}
                                    </div>
                                    </div>

                                    {/* Pending Sidebar */}
                                    {isLead && projectInvitations.filter(i => i.status === 'pending').length > 0 && (
                                    <div className="lg:col-span-4 space-y-5 border-l border-border/40 lg:pl-8">
                                        <div className="flex items-center gap-3 pl-4 border-l-2 border-amber-500/30">
                                        <div>
                                            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em]">Awaiting Clearance</h3>
                                            <p className="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            {projectInvitations.filter(i => i.status === 'pending').length} Pending Authorizations
                                            </p>
                                        </div>
                                        </div>

                                        <div className="space-y-3">
                                        {projectInvitations.filter(i => i.status === 'pending').map((invite) => (
                                            <Card
                                            key={invite.id}
                                            className="group/invite bg-amber-500/[0.02] border border-amber-500/10 hover:border-amber-500/25 transition-all duration-300 rounded-2xl overflow-hidden"
                                            >
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center gap-3 pt-4">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/invite:text-amber-500/60 transition-colors">
                                                    <Users size={16} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-[11px] font-black text-foreground uppercase truncate tracking-tight">{invite.invitee?.user?.name || 'Inbound User'}</h4>
                                                    <p className="text-[9px] text-muted-foreground font-mono truncate mt-0.5">{invite.invitee?.user?.email}</p>
                                                </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                                                    <Shield className="h-2.5 w-2.5 text-amber-500/60" />
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wide">{invite.role}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Pending</span>
                                                </div>
                                                </div>
                                            </CardContent>
                                            </Card>
                                        ))}
                                        </div>
                                    </div>
                                    )}
                                </div>

                                {/* Invitation Acceptance Guard */}
                                {projectInvitations.some(i => i.invitee?.user?.id === user?.id && i.status === 'pending') && (
                                <div className="p-8 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/20 flex flex-col items-center gap-5 text-center animate-in zoom-in-95 duration-500 max-w-lg mx-auto">
                                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
                                    <Shield size={28} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base font-heading font-black text-foreground uppercase italic tracking-tight">Mission Authorization Required</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-xs mx-auto">
                                    You have been designated as a specialist. Confirm authorization to access project resources.
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
                                    className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black px-8 h-10 rounded-xl uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/30 gap-2 transition-all"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Confirm Authorization
                                </Button>
                                </div>
                                )}
                                </div>
                            </ScrollArea>
                            </TabsContent>

                            {/* Activity */}
                            <TabsContent value="activity" className="m-0 flex-1 min-h-0 pr-1">
                                <ScrollArea className="h-full w-full">
                                <div className="p-4 sm:p-6 md:p-8 space-y-5 w-full border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-heading font-black text-foreground uppercase italic tracking-tight">Mission Stream</h3>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Real-time chronicle of neural status transitions</p>
                                        </div>
                                        <History size={18} className="text-emerald-500/40 flex-shrink-0" />
                                    </div>

                                    <div className="space-y-2">
                                        {(projectActivities || []).length > 0 ? (
                                            (projectActivities || []).map((activity: any) => (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border border-l-4 border-l-primary/40 hover:border-l-primary hover:bg-accent/40 transition-all shadow-lg"
                                                >
                                                    <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center relative flex-shrink-0">
                                                        {activity.actor?.avatar_url ? (
                                                            <img src={activity.actor.avatar_url} alt={activity.actor.name} className="h-full w-full object-cover rounded-xl" />
                                                        ) : (
                                                            <span className="text-[11px] font-black text-primary">{activity.actor?.name?.charAt(0)}</span>
                                                        )}
                                                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-background rounded-full flex items-center justify-center">
                                                            <span className="h-2 w-2 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-[12px] text-foreground font-medium leading-snug">
                                                                <span className="text-primary font-black uppercase tracking-tighter">{activity.actor?.name}</span>
                                                                {' '}transitioned{' '}
                                                                <span className="text-foreground/90 font-bold">"{activity.meta?.task_title}"</span>
                                                            </p>
                                                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase flex-shrink-0 tabular-nums font-mono">
                                                                {format(new Date(activity.created_at), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-muted text-muted-foreground/60 border border-border line-through">
                                                                {activity.meta?.old_status}
                                                            </span>
                                                            <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-primary/15 text-primary border border-primary/20 shadow-[0_0_10px_hsl(var(--primary)/0.1)]">
                                                                {activity.meta?.new_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center bg-card border border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4">
                                                <Activity className="h-10 w-10 text-emerald-500/20" />
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-heading font-black text-muted-foreground uppercase italic tracking-[0.2em]">Neural Silence</h3>
                                                    <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">No activity detected in this sector yet.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </ScrollArea>
                            </TabsContent>

                            {/* Settings */}
                            <TabsContent value="settings" className={`m-0 flex-1 min-h-0 ${isCaptureMode ? 'screenshot-unlock' : ''}`}>
                                <ScrollArea
                                    className={isCaptureMode ? 'h-auto overflow-visible screenshot-unlock capture-scroll' : 'h-full'}
                                    data-screenshot-scroll="true"
                                >
                                    <div className={`p-4 sm:p-6 md:p-8 ${isCaptureMode ? 'max-w-4xl space-y-6' : 'max-w-2xl space-y-8'} mx-auto`}>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-heading font-black text-foreground uppercase italic tracking-[0.2em]">Mission Parameters</h3>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Recalibrating sector variables and access overrides...</p>
                                        </div>

                                        <div className="space-y-6">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                aria-label="Upload project emblem"
                                                className="hidden"
                                            />

                                            <div className="space-y-2.5">
                                                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground ml-1">Project Emblem</Label>
                                                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-border group/emblem">
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-24 h-24 rounded-2xl bg-card border border-primary/20 overflow-hidden flex items-center justify-center text-primary group-hover/emblem:border-primary/40 transition-all duration-500 shadow-xl">
                                                            {previewUrl ? (
                                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                            ) : project.image_url ? (
                                                                <img src={project.image_url} alt={project.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Target size={32} className="opacity-40" />
                                                            )}
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            <Activity size={14} />
                                                        </Button>
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <h4 className="text-[11px] font-black uppercase tracking-tight text-foreground">Mission Visual Identity</h4>
                                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed mt-1">
                                                                Define the operational emblem for sector identification. Best viewed at 256x256 resolutions.
                                                            </p>
                                                        </div>
                                                        {selectedFile && (
                                                            <div className="flex items-center gap-2 pt-1 animate-in slide-in-from-left-4 duration-300">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={handleUploadImage}
                                                                    disabled={isUploading}
                                                                    className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#030408] font-black uppercase text-[9px] tracking-widest px-4 shadow-lg shadow-emerald-500/20"
                                                                >
                                                                    {isUploading ? 'Linking...' : 'Confirm Sync'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                                    className="h-8 rounded-lg text-muted-foreground font-black uppercase text-[9px] tracking-widest hover:text-foreground"
                                                                >
                                                                    Discard
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Name</Label>
                                                    <Input 
                                                        value={project.name}
                                                        onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                                        className="bg-muted/40 border-border rounded-xl h-12 text-foreground font-bold"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Objective Description</Label>
                                                    <Textarea 
                                                        value={project.description || ''}
                                                        onChange={(e) => updateProject(project.id, { description: e.target.value })}
                                                        className="bg-muted/40 border-border rounded-xl min-h-[120px] text-foreground/90 font-bold"
                                                        placeholder="Define the core mission objective..."
                                                    />
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Color Signature</Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'].map((c) => (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    onClick={() => updateProject(project.id, { color: c })}
                                                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${project.color === c ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:border-primary/30'}`}
                                                                    style={{ backgroundColor: c }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border">
                                                            <Input 
                                                                type="color"
                                                                value={project.color || '#3B82F6'}
                                                                onChange={(e) => updateProject(project.id, { color: e.target.value })}
                                                                className="w-10 h-8 p-0 border-none bg-transparent cursor-pointer"
                                                            />
                                                            <span className="text-[10px] font-mono font-bold uppercase opacity-50">{project.color || '#3B82F6'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fleet Status</Label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {(['active', 'completed', 'archived'] as const).map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => updateProject(project.id, { status })}
                                                                className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                                    project.status === status 
                                                                        ? 'bg-primary/10 border-primary/50 text-primary' 
                                                                        : 'bg-muted/40 border-border text-muted-foreground hover:border-border/60'
                                                                }`}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-black text-red-500/80 uppercase tracking-widest">Danger Zone</h4>
                                                    <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tight">Irreversible sector purge protocols</p>
                                                </div>
                                                <Button variant="destructive" className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500/20 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white transition-all">
                                                    Purge Project Files
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                        </div>
                    </div>
                </Tabs>
            </main>

            {/* AI Chat panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[30rem] bg-card shadow-2xl shadow-black/60 border-l border-border transition-transform duration-300 ease-in-out z-50 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
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