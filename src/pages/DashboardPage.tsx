import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Target, TrendingUp, Plus, ArrowUpRight, Bot, Layers,
    Activity as ActivityIcon, AlertCircle, Loader2, CheckCircle2,
    Clock, AlertTriangle, Calendar, Brain, BarChart3, Users,
    MessageSquare, Rocket, Flame, ChevronRight, X, Sparkles,
    CircleDot, Shield, Command
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import api from '@/services/api';
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { CreateTaskDialog } from '@/components/project/CreateTaskDialog';
import ProjectPulse from '@/components/project/ProjectPulse';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────────────────────── */
const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.055 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any } },
};
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   ACCENT MAP
───────────────────────────────────────────────────────────────────────────── */
const accentMap: Record<string, {
    icon: string; border: string; bg: string; text: string;
    dot: string; badge: string; glow: string;
}> = {
    primary: {
        icon: 'bg-primary/10 text-primary border-primary/40',
        border: 'hover:border-primary/60',
        bg: 'hover:bg-primary/5',
        text: 'text-primary',
        dot: 'bg-primary',
        badge: 'bg-primary/15 text-primary border-primary/40',
        glow: 'rgba(var(--primary), 0.25)',
    },
    emerald: {
        icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
        border: 'hover:border-emerald-500/50',
        bg: 'hover:bg-emerald-500/5',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
        glow: 'rgba(52,211,153,0.2)',
    },
    amber: {
        icon: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
        border: 'hover:border-amber-500/50',
        bg: 'hover:bg-amber-500/5',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        glow: 'rgba(245,158,11,0.2)',
    },
    indigo: {
        icon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40',
        border: 'hover:border-indigo-500/50',
        bg: 'hover:bg-indigo-500/5',
        text: 'text-indigo-400',
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40',
        glow: 'rgba(99,102,241,0.2)',
    },
    purple: {
        icon: 'bg-purple-500/10 text-purple-400 border-purple-500/40',
        border: 'hover:border-purple-500/50',
        bg: 'hover:bg-purple-500/5',
        text: 'text-purple-400',
        dot: 'bg-purple-500',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
        glow: 'rgba(168,85,247,0.2)',
    },
    sky: {
        icon: 'bg-sky-500/10 text-sky-400 border-sky-500/40',
        border: 'hover:border-sky-500/50',
        bg: 'hover:bg-sky-500/5',
        text: 'text-sky-400',
        dot: 'bg-sky-500',
        badge: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
        glow: 'rgba(14,165,233,0.2)',
    },
    teal: {
        icon: 'bg-teal-500/10 text-teal-400 border-teal-500/40',
        border: 'hover:border-teal-500/50',
        bg: 'hover:bg-teal-500/5',
        text: 'text-teal-400',
        dot: 'bg-teal-500',
        badge: 'bg-teal-500/15 text-teal-400 border-teal-500/40',
        glow: 'rgba(20,184,166,0.2)',
    },
    rose: {
        icon: 'bg-rose-500/10 text-rose-400 border-rose-500/40',
        border: 'hover:border-rose-500/50',
        bg: 'hover:bg-rose-500/5',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        glow: 'rgba(244,63,94,0.2)',
    },
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────────── */
const StatCard = ({
    label, value, icon, accent, isLoading, onClick, delta,
}: {
    label: string; value: string; icon: React.ReactNode;
    accent: string; isLoading?: boolean; onClick?: () => void; delta?: string;
}) => {
    const a = accentMap[accent] || accentMap.primary;
    return (
        <motion.div variants={fadeUp} className="h-full">
            <motion.div
                onClick={onClick}
                whileHover={onClick ? { y: -3, scale: 1.015 } : {}}
                className={`relative h-full bg-card border border-border rounded-2xl overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${a.border} ${a.bg}`}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
                }}
            >
                {/* Radial spotlight */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(280px circle at var(--mx,50%) var(--my,50%), ${a.glow}, transparent 70%)` }} />

                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${a.dot}`}
                    style={{ background: `linear-gradient(90deg, transparent, ${a.glow}, transparent)` }} />

                <CardContent className="p-4 sm:p-5 flex items-start gap-4 relative z-10">
                    <div className={`p-2.5 rounded-xl border ${a.icon} flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                        {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        {isLoading
                            ? <div className="h-7 w-16 bg-muted animate-pulse rounded-lg" />
                            : (
                                <div className="flex items-end gap-1.5">
                                    <p className={`text-2xl sm:text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none transition-colors group-hover:${a.text.replace('text-', 'text-')}`}>
                                        {value}
                                    </p>
                                    {delta && (
                                        <span className="text-[10px] font-black text-emerald-400 mb-0.5 bg-emerald-500/10 px-1 py-0.5 rounded">
                                            {delta}
                                        </span>
                                    )}
                                </div>
                            )
                        }
                        <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mt-1">{label}</p>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${isLoading ? 'bg-muted' : a.dot} animate-pulse`} />
                </CardContent>
            </motion.div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETONS
───────────────────────────────────────────────────────────────────────────── */
const ProjectCardSkeleton = () => (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="h-9 w-9 bg-muted rounded-xl" />
            <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
        <div className="space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded-lg" />
            <div className="h-3 w-full bg-muted/60 rounded-lg" />
        </div>
        <div className="space-y-1.5">
            <div className="flex justify-between">
                <div className="h-2.5 w-12 bg-muted/60 rounded" />
                <div className="h-2.5 w-8 bg-muted/60 rounded" />
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full" />
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   COMPLETION RING
───────────────────────────────────────────────────────────────────────────── */
const CompletionRing = ({ percentage, size = 80, strokeWidth = 6 }: {
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
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black text-foreground leading-none">{percentage}%</span>
                <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-widest mt-0.5">Done</span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   QUICK ACTION
───────────────────────────────────────────────────────────────────────────── */
const QuickAction = React.forwardRef<HTMLButtonElement, {
    icon: any; label: string; sub?: string; onClick: () => void; accent: string;
}>(({ icon: Icon, label, sub = 'Execute', onClick, accent }, ref) => {
    const a = accentMap[accent] || accentMap.primary;
    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`relative flex flex-col items-start gap-2.5 p-3.5 rounded-2xl bg-card border border-border ${a.border} ${a.bg} transition-all duration-300 group cursor-pointer overflow-hidden w-full text-left`}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(200px circle at 30% 50%, ${a.glow || 'transparent'}, transparent 70%)` }} />
            <div className={`p-2 rounded-xl border ${a.icon} transition-all duration-300 group-hover:scale-110 relative z-10`}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">{label}</p>
                <p className={`text-[8px] font-bold ${a.text} uppercase tracking-wider mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity`}>{sub}</p>
            </div>
        </motion.button>
    );
});
QuickAction.displayName = 'QuickAction';

/* ─────────────────────────────────────────────────────────────────────────────
   PRIORITY BADGE
───────────────────────────────────────────────────────────────────────────── */
const PriorityBadge = ({ priority }: { priority: string }) => {
    const map: Record<string, string> = {
        urgent: 'border-red-500/30 text-red-400 bg-red-500/10',
        high:   'border-orange-500/30 text-orange-400 bg-orange-500/10',
        medium: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        low:    'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    };
    return (
        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${map[priority] || map.medium}`}>
            {priority}
        </span>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   DEADLINE ITEM
───────────────────────────────────────────────────────────────────────────── */
const DeadlineItem = ({ task, onClick }: { task: any; onClick: () => void }) => {
    const dueDate = new Date(task.due_date);
    const overdue   = isPast(dueDate) && !task.completed_at;
    const dueToday  = isToday(dueDate);
    const dueTomorrow = isTomorrow(dueDate);

    const cfg = overdue
        ? { cls: 'border-red-500/20 bg-red-500/[0.03]', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Overdue', icon: <AlertTriangle className="h-3 w-3" /> }
        : dueToday
        ? { cls: 'border-amber-500/20 bg-amber-500/[0.03]', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Today', icon: <Flame className="h-3 w-3" /> }
        : dueTomorrow
        ? { cls: 'border-orange-500/20 bg-orange-500/[0.03]', text: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'Tomorrow', icon: <Clock className="h-3 w-3" /> }
        : { cls: 'border-border/60', text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground border-border/60', label: format(dueDate, 'MMM d'), icon: <Calendar className="h-3 w-3" /> };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ x: 3 }}
            className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border ${cfg.cls} hover:bg-accent/30 transition-all duration-200 cursor-pointer group text-left`}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <span className={`flex-shrink-0 ${cfg.text} transition-transform group-hover:scale-110`}>{cfg.icon}</span>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{task.project?.name || 'Project'}</p>
                </div>
            </div>
            <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg border ${cfg.badge}`}>
                {cfg.label}
            </span>
        </motion.button>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────────── */
const SectionHeader = ({ icon, title, accent, action, actionLabel, badge }: {
    icon: React.ReactNode; title: React.ReactNode; accent: string;
    action?: () => void; actionLabel?: string; badge?: React.ReactNode;
}) => {
    const a = accentMap[accent] || accentMap.primary;
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                <span className={a.text}>{icon}</span>
                <span>{title}</span>
                {badge}
            </h2>
            {action && (
                <button onClick={action}
                    className="flex items-center gap-0.5 text-[9px] font-black text-muted-foreground/50 hover:text-primary uppercase tracking-widest transition-colors"
                >
                    {actionLabel}
                    <ChevronRight className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────────────────────────────────── */
const ProjectCard = ({ project, idx, onClick }: { project: any; idx: number; onClick: () => void }) => {
    const statusColors: Record<string, string> = {
        active:    'bg-primary/10 text-primary border-primary/25',
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        paused:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
        archived:  'bg-muted text-muted-foreground border-border/60',
    };
    const statusKey = (project.status || 'active').toLowerCase();
    const statusClass = statusColors[statusKey] || statusColors.active;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                onClick={onClick}
                whileHover={{ y: -5 }}
                className="relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_-8px_rgba(var(--primary),0.15)]"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
                }}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(320px circle at var(--mx,50%) var(--my,50%), rgba(var(--primary),0.05), transparent 70%)' }} />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-5 relative z-10">
                    <div className="flex justify-between items-start mb-4 pt-4">
                        <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                            <Layers className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:rotate-6 transition-all" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusClass}`}>
                            {project.status || 'Active'}
                        </span>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate tracking-tight leading-tight mb-1">
                            {project.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground/70 font-medium line-clamp-1">
                            {project.description || 'No description provided'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black text-muted-foreground tabular-nums">{project.progress || 0}%</span>
                        </div>
                        <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress || 0}%` }}
                                transition={{ duration: 1.2, delay: 0.2 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400"
                                style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.5)' }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-3">
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest group-hover:text-primary/60 transition-colors flex items-center gap-0.5">
                            View <ArrowUpRight className="h-2.5 w-2.5" />
                        </span>
                    </div>
                </CardContent>
            </motion.div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [taskPage, setTaskPage] = useState(0);
    const TASKS_PER_PAGE = 6;

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

    const firstName = user?.name?.split(' ')[0] || 'Commander';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const quickActions = [
        { icon: Plus,          label: 'New Project', sub: 'Create',   onClick: () => {},                    accent: 'primary' },
        { icon: Brain,         label: 'AI Chat',     sub: 'Converse', onClick: () => navigate('/ai-chat'),   accent: 'purple'  },
        { icon: BarChart3,     label: 'Analytics',   sub: 'Explore',  onClick: () => navigate('/analytics'), accent: 'emerald' },
        { icon: Users,         label: 'Team',        sub: 'Manage',   onClick: () => navigate('/team'),      accent: 'amber'   },
        { icon: Target,        label: 'Projects',    sub: 'Browse',   onClick: () => navigate('/projects'),  accent: 'sky'     },
        { icon: MessageSquare, label: 'Messages',    sub: 'Inbox',    onClick: () => navigate('/ai-chat'),   accent: 'teal'    },
        { icon: Rocket,        label: 'Deploy',      sub: 'Launch',   onClick: () => toast.info('Deployment engine initializing. Feature available soon.'), accent: 'indigo' },
        { icon: Zap,           label: 'Quick Task',  sub: 'Add',      onClick: () => {},                    accent: 'rose'    },
    ];

    /* ── Empty state ── */
    if (!activeWorkspace && !analyticsLoading) {
        return (
            <div className="flex items-center justify-center h-full p-6 bg-background">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-card p-10 rounded-3xl border border-border max-w-sm w-full text-center"
                >
                    <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">
                        No Active <span className="text-primary">Workspace</span>
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                        Select or create a workspace to begin monitoring your operations.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-background">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 max-w-[1400px] mx-auto">

                {/* ── HEADER ────────────────────────────────────────────────── */}
                <motion.header
                    variants={stagger} initial="hidden" animate="visible"
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10"
                >
                    <motion.div variants={fadeUp}>
                        {/* Status pill */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                    {analyticsLoading ? 'Syncing…' : 'All Systems Online'}
                                </span>
                            </div>
                            <span className="hidden sm:block text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                {activeWorkspace?.name}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-foreground leading-none">
                            {greeting},{' '}
                            <span className="text-primary">{firstName}</span>
                            <span className="text-muted-foreground/30">.</span>
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-1.5">
                            {format(new Date(), 'EEEE, MMMM d · yyyy')}
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" onClick={() => navigate('/analytics')}
                            className="hidden sm:flex h-9 border-border/60 bg-card hover:bg-accent text-foreground font-black rounded-xl px-4 text-[9px] uppercase tracking-widest gap-1.5"
                        >
                            <BarChart3 className="h-3.5 w-3.5" /> Analytics
                        </Button>
                        <CreateProjectDialog trigger={
                            <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl px-4 text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20 gap-1.5">
                                <Plus className="h-3.5 w-3.5" /> New Project
                            </Button>
                        } />
                    </motion.div>
                </motion.header>

                {/* ── STATS ROW ─────────────────────────────────────────────── */}
                <motion.div variants={stagger} initial="hidden" animate="visible"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10"
                >
                    <StatCard label="Active Projects" value={analytics?.projectCount?.toString() || '0'}                icon={<Layers className="h-4 w-4" />}       accent="primary"  isLoading={analyticsLoading} onClick={() => navigate('/projects')} />
                    <StatCard label="In Progress"     value={analytics?.statusBreakdown?.inProgress?.toString() || '0'} icon={<Zap className="h-4 w-4" />}          accent="teal"     isLoading={analyticsLoading} onClick={() => navigate('/projects')} />
                    <StatCard label="Completed"       value={analytics?.statusBreakdown?.done?.toString() || '0'}       icon={<CheckCircle2 className="h-4 w-4" />}  accent="emerald"  isLoading={analyticsLoading} onClick={() => navigate('/projects')} />
                    <StatCard label="Productivity"    value={`${analytics?.completionRate || 0}%`}                      icon={<TrendingUp className="h-4 w-4" />}    accent="indigo"   isLoading={analyticsLoading} onClick={() => navigate('/analytics')} />
                </motion.div>

                {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
                <motion.section variants={stagger} initial="hidden" animate="visible" className="mb-8 sm:mb-10">
                    <SectionHeader
                        icon={<Command className="h-3.5 w-3.5" />}
                        title="Command Center"
                        accent="primary"
                    />
                    <motion.div variants={fadeUp}
                        className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3"
                    >
                        {quickActions.map((a, i) => {
                            const btn = <QuickAction {...a} />;
                            if (a.label === 'New Project') return <CreateProjectDialog key={i} trigger={btn} />;
                            if (a.label === 'Quick Task') {
                                const pid = projectsData?.[0]?.id;
                                return pid
                                    ? <CreateTaskDialog key={i} projectId={pid} trigger={btn} />
                                    : <div key={i} onClick={() => toast.error('No active projects found.')}>{btn}</div>;
                            }
                            return <div key={i}>{btn}</div>;
                        })}
                    </motion.div>
                </motion.section>

                {/* ── MAIN GRID ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 items-start">

                    {/* ── LEFT COL (2/3) ─────────────────────────────────────── */}
                    <div className="xl:col-span-2 flex flex-col gap-8">

                        {/* Active Projects */}
                        <section>
                            <SectionHeader
                                icon={<Target className="h-3.5 w-3.5" />}
                                title="Active Projects"
                                accent="primary"
                                action={() => navigate('/projects')}
                                actionLabel="View all"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {projectsLoading
                                    ? [1, 2, 3, 4].map(i => <ProjectCardSkeleton key={i} />)
                                    : projectsData && projectsData.length > 0
                                    ? projectsData.map((p: any, idx: number) => (
                                        <ProjectCard key={p.id} project={p} idx={idx} onClick={() => navigate(`/projects/${p.id}`)} />
                                    ))
                                    : (
                                        <div className="col-span-full flex flex-col items-center justify-center py-14 bg-muted/20 border border-dashed border-border/60 rounded-2xl gap-3">
                                            <Layers className="h-8 w-8 text-muted-foreground/20" />
                                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No projects initialized</p>
                                            <CreateProjectDialog trigger={
                                                <Button size="sm" className="h-8 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-black rounded-xl px-3 text-[9px] uppercase tracking-widest border border-primary/20 gap-1.5 transition-all">
                                                    <Plus className="h-3 w-3" /> Create First Project
                                                </Button>
                                            } />
                                        </div>
                                    )
                                }
                            </div>
                        </section>

                        {/* Assigned Tasks */}
                        <section>
                            <SectionHeader
                                icon={<Zap className="h-3.5 w-3.5" />}
                                title="Assigned Tasks"
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
                            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                <div className="divide-y divide-border/40 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {userPerformance?.pendingTasks && userPerformance.pendingTasks.length > 0
                                        ? userPerformance.pendingTasks
                                            .slice(taskPage * TASKS_PER_PAGE, (taskPage + 1) * TASKS_PER_PAGE)
                                            .map((task: any, idx: number) => (
                                                <motion.div key={task.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    onClick={() => navigate(`/projects/${task.project_id}`)}
                                                    className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 hover:bg-accent/40 cursor-pointer group transition-all duration-200"
                                                >
                                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                                                        <Bot className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors truncate">{task.title}</h4>
                                                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">{task.project?.name || 'Unknown project'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        {task.due_date && (
                                                            <span className={`hidden sm:inline text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg border ${
                                                                isPast(new Date(task.due_date))    ? 'text-red-400 border-red-500/20 bg-red-500/10'
                                                                : isToday(new Date(task.due_date)) ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                                                                : 'text-muted-foreground/50 border-border/60'
                                                            }`}>
                                                                {isPast(new Date(task.due_date)) ? 'Overdue'
                                                                    : isToday(new Date(task.due_date)) ? 'Today'
                                                                    : format(new Date(task.due_date), 'MMM d')}
                                                            </span>
                                                        )}
                                                        <PriorityBadge priority={task.priority || 'medium'} />
                                                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-emerald-400 transition-colors" />
                                                    </div>
                                                </motion.div>
                                            ))
                                        : (
                                            <div className="py-12 text-center">
                                                <CheckCircle2 className="h-7 w-7 text-emerald-500/20 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">All clear — no pending tasks</p>
                                            </div>
                                        )
                                    }
                                </div>
                                {/* Pagination */}
                                {userPerformance?.pendingTasks?.length > TASKS_PER_PAGE && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                            {taskPage * TASKS_PER_PAGE + 1}–{Math.min((taskPage + 1) * TASKS_PER_PAGE, userPerformance.pendingTasks.length)} of {userPerformance.pendingTasks.length}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setTaskPage(p => Math.max(0, p - 1))} disabled={taskPage === 0}
                                                className="h-6 w-6 flex items-center justify-center rounded-lg border border-border text-muted-foreground/50 hover:text-foreground hover:border-primary/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-sm"
                                            >‹</button>
                                            {Array.from({ length: Math.ceil(userPerformance.pendingTasks.length / TASKS_PER_PAGE) }).map((_, i) => (
                                                <button key={i} onClick={() => setTaskPage(i)}
                                                    className={`h-6 w-6 flex items-center justify-center rounded-lg text-[9px] font-black transition-all ${
                                                        taskPage === i
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : 'text-muted-foreground/40 hover:text-foreground border border-transparent hover:border-border/60'
                                                    }`}
                                                >{i + 1}</button>
                                            ))}
                                            <button onClick={() => setTaskPage(p => Math.min(Math.ceil(userPerformance.pendingTasks.length / TASKS_PER_PAGE) - 1, p + 1))}
                                                disabled={taskPage >= Math.ceil(userPerformance.pendingTasks.length / TASKS_PER_PAGE) - 1}
                                                className="h-6 w-6 flex items-center justify-center rounded-lg border border-border text-muted-foreground/50 hover:text-foreground hover:border-primary/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-sm"
                                            >›</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Bottom row: Neural Assistant + Live Activity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Neural Assistant */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="relative bg-card border border-primary/25 rounded-2xl overflow-hidden"
                                style={{ boxShadow: '0 0 30px -12px rgba(var(--primary), 0.2)' }}
                            >
                                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl bg-primary/10 animate-pulse pointer-events-none" />
                                <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-3xl bg-teal-500/[0.06] pointer-events-none" />
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                                <CardHeader className="pt-4 pb-2 px-5">
                                    <CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-3 w-3 text-primary" />
                                        </div>
                                        Neural Assistant
                                        <span className="ml-auto text-[7px] font-black text-primary/50 uppercase tracking-widest flex items-center gap-0.5">
                                            <Sparkles className="h-2.5 w-2.5" /> AI
                                        </span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-5 pb-5 flex flex-col gap-3 relative z-10">
                                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {userPerformance?.pendingTasks?.length > 0
                                                ? `You have ${userPerformance.pendingTasks.length} pending task${userPerformance.pendingTasks.length !== 1 ? 's' : ''}.${overdueCount > 0 ? ` ⚠️ ${overdueCount} overdue.` : ' Prioritize wisely.'}`
                                                : 'All systems nominal. Initialize a new project or invite your team to begin.'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleAnalyzeWorkspace} disabled={isAnalyzing}
                                            className="flex-1 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-black h-8 rounded-xl text-[9px] uppercase tracking-widest border border-primary/20 gap-1.5 transition-all"
                                        >
                                            {isAnalyzing
                                                ? <><Loader2 className="h-3 w-3 animate-spin" />Analyzing</>
                                                : <><Brain className="h-3 w-3" />Analyze</>}
                                        </Button>
                                        <Button onClick={() => navigate('/ai-chat')} variant="outline"
                                            className="border-border/60 bg-transparent text-foreground font-black h-8 rounded-xl text-[9px] uppercase tracking-widest hover:border-primary/30 hover:bg-accent gap-1.5 transition-all"
                                        >
                                            <MessageSquare className="h-3 w-3" />Chat
                                        </Button>
                                    </div>
                                </CardContent>
                            </motion.div>

                            {/* Live Activity */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <CircleDot className="h-3.5 w-3.5 text-emerald-400" />
                                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Live Activity</h3>
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-4">
                                        <div className="relative border-l border-border/40 ml-2 pl-4 flex flex-col gap-4">
                                            {analyticsLoading
                                                ? Array.from({ length: 3 }).map((_, i) => (
                                                    <div key={i} className="relative space-y-1.5">
                                                        <div className="absolute -left-[1.35rem] top-1.5 w-2 h-2 rounded-full bg-muted" />
                                                        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                                                        <div className="h-2 w-20 bg-muted/60 rounded animate-pulse" />
                                                    </div>
                                                ))
                                                : analytics?.recentActivity && analytics.recentActivity.length > 0
                                                ? analytics.recentActivity.map((act: any) => (
                                                    <div key={act.id || Math.random()} className="relative">
                                                        <div className="absolute -left-[1.32rem] top-1.5 w-2 h-2 rounded-full bg-primary/60 border-2 border-card" />
                                                        <p className="text-xs text-foreground font-medium leading-snug">
                                                            <span className="text-primary font-bold">@{act.actor?.name?.split(' ')[0] || 'System'}</span>{' '}
                                                            {act.description || act.action?.replace(/_/g, ' ')}
                                                        </p>
                                                        <p className="text-[9px] text-muted-foreground/80 font-black uppercase tracking-widest mt-0.5">
                                                            {formatDistanceToNow(new Date(act.created_at || act.timestamp))} ago
                                                        </p>
                                                    </div>
                                                ))
                                                : <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest italic">No recent activity</p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COL (1/3) ────────────────────────────────────── */}
                    <div className="flex flex-col gap-6 xl:self-start">

                        {/* Personal Stats */}
                        <Card className="bg-card border-border/60">
                            <CardHeader className="pt-4 pb-2 px-5">
                                <CardTitle className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3 text-primary" />Personal Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <div className="flex items-center gap-4">
                                    <CompletionRing percentage={userPerformance?.completionRate || 0} />
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div>
                                            <p className="text-2xl font-black text-foreground tabular-nums leading-none">
                                                {userPerformance?.tasksCompleted || 0}
                                                <span className="text-muted-foreground/40 text-sm font-bold">/{userPerformance?.tasksAssigned || 0}</span>
                                            </p>
                                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">Tasks Completed</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-muted/50 rounded-xl p-2.5 border border-border/60">
                                                <p className="text-lg font-black text-foreground leading-none">{userPerformance?.onTimeDelivery || 0}%</p>
                                                <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">On-Time</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-2.5 border border-border/60">
                                                <p className="text-lg font-black text-foreground leading-none">{userPerformance?.averageCompletionTime || 0}d</p>
                                                <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">Avg Time</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deadlines */}
                        <Card className="bg-card border-border/60">
                            <CardHeader className="pt-4 pb-2 px-5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-amber-400" />Upcoming Deadlines
                                    </CardTitle>
                                    {overdueCount > 0 && (
                                        <span className="text-[8px] font-black bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">
                                            {overdueCount} overdue
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 flex flex-col gap-2">
                                {upcomingDeadlines.length > 0
                                    ? upcomingDeadlines.map((task: any) => (
                                        <DeadlineItem key={task.id} task={task} onClick={() => navigate(`/projects/${task.project_id}`)} />
                                    ))
                                    : (
                                        <div className="py-8 text-center flex flex-col items-center gap-2">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500/20" />
                                            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">No upcoming deadlines</p>
                                        </div>
                                    )
                                }
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
                                    <Card className="bg-card border-primary/25" style={{ boxShadow: '0 0 20px -8px rgba(var(--primary),0.15)' }}>
                                        <CardHeader className="pt-4 pb-2 px-5 border-b border-border/40">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                    <Sparkles className="h-3 w-3" />Intelligence Report
                                                </CardTitle>
                                                <button onClick={() => setAnalysisResult(null)}
                                                    className="p-1 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5">
                                            <ReactMarkdown components={{
                                                p:      ({ children }) => <p className="mb-2 last:mb-0 text-xs text-muted-foreground leading-relaxed">{children}</p>,
                                                strong: ({ children }) => <strong className="text-primary font-black">{children}</strong>,
                                                ul:     ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                li:     ({ children }) => <li className="text-[11px] text-muted-foreground">{children}</li>,
                                                h2:     ({ children }) => <h2 className="text-xs font-black text-foreground mb-1.5 uppercase tracking-wide">{children}</h2>,
                                            }}>
                                                {analysisResult}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

                <div className="h-8" />
            </div>
        </div>
    );
};

export default DashboardPage;