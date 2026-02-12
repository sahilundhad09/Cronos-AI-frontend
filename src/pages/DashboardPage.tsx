import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Target,
    TrendingUp,
    Plus,
    ArrowUpRight,
    Bot,
    Layers,
    Activity as ActivityIcon,
    AlertCircle,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { useNavigate } from 'react-router-dom';

const DashboardStatCard = ({ label, value, trend, icon, color, isLoading }: { label: string; value: string; trend: string; icon: React.ReactNode; color: string; isLoading?: boolean }) => (
    <Card className="bg-[#0A0D18] border-white/5 hover:border-white/10 transition-all duration-300 group">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg group-hover:bg-cyan-500 group-hover:text-[#030408] transition-all cursor-pointer">
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </div>
            <div className="space-y-1">
                {isLoading ? (
                    <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg mb-1" />
                ) : (
                    <h3 className="text-3xl font-heading font-black text-white tracking-tighter">{value}</h3>
                )}
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-slate-700' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest truncate">{isLoading ? 'Syncing...' : trend}</span>
            </div>
        </CardContent>
    </Card>
);

const ProjectCardSkeleton = () => (
    <Card className="bg-[#0A0D18] border-white/5 animate-pulse">
        <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div className="bg-white/5 h-9 w-9 rounded-lg" />
                <div className="h-5 w-16 bg-white/5 rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="h-6 w-3/4 bg-white/5 rounded-lg" />
                <div className="h-3 w-full bg-white/5 rounded-lg opacity-50" />
            </div>
            <div className="space-y-3 pt-2">
                <div className="h-2 w-full bg-white/5 rounded-full" />
            </div>
        </CardContent>
    </Card>
);

const ActivitySkeleton = () => (
    <div className="space-y-2 relative">
        <div className="absolute -left-[1.55rem] top-1.5 w-2 h-2 rounded-full bg-white/5" />
        <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
        <div className="h-2 w-20 bg-white/5 rounded animate-pulse" />
    </div>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [analysisResult, setAnalysisResult] = React.useState<string | null>(null);

    // Fetch User Performance (Pending Tasks)
    const { data: userPerformance } = useQuery({
        queryKey: ['user-performance', user?.id],
        queryFn: async () => {
            const response = await api.get('/users/me/performance');
            return response.data.data;
        },
        enabled: !!user,
    });

    // Fetch Workspace Analytics
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['workspace-analytics', activeWorkspace?.id],
        queryFn: async () => {
            if (!activeWorkspace) return null;
            const response = await api.get(`/workspaces/${activeWorkspace.id}/analytics`);
            return response.data.data;
        },
        enabled: !!activeWorkspace,
    });

    // Fetch Workspace Projects
    const { data: projectsData, isLoading: projectsLoading } = useQuery({
        queryKey: ['workspace-projects', activeWorkspace?.id],
        queryFn: async () => {
            if (!activeWorkspace) return null;
            const response = await api.get(`/workspaces/${activeWorkspace.id}/projects`, {
                params: { limit: 4 }
            });
            return response.data.data;
        },
        enabled: !!activeWorkspace,
    });

    const handleAnalyzeWorkspace = async () => {
        if (!activeWorkspace) return;
        setIsAnalyzing(true);
        try {
            const response = await api.get(`/workspaces/${activeWorkspace.id}/analyze`);
            setAnalysisResult(response.data.data.analysis);
        } catch (error) {
            console.error('Failed to analyze workspace', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (!activeWorkspace && !analyticsLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-6">
                    <AlertCircle className="h-12 w-12 text-slate-500 mb-4 mx-auto" />
                    <h2 className="text-2xl font-heading font-black text-white italic uppercase tracking-tighter">No Active <span className="text-cyan-400">Workspace</span></h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 max-w-xs">
                        Please select or initialize a neural command center to synchronize data.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-heading font-black tracking-tighter uppercase italic">
                            Neural <span className="text-cyan-400">Overview</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                            Welcome back, Operator {user?.name?.split(' ')[0]} // Status: {analyticsLoading ? 'Synchronizing...' : 'Optimal'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] hidden sm:flex">
                            Intelligence Report
                        </Button>
                        <CreateProjectDialog
                            trigger={
                                <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20">
                                    <Plus className="mr-2 h-4 w-4" /> New Project
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <DashboardStatCard
                        label="Active Projects"
                        value={analytics?.projectCount?.toString() || '0'}
                        trend="Synchronized from cloud"
                        icon={<Layers className="h-5 w-5" />}
                        color="cyan"
                        isLoading={analyticsLoading}
                    />
                    <DashboardStatCard
                        label="Progressing"
                        value={analytics?.statusBreakdown?.inProgress?.toString() || '0'}
                        trend={`${analytics?.statusBreakdown?.todo || 0} in backlog`}
                        icon={<Zap className="h-5 w-5" />}
                        color="teal"
                        isLoading={analyticsLoading}
                    />
                    <DashboardStatCard
                        label="Completed"
                        value={analytics?.statusBreakdown?.done?.toString() || '0'}
                        trend="Mission objectives met"
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        color="emerald"
                        isLoading={analyticsLoading}
                    />
                    <DashboardStatCard
                        label="Productivity"
                        value={`${analytics?.completionRate || 0}%`}
                        trend="Optimization protocol"
                        icon={<TrendingUp className="h-5 w-5" />}
                        color="indigo"
                        isLoading={analyticsLoading}
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Projects */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-heading font-black tracking-tight uppercase italic flex items-center gap-2">
                                    <Target className="h-5 w-5 text-cyan-400" /> Active <span className="text-slate-500">Orchestrations</span>
                                </h2>
                                <Button
                                    variant="link"
                                    className="text-cyan-500 font-bold uppercase text-[10px] tracking-widest italic"
                                    onClick={() => navigate('/projects')}
                                >
                                    View All
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projectsLoading ? (
                                    [1, 2, 3, 4].map((i) => <ProjectCardSkeleton key={i} />)
                                ) : projectsData && projectsData.length > 0 ? (
                                    projectsData.map((project: any) => (
                                        <Card
                                            key={project.id}
                                            className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden cursor-pointer"
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                        >
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="bg-white/5 p-2 rounded-lg">
                                                        <Layers className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                                    </div>
                                                    <div className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">
                                                        {project.status || 'Active'}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-heading font-black text-white group-hover:text-cyan-400 transition-colors truncate">{project.name}</h3>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight line-clamp-1">{project.description || 'No description provided'}</p>
                                                </div>
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                        <span>Protocol Sync</span>
                                                        <span>{project.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No projects initialized in this sector</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pending Tasks Section - The specialist's command hub */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-heading font-black tracking-tight uppercase italic flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-emerald-400" /> Assigned <span className="text-slate-500">Milestones</span>
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                {userPerformance?.pendingTasks && userPerformance.pendingTasks.length > 0 ? (
                                    userPerformance.pendingTasks.map((task: any) => (
                                        <Card
                                            key={task.id}
                                            className="bg-[#0A0D18] border-white/5 hover:border-emerald-500/30 transition-all group overflow-hidden cursor-pointer"
                                            onClick={() => navigate(`/projects/${task.project_id}`)}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#030408] transition-all">
                                                        <Bot size={18} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase italic">{task.title}</h4>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Sector: {task.project?.name || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-colors ${task.priority === 'urgent' ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                                                        task.priority === 'high' ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' :
                                                            'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                                                        }`}>
                                                        {task.priority || 'medium'}
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-slate-800 group-hover:text-emerald-400" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">No pending mission objectives assigned to your signature.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Utility / Activity Feed */}
                    <div className="space-y-8">
                        {/* AI Assistant Card */}
                        <Card className="bg-gradient-to-br from-[#0A0D18] to-[#0D1222] border border-cyan-500/20 shadow-2xl shadow-cyan-500/5 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-all" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-heading font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-cyan-500" /> Neural Assistant
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                    {userPerformance?.pendingTasks?.length > 0
                                        ? `"Operator, you have ${userPerformance.pendingTasks.length} pending tasks. Re-allocation suggests focusing on high-priority links first."`
                                        : '"Neural circuits idle. Initialize a project or invite specialists to begin synchronization protocols."'}
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleAnalyzeWorkspace}
                                        disabled={isAnalyzing}
                                        className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-[#030408] text-cyan-400 font-black h-10 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-cyan-500/20 gap-2"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" /> ANALYZING...
                                            </>
                                        ) : (
                                            'Analyze Workspace'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Analysis Result Display */}
                        {analysisResult && (
                            <Card className="bg-[#0A0D18] border-cyan-500/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                <CardHeader className="pb-2 border-b border-white/5 bg-cyan-500/5">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-[10px] font-heading font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap className="h-3 w-3" /> Intelligence Report
                                        </CardTitle>
                                        <button onClick={() => setAnalysisResult(null)} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Dismiss</button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="prose prose-invert prose-xs max-w-none prose-p:text-slate-400 prose-p:leading-relaxed prose-strong:text-cyan-400 prose-ul:list-disc prose-ul:pl-4 prose-li:text-slate-400 prose-li:mb-2 whitespace-pre-line text-xs font-medium">
                                        {analysisResult}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Activity Stream */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-heading font-black text-slate-400 uppercase italic tracking-widest flex items-center gap-2 px-2">
                                <ActivityIcon className="h-4 w-4 text-emerald-500" /> Data <span className="text-slate-600">Stream</span>
                            </h3>
                            <div className="space-y-5 border-l border-white/5 ml-4 pl-6 relative min-h-[100px]">
                                {analyticsLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
                                ) : analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                                    analytics.recentActivity.map((activity: any) => (
                                        <div key={activity.id || Math.random()} className="relative">
                                            <div className="absolute -left-[1.55rem] top-1.5 w-2 h-2 rounded-full bg-cyan-500/50 border border-[#030408]" />
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-white font-bold leading-tight">
                                                    <span className="text-cyan-400">@{activity.actor?.name.split(' ')[0] || 'System'}</span> {activity.description || activity.action?.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(activity.created_at || activity.timestamp))} ago
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic pl-2">Static Silence...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
