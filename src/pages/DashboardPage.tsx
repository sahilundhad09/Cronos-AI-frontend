import { useState } from 'react';
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
    CheckCircle2,
    Clock,
    AlertTriangle,
    Calendar,
    Brain,
    BarChart3,
    Users,
    MessageSquare,
    Rocket,
    Flame
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import api from '@/services/api';
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import ProjectPulse from '@/components/project/ProjectPulse';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// ─── Stat Card ────────────────────────────────────────────────────────────────
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

// ─── Skeletons ────────────────────────────────────────────────────────────────
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

// ─── Completion Ring ──────────────────────────────────────────────────────────
const CompletionRing = ({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    const color = percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white">{percentage}%</span>
            </div>
        </div>
    );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, onClick, color }: { icon: any; label: string; onClick: () => void; color: string }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-${color}-500/30 hover:bg-${color}-500/5 transition-all group cursor-pointer`}
    >
        <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5" />
        </div>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors text-center leading-tight">{label}</span>
    </button>
);

// ─── Deadline Item ────────────────────────────────────────────────────────────
const DeadlineItem = ({ task, onClick }: { task: any; onClick: () => void }) => {
    const dueDate = new Date(task.due_date);
    const overdue = isPast(dueDate) && !task.completed_at;
    const dueToday = isToday(dueDate);
    const dueTomorrow = isTomorrow(dueDate);

    let urgencyColor = 'text-slate-400 border-white/5';
    let urgencyLabel = format(dueDate, 'MMM d');
    let urgencyIcon = <Calendar className="h-3.5 w-3.5" />;

    if (overdue) {
        urgencyColor = 'text-red-400 border-red-500/20 bg-red-500/5';
        urgencyLabel = 'Overdue';
        urgencyIcon = <AlertTriangle className="h-3.5 w-3.5" />;
    } else if (dueToday) {
        urgencyColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
        urgencyLabel = 'Today';
        urgencyIcon = <Flame className="h-3.5 w-3.5" />;
    } else if (dueTomorrow) {
        urgencyColor = 'text-orange-400 border-orange-500/20 bg-orange-500/5';
        urgencyLabel = 'Tomorrow';
        urgencyIcon = <Clock className="h-3.5 w-3.5" />;
    }

    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-3 rounded-xl border ${urgencyColor} hover:bg-white/[0.02] transition-all cursor-pointer group`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${overdue ? 'bg-red-500/10' : dueToday ? 'bg-amber-500/10' : 'bg-white/5'}`}>
                    {urgencyIcon}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{task.title}</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{task.project?.name || 'Project'}</p>
                </div>
            </div>
            <div className={`flex-shrink-0 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${urgencyColor}`}>
                {urgencyLabel}
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━ DASHBOARD PAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    // Fetch User Performance
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

    // Derive upcoming deadlines from pending tasks
    const upcomingDeadlines = (userPerformance?.pendingTasks || [])
        .filter((t: any) => t.due_date)
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);

    const overdueCount = upcomingDeadlines.filter((t: any) => isPast(new Date(t.due_date))).length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
                {/* ─── Header ─────────────────────────────────────────────── */}
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
                        <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] hidden sm:flex" onClick={() => navigate('/analytics')}>
                            <BarChart3 className="mr-2 h-4 w-4" /> Analytics
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

                {/* ─── Quick Actions ──────────────────────────────────────── */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <motion.div variants={itemVariants}>
                        <QuickAction icon={Plus} label="New Project" onClick={() => { }} color="cyan" />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <QuickAction icon={Brain} label="AI Chat" onClick={() => navigate('/ai-chat')} color="purple" />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <QuickAction icon={BarChart3} label="Analytics" onClick={() => navigate('/analytics')} color="emerald" />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <QuickAction icon={Users} label="Team" onClick={() => navigate('/team')} color="amber" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="hidden lg:block">
                        <QuickAction icon={Target} label="Projects" onClick={() => navigate('/projects')} color="cyan" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="hidden lg:block">
                        <QuickAction icon={MessageSquare} label="AI Chat" onClick={() => navigate('/ai-chat')} color="teal" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="hidden lg:block">
                        <QuickAction icon={Rocket} label="Deploy" onClick={() => { }} color="indigo" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="hidden lg:block">
                        <QuickAction icon={Zap} label="Quick Task" onClick={() => { }} color="rose" />
                    </motion.div>
                </motion.div>

                {/* ─── Stats Grid ─────────────────────────────────────────── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
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

                {/* ─── Main Content Grid ──────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Active Projects */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-heading font-black tracking-tight uppercase italic flex items-center gap-2">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projectsLoading ? (
                                    [1, 2, 3, 4].map((i) => <ProjectCardSkeleton key={i} />)
                                ) : projectsData && projectsData.length > 0 ? (
                                    projectsData.map((project: any) => (
                                        <Card
                                            key={project.id}
                                            className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden cursor-pointer"
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                        >
                                            <CardContent className="p-5 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="bg-white/5 p-2 rounded-lg">
                                                        <Layers className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                                    </div>
                                                    <div className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">
                                                        {project.status || 'Active'}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-heading font-black text-white group-hover:text-cyan-400 transition-colors truncate">{project.name}</h3>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight line-clamp-1">{project.description || 'No description provided'}</p>
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                        <span>Progress</span>
                                                        <span>{project.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progress || 0}%` }}
                                                            transition={{ duration: 1, delay: 0.3 }}
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                                        />
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

                        {/* Pending Tasks */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-heading font-black tracking-tight uppercase italic flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-emerald-400" /> Assigned <span className="text-slate-500">Milestones</span>
                                </h2>
                                {userPerformance?.pendingTasks?.length > 0 && (
                                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                                        {userPerformance.pendingTasks.length} Pending
                                    </span>
                                )}
                            </div>
                            <div className="grid gap-3">
                                {userPerformance?.pendingTasks && userPerformance.pendingTasks.length > 0 ? (
                                    userPerformance.pendingTasks.map((task: any) => (
                                        <Card
                                            key={task.id}
                                            className="bg-[#0A0D18] border-white/5 hover:border-emerald-500/30 transition-all group overflow-hidden cursor-pointer"
                                            onClick={() => navigate(`/projects/${task.project_id}`)}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#030408] transition-all flex-shrink-0">
                                                        <Bot size={18} />
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{task.title}</h4>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Sector: {task.project?.name || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    {task.due_date && (
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isPast(new Date(task.due_date)) ? 'text-red-400 border-red-500/30 bg-red-500/5' :
                                                            isToday(new Date(task.due_date)) ? 'text-amber-400 border-amber-500/30 bg-amber-500/5' :
                                                                'text-slate-500 border-white/5'
                                                            }`}>
                                                            {isPast(new Date(task.due_date)) ? 'Overdue' :
                                                                isToday(new Date(task.due_date)) ? 'Today' :
                                                                    format(new Date(task.due_date), 'MMM d')}
                                                        </span>
                                                    )}
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
                                    <div className="py-10 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500/30 mx-auto mb-2" />
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">All clear — no pending objectives</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="space-y-6">

                        {/* Personal Performance Ring */}
                        <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" /> Personal Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="flex items-center gap-6">
                                    <CompletionRing percentage={userPerformance?.completionRate || 0} />
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-2xl font-black text-white">{userPerformance?.tasksCompleted || 0}<span className="text-slate-600 text-sm">/{userPerformance?.tasksAssigned || 0}</span></p>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tasks Done</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-sm font-black text-white">{userPerformance?.onTimeDelivery || 0}%</p>
                                                <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">On-Time</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{userPerformance?.averageCompletionTime || 0}d</p>
                                                <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Avg Time</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Deadlines */}
                        <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-amber-400" /> Deadline Tracker
                                    </CardTitle>
                                    {overdueCount > 0 && (
                                        <span className="text-[8px] font-black bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">
                                            {overdueCount} overdue
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-2">
                                {upcomingDeadlines.length > 0 ? (
                                    upcomingDeadlines.map((task: any) => (
                                        <DeadlineItem
                                            key={task.id}
                                            task={task}
                                            onClick={() => navigate(`/projects/${task.project_id}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-6 text-center">
                                        <Clock className="h-5 w-5 text-slate-700 mx-auto mb-2" />
                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">No upcoming deadlines</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Assistant Card */}
                        <Card className="bg-gradient-to-br from-[#0A0D18] to-[#0D1222] border border-cyan-500/20 shadow-2xl shadow-cyan-500/5 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-all" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-heading font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-cyan-500" /> Neural Assistant
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                    {userPerformance?.pendingTasks?.length > 0
                                        ? `"Operator, you have ${userPerformance.pendingTasks.length} pending tasks. ${overdueCount > 0 ? `⚠️ ${overdueCount} are overdue!` : 'Focus on high-priority items first.'}" `
                                        : '"Neural circuits idle. Initialize a project or invite specialists to begin synchronization protocols."'}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAnalyzeWorkspace}
                                        disabled={isAnalyzing}
                                        className="flex-1 bg-cyan-500/10 hover:bg-cyan-500 hover:text-[#030408] text-cyan-400 font-black h-9 rounded-xl text-[9px] uppercase tracking-widest transition-all border border-cyan-500/20 gap-1"
                                    >
                                        {isAnalyzing ? (
                                            <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><Brain className="h-3 w-3" /> Analyze</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/ai-chat')}
                                        variant="outline"
                                        className="border-white/10 text-white font-black h-9 rounded-xl text-[9px] uppercase tracking-widest hover:border-cyan-500/30 gap-1"
                                    >
                                        <MessageSquare className="h-3 w-3" /> Chat
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Project Pulse Widget */}
                        {projectsData && projectsData.length > 0 && (
                            <ProjectPulse projectId={projectsData[0].id} />
                        )}

                        {/* AI Analysis Result */}
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
                                <CardContent className="p-5">
                                    <div className="prose prose-invert prose-xs max-w-none text-slate-300">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 text-xs text-slate-400 leading-relaxed">{children}</p>,
                                                strong: ({ children }) => <strong className="text-cyan-400 font-black">{children}</strong>,
                                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="text-xs text-slate-400">{children}</li>,
                                                h1: ({ children }) => <h1 className="text-sm font-black text-white mb-2">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-xs font-black text-white mb-1.5">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-xs font-black text-white mb-1">{children}</h3>,
                                            }}
                                        >
                                            {analysisResult}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Activity Stream */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-heading font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                <ActivityIcon className="h-3.5 w-3.5 text-emerald-500" /> Live Feed
                            </h3>
                            <div className="space-y-4 border-l border-white/5 ml-3 pl-5 relative min-h-[80px]">
                                {analyticsLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
                                ) : analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                                    analytics.recentActivity.map((activity: any) => (
                                        <div key={activity.id || Math.random()} className="relative">
                                            <div className="absolute -left-[1.39rem] top-1 w-2 h-2 rounded-full bg-cyan-500/50 border border-[#030408]" />
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] text-white font-bold leading-tight">
                                                    <span className="text-cyan-400">@{activity.actor?.name?.split(' ')[0] || 'System'}</span>{' '}
                                                    {activity.description || activity.action?.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">
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
