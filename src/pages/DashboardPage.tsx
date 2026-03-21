import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Target, TrendingUp, Plus, ArrowUpRight, Bot, Layers,
    Activity as ActivityIcon, AlertCircle, Loader2, CheckCircle2,
    Clock, AlertTriangle, Calendar, Brain, BarChart3, Users,
    MessageSquare, Rocket, Flame, ChevronRight, X
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

/*
  Color token reference (from globals.css):
  ─────────────────────────────────────────
  bg-background        → --background  (page bg, dark: hsl(222 47% 4%))
  bg-card              → --card        (card bg, dark: hsl(222 47% 6%))
  text-foreground      → --foreground  (primary text)
  text-muted-foreground→ --muted-foreground
  border-border        → --border      (replaces border-white/5, border-white/[0.06])
  bg-muted             → --muted       (replaces bg-white/[0.03..0.05])
  bg-accent            → --accent
  text-primary         → --primary     (cyan brand color)
  border-primary/20    → cyan accent border
  ring-primary         → focus ring

  All hardcoded #hex backgrounds are mapped in the CSS bridge, but we
  use semantic tokens directly here so the component is theme-aware.
*/

// ─── Variants ─────────────────────────────────────────────────────────────────
const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const slideUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } }
};

// ─── Accent config — maps to Tailwind color scale ────────────────────────────
// primary = cyan (from --primary token)
// We keep named Tailwind colors for non-primary accents (emerald, amber, indigo, etc.)
// since those don't have CSS variable equivalents in the theme.
const accentMap: Record<string, { icon: string; border: string; bg: string; text: string; dot: string; hover: string }> = {
    primary: {
        icon: 'bg-primary/10 text-primary border-primary/20',
        border: 'hover:border-primary/30',
        bg: 'hover:bg-primary/[0.04]',
        text: 'text-primary',
        dot: 'bg-primary',
        hover: 'group-hover:text-primary group-hover:bg-primary/10',
    },
    emerald: {
        icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        border: 'hover:border-emerald-500/30',
        bg: 'hover:bg-emerald-500/[0.04]',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        hover: 'group-hover:text-emerald-400 group-hover:bg-emerald-500/10',
    },
    amber: {
        icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        border: 'hover:border-amber-500/30',
        bg: 'hover:bg-amber-500/[0.04]',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        hover: 'group-hover:text-amber-400 group-hover:bg-amber-500/10',
    },
    indigo: {
        icon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        border: 'hover:border-indigo-500/30',
        bg: 'hover:bg-indigo-500/[0.04]',
        text: 'text-indigo-400',
        dot: 'bg-indigo-500',
        hover: 'group-hover:text-indigo-400 group-hover:bg-indigo-500/10',
    },
    purple: {
        icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        border: 'hover:border-purple-500/30',
        bg: 'hover:bg-purple-500/[0.04]',
        text: 'text-purple-400',
        dot: 'bg-purple-500',
        hover: 'group-hover:text-purple-400 group-hover:bg-purple-500/10',
    },
    sky: {
        icon: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        border: 'hover:border-sky-500/30',
        bg: 'hover:bg-sky-500/[0.04]',
        text: 'text-sky-400',
        dot: 'bg-sky-500',
        hover: 'group-hover:text-sky-400 group-hover:bg-sky-500/10',
    },
    teal: {
        icon: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        border: 'hover:border-teal-500/30',
        bg: 'hover:bg-teal-500/[0.04]',
        text: 'text-teal-400',
        dot: 'bg-teal-500',
        hover: 'group-hover:text-teal-400 group-hover:bg-teal-500/10',
    },
    rose: {
        icon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        border: 'hover:border-rose-500/30',
        bg: 'hover:bg-rose-500/[0.04]',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
        hover: 'group-hover:text-rose-400 group-hover:bg-rose-500/10',
    },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const DashboardStatCard = ({
    label, value, trend, icon, accent, isLoading, onClick
}: {
    label: string; value: string; trend: string; icon: React.ReactNode;
    accent: string; isLoading?: boolean; onClick?: () => void;
}) => {
    const a = accentMap[accent] || accentMap.primary;
    return (
        <motion.div variants={slideUp} className="h-full">
            <Card
                onClick={onClick}
                className={`relative h-full bg-card border-border overflow-hidden group transition-all duration-300 hover:border-border/60 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
            >
                {/* subtle hover glow — uses muted to stay theme-safe */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-muted/60 to-transparent pointer-events-none" />

                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 sm:p-2.5 rounded-xl border ${a.icon} group-hover:scale-110 transition-all duration-300`}>
                            {icon}
                        </div>
                        <div className={`p-1.5 rounded-lg bg-muted/60 text-muted-foreground/50 ${a.hover} transition-all`}>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <div className="space-y-0.5">
                        {isLoading
                            ? <div className="h-7 w-20 bg-muted animate-pulse rounded-lg" />
                            : <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter tabular-nums">{value}</p>
                        }
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.18em]">{label}</p>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-muted' : `${a.dot} animate-pulse`}`} />
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">
                            {isLoading ? 'Syncing...' : trend}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// ─── Skeletons ────────────────────────────────────────────────────────────────
const ProjectCardSkeleton = () => (
    <Card className="bg-card border-border animate-pulse">
        <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
                <div className="h-8 w-8 bg-muted rounded-xl" />
                <div className="h-5 w-14 bg-muted rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted/60 rounded" />
            </div>
            <div className="h-1 w-full bg-muted rounded-full" />
        </CardContent>
    </Card>
);

const ActivitySkeleton = () => (
    <div className="space-y-1 relative">
        <div className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-muted" />
        <div className="h-3 w-44 bg-muted rounded animate-pulse" />
        <div className="h-2 w-20 bg-muted/60 rounded animate-pulse" />
    </div>
);

// ─── Completion Ring ──────────────────────────────────────────────────────────
const CompletionRing = ({ percentage, size = 72, strokeWidth = 5 }: {
    percentage: number; size?: number; strokeWidth?: number;
}) => {
    const r = (size - strokeWidth) / 2;
    const circ = r * 2 * Math.PI;
    const offset = circ - (percentage / 100) * circ;
    const color = percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444';
    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg className="-rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-foreground">{percentage}%</span>
            </div>
        </div>
    );
};

// ─── Quick Action ─────────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, onClick, accent }: {
    icon: any; label: string; onClick: () => void; accent: string;
}) => {
    const a = accentMap[accent] || accentMap.primary;
    return (
        <button onClick={onClick}
            className={`flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-card border border-border ${a.border} ${a.bg} transition-all duration-300 group cursor-pointer w-full shadow-lg shadow-black/5 hover:shadow-primary/5`}
        >
            <div className={`p-3 rounded-xl border ${a.icon} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className={`text-xs sm:text-sm font-bold text-muted-foreground/80 uppercase tracking-widest group-hover:text-foreground transition-colors text-center leading-tight`}>
                {label}
            </span>
        </button>
    );
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }: { priority: string }) => {
    const map: Record<string, string> = {
        urgent: 'border-red-500/30 text-red-400 bg-red-500/10',
        high:   'border-orange-500/30 text-orange-400 bg-orange-500/10',
        medium: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        low:    'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    };
    return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${map[priority] || map.medium}`}>
            {priority}
        </span>
    );
};

