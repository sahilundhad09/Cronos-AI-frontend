import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useProjectStore, Project } from '@/store/useProjectStore';
import {
    BarChart3,
    TrendingUp,
    Target,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Brain,
    Loader2,
    ChevronDown,
    Check,
    Zap,
    Activity,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

const PRIORITY_COLORS: Record<string, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
};

const STATUS_COLORS = ['#06b6d4', '#8b5cf6', '#22c55e'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

const AnalyticsDashboardPage = () => {
    const {
        projectAnalytics,
        workspaceAnalytics,
        userPerformance,
        aiAnalysis,
        isLoading,
        isAnalyzing,
        fetchProjectAnalytics,
        fetchWorkspaceAnalytics,
        fetchUserPerformance,
        analyzeWorkspace,
    } = useAnalyticsStore();

    const { projects, fetchProjects } = useProjectStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Fetch workspace-level data
    useEffect(() => {
        if (activeWorkspace) {
            fetchProjects(activeWorkspace.id);
            fetchWorkspaceAnalytics(activeWorkspace.id);
            fetchUserPerformance();
        }
    }, [activeWorkspace]);

    // Fetch project-level data when project changes
    useEffect(() => {
        if (selectedProject) {
            fetchProjectAnalytics(selectedProject.id);
        }
    }, [selectedProject]);

    // Auto-select first project
    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0]);
        }
    }, [projects]);

    const ws = workspaceAnalytics;
    const pa = projectAnalytics;
    const up = userPerformance;

    // Prepare pie chart data
    const statusPieData = ws ? [
        { name: 'To Do', value: ws.statusBreakdown.todo, color: STATUS_COLORS[0] },
        { name: 'In Progress', value: ws.statusBreakdown.inProgress, color: STATUS_COLORS[1] },
        { name: 'Done', value: ws.statusBreakdown.done, color: STATUS_COLORS[2] },
    ].filter(d => d.value > 0) : [];

    const priorityBarData = pa ? [
        { name: 'Low', value: pa.taskStats.byPriority.low, fill: PRIORITY_COLORS.low },
        { name: 'Medium', value: pa.taskStats.byPriority.medium, fill: PRIORITY_COLORS.medium },
        { name: 'High', value: pa.taskStats.byPriority.high, fill: PRIORITY_COLORS.high },
        { name: 'Urgent', value: pa.taskStats.byPriority.urgent, fill: PRIORITY_COLORS.urgent },
    ] : [];

    // Format burndown dates for chart
    const burndownChartData = pa?.burndownData?.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    })) || [];

    return (
        <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
            {/* Header */}
            <header className="border-b border-border bg-[hsl(var(--app-header-bg))] backdrop-blur-xl px-4 sm:px-6 py-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10">
                            <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-black tracking-tighter uppercase italic text-foreground">
                                Analytics <span className="text-primary">Hub</span>
                            </h1>
                            <p className="text-muted-foreground font-semibold uppercase text-[9px] tracking-[0.2em] mt-0.5">
                                Performance Intelligence • Real-Time Metrics
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* AI Analyze Button */}
                        <Button
                            onClick={() => activeWorkspace && analyzeWorkspace(activeWorkspace.id)}
                            disabled={isAnalyzing || !activeWorkspace}
                            variant="outline"
                            className="h-10 px-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30 hover:border-cyan-500/50 text-white font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                        >
                            {isAnalyzing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Brain className="h-3.5 w-3.5 text-purple-400" />
                            )}
                            {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                        </Button>

                        {/* Project Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 bg-slate-800/50 border-white/10 hover:border-cyan-500/50 text-white font-black uppercase text-[10px] tracking-widest gap-2 transition-all min-w-[180px] justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Target className="h-3.5 w-3.5 text-cyan-400" />
                                        <span className="truncate max-w-[120px]">
                                            {selectedProject?.name || 'All Projects'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-[#0A0D18] border-white/5 text-white rounded-2xl p-2" align="end">
                                <DropdownMenuLabel className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">
                                    Filter by Project
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                {projects.map((project) => (
                                    <DropdownMenuItem
                                        key={project.id}
                                        onClick={() => setSelectedProject(project)}
                                        className={`rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer mb-1 ${selectedProject?.id === project.id
                                            ? 'bg-cyan-500/10 text-cyan-400'
                                            : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-xs font-bold truncate">{project.name}</span>
                                        {selectedProject?.id === project.id && <Check className="h-3.5 w-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
                {isLoading && !ws ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Loading Analytics...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Workspace Overview Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <StatCard
                                icon={FolderOpen}
                                label="Total Projects"
                                value={ws?.projectCount ?? 0}
                                sub={`${ws?.activeProjects ?? 0} active`}
                                color="cyan"
                            />
                            <StatCard
                                icon={Target}
                                label="Total Tasks"
                                value={ws?.totalTasks ?? 0}
                                sub={`${ws?.completedTasks ?? 0} completed`}
                                color="emerald"
                            />
                            <StatCard
                                icon={AlertTriangle}
                                label="Pending Tasks"
                                value={(ws?.statusBreakdown.todo ?? 0) + (ws?.statusBreakdown.inProgress ?? 0)}
                                sub="Awaiting action"
                                color="amber"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Completion Rate"
                                value={`${ws?.completionRate ?? 0}%`}
                                sub={ws && ws.completionRate >= 50 ? 'On track' : 'Needs attention'}
                                color={ws && ws.completionRate >= 50 ? 'emerald' : 'amber'}
                                trend={ws && ws.completionRate >= 50 ? 'up' : 'down'}
                            />
                            <StatCard
                                icon={Users}
                                label="Team Size"
                                value={ws?.memberCount ?? 0}
                                sub="Specialists"
                                color="purple"
                            />
                        </div>

                        {/* User Performance Cards */}
                        {up && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <StatCard
                                    icon={Zap}
                                    label="My Tasks"
                                    value={up.tasksAssigned}
                                    sub={`${up.tasksCompleted} completed`}
                                    color="cyan"
                                />
                                <StatCard
                                    icon={Clock}
                                    label="My Pending"
                                    value={up.pendingTasks?.length ?? 0}
                                    sub="To be finished"
                                    color="amber"
                                />
                                <StatCard
                                    icon={CheckCircle2}
                                    label="My Completion"
                                    value={`${up.completionRate}%`}
                                    sub="Personal rate"
                                    color="emerald"
                                    trend={up.completionRate >= 50 ? 'up' : 'down'}
                                />
                                <StatCard
                                    icon={TrendingUp}
                                    label="Avg Time"
                                    value={`${up.averageCompletionTime}d`}
                                    sub="Per task"
                                    color="purple"
                                />
                                <StatCard
                                    icon={AlertTriangle}
                                    label="On-Time"
                                    value={`${up.onTimeDelivery}%`}
                                    sub="Delivery rate"
                                    color={up.onTimeDelivery >= 70 ? 'emerald' : 'red'}
                                    trend={up.onTimeDelivery >= 70 ? 'up' : 'down'}
                                />
                            </div>
                        )}

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Burndown Chart */}
                            <Card className="bg-card border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6 pt-4">
                                        <div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Burndown Chart</h3>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Last 30 days • {selectedProject?.name}</p>
                                        </div>
                                        <Activity className="h-5 w-5 text-primary/40" />
                                    </div>
                                    {burndownChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <AreaChart data={burndownChartData}>
                                                <defs>
                                                    <linearGradient id="remainingGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                                    interval="preserveStartEnd"
                                                />
                                                <YAxis
                                                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="remaining"
                                                    name="Remaining"
                                                    stroke="#06b6d4"
                                                    strokeWidth={2}
                                                    fill="url(#remainingGrad)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="completed"
                                                    name="Completed"
                                                    stroke="#22c55e"
                                                    strokeWidth={2}
                                                    fill="url(#completedGrad)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[240px] flex items-center justify-center">
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No burndown data available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Status Distribution Pie Chart */}
                            <Card className="bg-card border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6 pt-4">
                                        <div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Status Distribution</h3>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Across all workspace tasks</p>
                                        </div>
                                        <PieChart className="h-5 w-5 text-primary/40" />
                                    </div>
                                    {statusPieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <RechartsPieChart>
                                                <Pie
                                                    data={statusPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {statusPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend
                                                    formatter={(value) => (
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{value}</span>
                                                    )}
                                                />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[240px] flex items-center justify-center">
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No status data available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Priority & Workload Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Priority Distribution */}
                            <Card className="bg-card border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6 pt-4">
                                        <div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Priority Breakdown</h3>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{selectedProject?.name}</p>
                                        </div>
                                        <AlertTriangle className="h-5 w-5 text-primary/40" />
                                    </div>
                                    {priorityBarData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={priorityBarData} barSize={40}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" name="Tasks" radius={[8, 8, 0, 0]}>
                                                    {priorityBarData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[240px] flex items-center justify-center">
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Select a project to view priorities</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Team Workload */}
                            <Card className="bg-card border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6 pt-4">
                                        <div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Team Workload</h3>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Assignee distribution • {selectedProject?.name}</p>
                                        </div>
                                        <Users className="h-5 w-5 text-primary/40" />
                                    </div>
                                    {pa && pa.assigneeWorkload.length > 0 ? (
                                        <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                                            {pa.assigneeWorkload.map((item) => {
                                                const pct = item.taskCount > 0
                                                    ? Math.round((item.completedCount / item.taskCount) * 100)
                                                    : 0;
                                                return (
                                                    <div key={item.member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/5 flex items-center justify-center text-cyan-400 font-black text-xs flex-shrink-0">
                                                            {item.member.avatar_url ? (
                                                                <img src={item.member.avatar_url} alt={item.member.name} className="h-full w-full object-cover rounded-lg" />
                                                            ) : (
                                                                item.member.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="text-xs font-bold text-white truncate">{item.member.name}</span>
                                                                <span className="text-[10px] font-black text-slate-500 flex-shrink-0 ml-2">
                                                                    {item.completedCount}/{item.taskCount}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-cyan-500 rounded-full transition-all duration-700 shadow-[0_0_6px_#06b6d4]"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="border-white/5 text-[9px] font-black ml-2 flex-shrink-0">
                                                            {pct}%
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-[240px] flex items-center justify-center">
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No workload data available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* AI Analysis Section */}
                        {aiAnalysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="bg-gradient-to-br from-purple-500/[0.03] to-cyan-500/[0.03] border-purple-500/20 overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-6 pt-4">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                                                <Sparkles className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-primary uppercase tracking-widest">AI Workspace Analysis</h3>
                                                <p className="text-[9px] text-foreground font-bold uppercase tracking-widest mt-0.5 opacity-70">
                                                    Generated {new Date(aiAnalysis.generated_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none text-foreground leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="mb-3 last:mb-0 text-sm">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                                    strong: ({ children }) => <strong className="text-primary font-black">{children}</strong>,
                                                    h1: ({ children }) => <h1 className="text-lg font-black text-primary mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-base font-black text-primary mb-2">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-sm font-black text-primary mb-2">{children}</h3>,
                                                }}
                                            >
                                                {aiAnalysis.analysis}
                                            </ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Overdue Alert */}
                        {pa && pa.taskStats.overdue > 0 && (
                            <Card className="bg-red-500/[0.03] border-red-500/20 overflow-hidden">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">
                                            {pa.taskStats.overdue} Overdue Task{pa.taskStats.overdue > 1 ? 's' : ''}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                            In {selectedProject?.name} — these tasks have passed their due date
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

// Stat Card Component
const StatCard = ({
    icon: Icon,
    label,
    value,
    sub,
    color,
    trend,
}: {
    icon: any;
    label: string;
    value: string | number;
    sub: string;
    color: string;
    trend?: 'up' | 'down';
}) => {
    const colorMap: Record<string, string> = {
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
        red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    };

    return (
        <Card className="bg-card border-border hover:border-primary/20 transition-all overflow-hidden group">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3 pt-4">
                    <div className={`p-2 rounded-xl bg-gradient-to-br border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-0.5 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        </div>
                    )}
                </div>
                <p className="text-2xl font-black text-foreground tracking-tight mb-1">{value}</p>
                <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">{sub}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AnalyticsDashboardPage;