// ─── Deadline Item ────────────────────────────────────────────────────────────
const DeadlineItem = ({ task, onClick }: { task: any; onClick: () => void }) => {
    const dueDate = new Date(task.due_date);
    const overdue = isPast(dueDate) && !task.completed_at;
    const dueToday = isToday(dueDate);
    const dueTomorrow = isTomorrow(dueDate);

    const cfg = overdue
        ? { border: 'border-red-500/20',    bg: 'bg-red-500/[0.03]',    text: 'text-red-400',    badge: 'bg-red-500/10 text-red-400',    label: 'Overdue',   icon: <AlertTriangle className="h-3 w-3" />, ibg: 'bg-red-500/10 text-red-400' }
        : dueToday
        ? { border: 'border-amber-500/20',  bg: 'bg-amber-500/[0.03]',  text: 'text-amber-400',  badge: 'bg-amber-500/10 text-amber-400',  label: 'Today',     icon: <Flame className="h-3 w-3" />,         ibg: 'bg-amber-500/10 text-amber-400' }
        : dueTomorrow
        ? { border: 'border-orange-500/20', bg: 'bg-orange-500/[0.03]', text: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400', label: 'Tomorrow',  icon: <Clock className="h-3 w-3" />,         ibg: 'bg-orange-500/10 text-orange-400' }
        : { border: 'border-border',        bg: '',                      text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground', label: format(dueDate, 'MMM d'), icon: <Calendar className="h-3 w-3" />, ibg: 'bg-muted text-muted-foreground' };

    return (
        <button onClick={onClick}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border ${cfg.border} ${cfg.bg} hover:bg-accent/50 transition-all cursor-pointer group text-left`}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${cfg.ibg}`}>{cfg.icon}</div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-0.5">{task.project?.name || 'Project'}</p>
                </div>
            </div>
            <span className={`flex-shrink-0 ml-2 px-1.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.badge}`}>
                {cfg.label}
            </span>
        </button>
    );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ icon, title, accent, action, actionLabel, badge }: {
    icon: React.ReactNode; title: React.ReactNode; accent: string;
    action?: () => void; actionLabel?: string; badge?: React.ReactNode;
}) => {
    const a = accentMap[accent] || accentMap.primary;
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <span className={a.text}>{icon}</span>
                {title}
                {badge}
            </h2>
            {action && (
                <button onClick={action}
                    className="flex items-center gap-0.5 text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                >
                    {actionLabel}<ChevronRight className="h-3 w-3" />
                </button>
            )}
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

    const { data: userPerformance } = useQuery({
        queryKey: ['user-performance', user?.id],
        queryFn: async () => (await api.get('/users/me/performance')).data.data,
        enabled: !!user,
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['workspace-analytics', activeWorkspace?.id],
        queryFn: async () => {
            if (!activeWorkspace) return null;
            return (await api.get(`/workspaces/${activeWorkspace.id}/analytics`)).data.data;
        },
        enabled: !!activeWorkspace,
    });

    const { data: projectsData, isLoading: projectsLoading } = useQuery({
        queryKey: ['workspace-projects', activeWorkspace?.id],
        queryFn: async () => {
            if (!activeWorkspace) return null;
            return (await api.get(`/workspaces/${activeWorkspace.id}/projects`, { params: { limit: 4 } })).data.data;
        },
        enabled: !!activeWorkspace,
    });

    const handleAnalyzeWorkspace = async () => {
        if (!activeWorkspace) return;
        setIsAnalyzing(true);
        try {
            const r = await api.get(`/workspaces/${activeWorkspace.id}/analyze`);
            setAnalysisResult(r.data.data.analysis);
        } catch (e) { console.error(e); }
        finally { setIsAnalyzing(false); }
    };

    const upcomingDeadlines = (userPerformance?.pendingTasks || [])
        .filter((t: any) => t.due_date)
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);

    const overdueCount = upcomingDeadlines.filter((t: any) => isPast(new Date(t.due_date))).length;

    const quickActions = [
        { icon: Plus,          label: 'New Project', onClick: () => {},                    accent: 'primary' },
        { icon: Brain,         label: 'AI Chat',     onClick: () => navigate('/ai-chat'),   accent: 'purple'  },
        { icon: BarChart3,     label: 'Analytics',   onClick: () => navigate('/analytics'), accent: 'emerald' },
        { icon: Users,         label: 'Team',        onClick: () => navigate('/team'),      accent: 'amber'   },
        { icon: Target,        label: 'Projects',    onClick: () => navigate('/projects'),  accent: 'sky'     },
        { icon: MessageSquare, label: 'Messages',    onClick: () => navigate('/ai-chat'),   accent: 'teal'    },
        { icon: Rocket,        label: 'Deploy',      onClick: () => {},                    accent: 'indigo'  },
        { icon: Zap,           label: 'Quick Task',  onClick: () => {},                    accent: 'rose'    },
    ];

    // ── Empty state ───────────────────────────────────────────────────────────
    if (!activeWorkspace && !analyticsLoading) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-card p-8 rounded-3xl border border-border max-w-xs w-full text-center"
                >
                    <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight mb-1.5">
                        No Active <span className="text-primary">Workspace</span>
                    </h2>
                    <p className="text-muted-foreground font-medium text-xs leading-relaxed">
                        Select or create a workspace to start monitoring your operations.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#08090d]">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 max-w-7xl mx-auto">

                {/* ── Header ───────────────────────────────────────────────── */}
                <motion.div variants={stagger} initial="hidden" animate="visible"
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6"
                >
                    <motion.div variants={slideUp} className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.22em]">
                                {analyticsLoading ? 'Synchronizing...' : 'System Online'}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
                            Neural <span className="text-primary">Overview</span>
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
                            Welcome back, {user?.name?.split(' ')[0]} · {activeWorkspace?.name}
                        </p>
                    </motion.div>

                    <motion.div variants={slideUp} className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" onClick={() => navigate('/analytics')}
                            className="hidden sm:flex border-border bg-card hover:bg-accent text-foreground font-bold h-9 rounded-xl px-4 uppercase tracking-widest text-[9px] gap-1.5 transition-all"
                        >
                            <BarChart3 className="h-3.5 w-3.5" />Analytics
                        </Button>
                        <CreateProjectDialog trigger={
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-9 rounded-xl px-4 uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 gap-1.5 transition-all">
                                <Plus className="h-3.5 w-3.5" />New Project
                            </Button>
                        } />
                    </motion.div>
                </motion.div>

                {/* ── Quick Actions ─────────────────────────────────────────── */}
                <motion.div variants={stagger} initial="hidden" animate="visible"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                >
                    {quickActions.map((a, i) => (
                        <motion.div key={i} variants={slideUp}><QuickAction {...a} /></motion.div>
                    ))}
                </motion.div>

                {/* ── Stats ────────────────────────────────────────────────── */}
                <motion.div variants={stagger} initial="hidden" animate="visible"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 sm:mb-8"
                >
                    <DashboardStatCard label="Active Projects" value={analytics?.projectCount?.toString() || '0'}                trend="Synced from cloud"   icon={<Layers className="h-4 w-4" />}       accent="primary" isLoading={analyticsLoading} onClick={() => navigate('/projects')} />
                    <DashboardStatCard label="In Progress"     value={analytics?.statusBreakdown?.inProgress?.toString() || '0'} trend={`${analytics?.statusBreakdown?.todo || 0} in backlog`} icon={<Zap className="h-4 w-4" />} accent="teal" isLoading={analyticsLoading} />
                    <DashboardStatCard label="Completed"       value={analytics?.statusBreakdown?.done?.toString() || '0'}       trend="Objectives achieved" icon={<CheckCircle2 className="h-4 w-4" />}  accent="emerald" isLoading={analyticsLoading} />
                    <DashboardStatCard label="Productivity"    value={`${analytics?.completionRate || 0}%`}                      trend="Completion rate"     icon={<TrendingUp className="h-4 w-4" />}    accent="indigo"  isLoading={analyticsLoading} />
                </motion.div>

                {/* ── Main Grid ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 items-start">

                    {/* ── Left (2/3) ───────────────────────────────────────── */}
                    <div className="xl:col-span-2 flex flex-col gap-6">

                        {/* Active Projects */}
                        <section>
                            <SectionLabel
                                icon={<Target className="h-3.5 w-3.5" />}
                                title={<>Active <span className="text-muted-foreground font-semibold normal-case tracking-normal">Projects</span></>}
                                accent="primary"
                                action={() => navigate('/projects')}
                                actionLabel="View all"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {projectsLoading
                                    ? [1, 2, 3, 4].map(i => <ProjectCardSkeleton key={i} />)
                                    : projectsData && projectsData.length > 0
                                    ? projectsData.map((project: any, idx: number) => (
                                        <motion.div key={project.id}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <Card onClick={() => navigate(`/projects/${project.id}`)}
                                                className="bg-card border-border hover:border-primary/25 transition-all duration-300 group cursor-pointer hover:-translate-y-0.5 pt-4"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="bg-muted border border-border p-2 rounded-xl group-hover:border-primary/20 transition-colors">
                                                            <Layers className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                                            {project.status || 'Active'}
                                                        </span>
                                                    </div>
                                                    <div className="mb-3">
                                                        <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">
                                                            {project.name}
                                                        </h3>
                                                        <p className="text-[12px] text-muted-foreground font-medium mt-0.5 line-clamp-1">
                                                            {project.description || 'No description provided'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                            <span>Progress</span>
                                                            <span className="text-muted-foreground">{project.progress || 0}%</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${project.progress || 0}%` }}
                                                                transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                                className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400"
                                                                style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.35)' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))
                                    : (
                                        <div className="col-span-full py-10 text-center bg-muted/30 border border-dashed border-border rounded-2xl">
                                            <Layers className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No projects initialized</p>
                                        </div>
                                    )
                                }
                            </div>
                        </section>

                        {/* Assigned Tasks */}
                        <section>
                            <SectionLabel
                                icon={<Zap className="h-3.5 w-3.5" />}
                                title={<>Assigned <span className="text-muted-foreground font-semibold normal-case tracking-normal">Tasks</span></>}
                                accent="emerald"
                                action={() => navigate('/projects')}
                                actionLabel="All tasks"
                                badge={
                                    userPerformance?.pendingTasks?.length > 0
                                        ? <span className="ml-2 text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                            {userPerformance.pendingTasks.length}
                                          </span>
                                        : undefined
                                }
                            />
                            <div className="flex flex-col gap-2">
                                {userPerformance?.pendingTasks && userPerformance.pendingTasks.length > 0
                                    ? userPerformance.pendingTasks.map((task: any, idx: number) => (
                                        <motion.div key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04, duration: 0.32 }}
                                        >
                                            <Card onClick={() => navigate(`/projects/${task.project_id}`)}
                                                className="bg-card border-border hover:border-emerald-500/25 transition-all duration-200 group cursor-pointer hover:bg-accent/40"
                                            >
                                                <CardContent className="p-3 sm:p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-card group-hover:border-emerald-500 transition-all duration-200">
                                                            <Bot className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors truncate">{task.title}</h4>
                                                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-0.5">{task.project?.name || 'Unknown project'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            {task.due_date && (
                                                                <span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                                                    isPast(new Date(task.due_date))   ? 'text-red-400 border-red-500/20 bg-red-500/10'
                                                                    : isToday(new Date(task.due_date)) ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                                                                    : 'text-muted-foreground border-border'
                                                                }`}>
                                                                    {isPast(new Date(task.due_date)) ? 'Overdue'
                                                                        : isToday(new Date(task.due_date)) ? 'Today'
                                                                        : format(new Date(task.due_date), 'MMM d')}
                                                                </span>
                                                            )}
                                                            <PriorityBadge priority={task.priority || 'medium'} />
                                                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-emerald-400 transition-colors" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))
                                    : (
                                        <div className="py-10 text-center bg-muted/30 border border-dashed border-border rounded-2xl">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500/20 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">All clear — no pending tasks</p>
                                        </div>
                                    )
                                }
                            </div>
                        </section>
                    </div>

                    {/* ── Right (1/3) ─ xl:self-start prevents height stretch ── */}
                    <div className="flex flex-col gap-4 xl:self-start">

                        {/* Personal Stats */}
                        <Card className="bg-card border-border">
                            <CardHeader className="pt-4 pb-2 px-4">
                                <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3 text-primary" />Personal Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="flex items-center gap-4">
                                    <CompletionRing percentage={userPerformance?.completionRate || 0} />
                                    <div className="flex-1 min-w-0 space-y-2.5">
                                        <div>
                                            <p className="text-2xl font-black text-foreground tabular-nums leading-none">
                                                {userPerformance?.tasksCompleted || 0}
                                                <span className="text-muted-foreground/60 text-sm font-bold">/{userPerformance?.tasksAssigned || 0}</span>
                                            </p>
                                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-0.5">Tasks Done</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-muted/60 rounded-lg p-2 border border-border">
                                                <p className="text-base font-black text-foreground leading-none">{userPerformance?.onTimeDelivery || 0}%</p>
                                                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">On-Time</p>
                                            </div>
                                            <div className="bg-muted/60 rounded-lg p-2 border border-border">
                                                <p className="text-base font-black text-foreground leading-none">{userPerformance?.averageCompletionTime || 0}d</p>
                                                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">Avg Time</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deadlines */}
                        <Card className="bg-card border-border">
                            <CardHeader className="pt-4 pb-2 px-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-amber-400" />Deadlines
                                    </CardTitle>
                                    {overdueCount > 0 && (
                                        <span className="text-[8px] font-black bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">
                                            {overdueCount} overdue
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 flex flex-col gap-1.5">
                                {upcomingDeadlines.length > 0
                                    ? upcomingDeadlines.map((task: any) => (
                                        <DeadlineItem key={task.id} task={task} onClick={() => navigate(`/projects/${task.project_id}`)} />
                                    ))
                                    : (
                                        <div className="py-5 text-center">
                                            <Clock className="h-4 w-4 text-muted-foreground/20 mx-auto mb-1.5" />
                                            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">No upcoming deadlines</p>
                                        </div>
                                    )
                                }
                            </CardContent>
                        </Card>

                        {/* Neural Assistant */}
                        <Card className="bg-card border-primary/20 overflow-hidden relative">
                            {/* brand-tinted ambient glow using primary token */}
                            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none bg-primary/[0.07]" />

                            <CardHeader className="pt-4 pb-2 px-4 relative">
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-3 w-3 text-primary" />
                                    </div>
                                    Neural Assistant
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="px-4 pb-4 flex flex-col gap-3 relative">
                                <div className="p-3 rounded-xl bg-muted/60 border border-border">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                        {userPerformance?.pendingTasks?.length > 0
                                            ? `You have ${userPerformance.pendingTasks.length} pending tasks.${overdueCount > 0 ? ` ⚠️ ${overdueCount} ${overdueCount === 1 ? 'is' : 'are'} overdue.` : ' Focus on high-priority items.'}`
                                            : 'All systems nominal. Initialize a new project or invite your team to begin.'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAnalyzeWorkspace} disabled={isAnalyzing}
                                        className="flex-1 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-black h-8 rounded-lg text-[9px] uppercase tracking-widest border border-primary/20 gap-1.5 transition-all"
                                    >
                                        {isAnalyzing
                                            ? <><Loader2 className="h-3 w-3 animate-spin" />Analyzing</>
                                            : <><Brain className="h-3 w-3" />Analyze</>
                                        }
                                    </Button>
                                    <Button onClick={() => navigate('/ai-chat')} variant="outline"
                                        className="border-border bg-transparent text-foreground font-black h-8 rounded-lg text-[9px] uppercase tracking-widest hover:border-primary/25 hover:bg-accent gap-1.5 transition-all"
                                    >
                                        <MessageSquare className="h-3 w-3" />Chat
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Project Pulse */}
                        {projectsData && projectsData.length > 0 && (
                            <ProjectPulse projectId={projectsData[0].id} />
                        )}

                        {/* AI Analysis Result */}
                        <AnimatePresence>
                            {analysisResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <Card className="bg-card border-primary/20">
                                        <CardHeader className="pt-4 pb-2 px-4 border-b border-border">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                    <Zap className="h-3 w-3" />Intelligence Report
                                                </CardTitle>
                                                <button onClick={() => setAnalysisResult(null)}
                                                    className="p-1 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-all"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <ReactMarkdown components={{
                                                p:      ({ children }) => <p className="mb-2 last:mb-0 text-sm text-muted-foreground leading-relaxed">{children}</p>,
                                                strong: ({ children }) => <strong className="text-primary font-black">{children}</strong>,
                                                ul:     ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                li:     ({ children }) => <li className="text-[12px] text-muted-foreground">{children}</li>,
                                                h2:     ({ children }) => <h2 className="text-sm font-black text-foreground mb-1.5 uppercase tracking-wide">{children}</h2>,
                                            }}>
                                                {analysisResult}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Activity Feed */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-3">
                                <ActivityIcon className="h-4 w-4 text-emerald-400" />
                                <h3 className="text-[12px] font-black text-foreground uppercase tracking-[0.2em]">Live Activity</h3>
                            </div>
                            <div className="relative border-l border-border ml-1.5 pl-4 flex flex-col gap-3">
                                {analyticsLoading
                                    ? Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
                                    : analytics?.recentActivity && analytics.recentActivity.length > 0
                                    ? analytics.recentActivity.map((activity: any) => (
                                        <div key={activity.id || Math.random()} className="relative">
                                            <div className="absolute -left-[1.32rem] top-1.5 w-2 h-2 rounded-full bg-primary/60 border-2 border-card" />
                                            <p className="text-base text-foreground font-medium leading-snug">
                                                <span className="text-primary font-bold">
                                                    @{activity.actor?.name?.split(' ')[0] || 'System'}
                                                </span>{' '}
                                                {activity.description || activity.action?.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[11px] text-foreground/70 font-bold uppercase tracking-widest mt-0.5">
                                                {formatDistanceToNow(new Date(activity.created_at || activity.timestamp))} ago
                                            </p>
                                        </div>
                                    ))
                                    : <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest italic">No recent activity</p>
                                }
                            </div>
                        </div>

                    </div>{/* /right col */}
                </div>{/* /main grid */}

                <div className="h-6 sm:h-4" />
            </div>
        </div>
    );
};

export default DashboardPage;