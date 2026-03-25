import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useThemeStore } from '@/store/useThemeStore';
import {
    TrendingUp,
    Zap,
    Target,
    Activity,
    Clock,
    CheckCircle2,
    Flame,
    Users,
    ArrowUpRight,
    Calendar,
    Brain,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    Area,
    AreaChart,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth/PermissionGate';

import { type Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-card/95 border border-primary/20 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-sm font-bold" style={{ color: entry.color || entry.stroke }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

const GrowthPage = () => {
    const { activeWorkspace } = useWorkspaceStore();
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const { 
        individualGrowth, 
        workspaceGrowth, 
        fetchIndividualGrowth, 
        fetchWorkspaceGrowth, 
    } = useAnalyticsStore();
    
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        fetchIndividualGrowth(activeWorkspace?.id);
        if (activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin') {
            fetchWorkspaceGrowth(activeWorkspace.id);
        }
    }, [activeWorkspace, fetchIndividualGrowth, fetchWorkspaceGrowth]);

    const ig = individualGrowth;
    const wg = Array.isArray(workspaceGrowth) ? workspaceGrowth : [];

    const radarData = ig?.focusArea ? [
        { subject: 'To Do', A: ig.focusArea.todo || 0, fullMark: Math.max(ig.focusArea.todo || 0, ig.focusArea.inProgress || 0, ig.focusArea.done || 0) + 1 },
        { subject: 'In Progress', A: ig.focusArea.inProgress || 0, fullMark: Math.max(ig.focusArea.todo || 0, ig.focusArea.inProgress || 0, ig.focusArea.done || 0) + 1 },
        { subject: 'Completed', A: ig.focusArea.done || 0, fullMark: Math.max(ig.focusArea.todo || 0, ig.focusArea.inProgress || 0, ig.focusArea.done || 0) + 1 },
    ] : [];

    return (
        <PermissionGate roles={['owner', 'admin', 'member']}>
            <div className="h-full bg-background text-foreground overflow-hidden flex flex-col">
            {/* Neural Header */}
            <header className="border-b border-border bg-[hsl(var(--app-header-bg))] backdrop-blur-xl px-8 py-6 flex-shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 shadow-lg shadow-primary/10">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-heading font-black tracking-tighter uppercase italic text-foreground">
                                Growth <span className="text-primary">Intelligence</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Activity className="h-3 w-3 text-cyan-400" />
                                <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">
                                    Neural Velocity • Performance Synthesis
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end mr-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Protocol</p>
                            <p className="text-sm font-bold text-white">{activeWorkspace?.name || 'Global Alpha'}</p>
                        </div>
                        <Button variant="outline" className="h-11 px-6 bg-white/[0.03] border-white/5 hover:border-primary/40 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Session: Q1 2024
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-white/5 border border-border p-1 rounded-2xl h-14 w-full max-w-[400px]">
                            <TabsTrigger 
                                value="personal" 
                                className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 h-full flex-1"
                            >
                                <Zap className="h-3.5 w-3.5 mr-2" /> My Progress
                            </TabsTrigger>
                            {(activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin') && (
                                <TabsTrigger 
                                    value="team" 
                                    className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 h-full flex-1"
                                >
                                    <Users className="h-3.5 w-3.5 mr-2" /> Team Dynamics
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <TabsContent key="personal" value="personal">
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-8"
                            >
                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard 
                                        icon={Flame} 
                                        label="Active Streak" 
                                        value={`${ig?.consistency.streak ?? 0} Days`} 
                                        sub="Neural Consistency" 
                                        color="orange"
                                    />
                                    <StatCard 
                                        icon={Zap} 
                                        label="Velocity" 
                                        value={ig?.velocity?.length ? Math.round(ig.velocity.reduce((acc, v) => acc + (v.completed || 0), 0) / 6) : 0} 
                                        sub="Weekly Avg Tasks" 
                                        color="cyan"
                                        trend="up"
                                    />
                                    <StatCard 
                                        icon={Target} 
                                        label="On-Time Rate" 
                                        value={`${ig?.performance.onTimeRate ?? 0}%`} 
                                        sub="Precision Level" 
                                        color="emerald"
                                    />
                                    <StatCard 
                                        icon={Clock} 
                                        label="Avg Completion" 
                                        value={`${ig?.performance.avgCompletionDays ?? 0}d`} 
                                        sub="Resolution Speed" 
                                        color="purple"
                                    />
                                </div>

                                {/* Main Visualization Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Velocity Chart */}
                                    <Card className="lg:col-span-2 bg-white/[0.02] border border-border hover:border-primary/20 transition-all overflow-hidden group">
                                        <CardContent className="p-4 sm:p-6 lg:p-8">
                                            <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 pt-4">
                                                <div>
                                                    <h3 className="text-base sm:text-xl font-black text-white italic tracking-tighter uppercase mb-1">Weekly Velocity Curve</h3>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Performance trend over last 6 weeks</p>
                                                </div>
                                                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                                                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                                </div>
                                            </div>
                                            <div className="h-[220px] sm:h-[280px] lg:h-[350px] w-full min-w-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={ig?.velocity || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                                        <XAxis 
                                                            dataKey="label" 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fill: isDark ? '#64748b' : '#475569', fontSize: 9, fontWeight: 700 }}
                                                            interval="preserveStartEnd"
                                                        />
                                                        <YAxis 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fill: isDark ? '#64748b' : '#475569', fontSize: 9, fontWeight: 700 }}
                                                            width={28}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="completed" 
                                                            name="Completed"
                                                            stroke="hsl(var(--primary))" 
                                                            strokeWidth={3} 
                                                            fillOpacity={1} 
                                                            fill="url(#velocityGradient)" 
                                                            animationBegin={200}
                                                            animationDuration={1500}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Focus Area Radar */}
                                    <Card className="bg-white/[0.02] border border-border hover:border-cyan-500/20 transition-all overflow-hidden group">
                                        <CardContent className="p-4 sm:p-6 lg:p-8">
                                            <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 pt-4">
                                                <div>
                                                    <h3 className="text-base sm:text-xl font-black text-white italic tracking-tighter uppercase mb-1">Focus Pulse</h3>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Cognitive effort distribution</p>
                                                </div>
                                                <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
                                                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                                </div>
                                            </div>
                                            <div className="h-[220px] sm:h-[280px] lg:h-[350px] w-full min-w-0 flex items-center justify-center">
                                                {radarData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                                            <PolarGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                                            <PolarAngleAxis 
                                                                dataKey="subject" 
                                                                tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 9, fontWeight: 800 }} 
                                                            />
                                                            <Radar
                                                                name="Tasks"
                                                                dataKey="A"
                                                                stroke={isDark ? "#06b6d4" : "#2563eb"}
                                                                fill={isDark ? "#06b6d4" : "#3b82f6"}
                                                                fillOpacity={isDark ? 0.3 : 0.4}
                                                                strokeWidth={4}
                                                            />
                                                            <Tooltip content={<CustomTooltip />} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Insufficient Data</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Activity Heatmap / Consistency Pulse */}
                                <Card className="bg-white/[0.02] border border-border overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6 pt-4">
                                            <Calendar className="h-5 w-5 text-emerald-400" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Consistency Map</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: 30 }).map((_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() - (29 - i));
                                                const dateStr = date.toISOString().split('T')[0];
                                                const isActive = ig?.consistency?.activeDays?.includes(dateStr);
                                                
                                                return (
                                                    <motion.div
                                                        key={i}
                                                        whileHover={{ scale: 1.2 }}
                                                        className={`w-4 h-4 rounded-[3px] border ${
                                                            isActive 
                                                                ? isDark 
                                                                    ? 'bg-emerald-500 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                                                                    : 'bg-emerald-500 border-emerald-600 shadow-sm'
                                                                : isDark 
                                                                    ? 'bg-white/5 border-white/5' 
                                                                    : 'bg-slate-100 border-slate-300'
                                                        }`}
                                                        title={dateStr}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="mt-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <div className="flex items-center gap-1.5 ">
                                                <div className={`w-2.5 h-2.5 rounded-[2px] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-300'}`} />
                                                Inactive
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2.5 h-2.5 rounded-[2px] border ${isDark ? 'bg-emerald-500 border-emerald-400/50' : 'bg-emerald-500 border-emerald-600'}`} />
                                                Active Session
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {(activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin') && (
                            <TabsContent key="team" value="team">
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    <Card className="bg-white/[0.02] border border-border overflow-hidden">
                                        <CardContent className="p-8">
                                            <div className="flex items-center justify-between mb-8 p-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Node Synchronization</h3>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Comparative performance of regional specialists</p>
                                                </div>
                                                <Shield className="h-6 w-6 text-primary/40" />
                                            </div>

                                            <div className="space-y-4">
                                                {wg?.map((member, i) => (
                                                    <motion.div 
                                                        key={member.id}
                                                        variants={itemVariants}
                                                        className="group p-5 rounded-2xl bg-white/[0.02] border border-border hover:border-primary/20 hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center gap-6"
                                                    >
                                                        <div className="flex items-center gap-4 min-w-[240px]">
                                                            <div className="relative">
                                                                <Avatar className="h-14 w-14 rounded-2xl border-2 border-white/5 group-hover:border-primary/40 transition-all">
                                                                    <AvatarImage src={member.avatar_url || ''} />
                                                                    <AvatarFallback className="bg-primary text-primary-foreground font-black text-lg">
                                                                        {member.name.substring(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {member.metrics.streak > 3 && (
                                                                    <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-background shadow-lg">
                                                                        <Flame className="h-3 w-3 text-white fill-current" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-black text-white group-hover:text-primary transition-colors">{member.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{member.role}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                                                            <MetricItem label="Completed" value={member.metrics.completedTasks} icon={CheckCircle2} color="emerald" />
                                                            <MetricItem label="Velocity" value={member.metrics.velocity} icon={Zap} color="cyan" />
                                                            <MetricItem label="On-Time" value={`${member.metrics.onTimeRate}%`} icon={Target} color="primary" />
                                                            <MetricItem label="Streak" value={`${member.metrics.streak}d`} icon={Flame} color="orange" />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${member.metrics.onTimeRate}%` }}
                                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                                    className={`h-full ${member.metrics.onTimeRate > 70 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                />
                                                            </div>
                                                            <ArrowUpRight className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        </TabsContent>
                    )}
                </AnimatePresence>
                </Tabs>
            </main>
        </div>
        </PermissionGate>
    );
};

const StatCard = ({ icon: Icon, label, value, sub, color, trend }: any) => {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colorMap: any = isDark ? {
        orange: 'from-orange-500/20 text-orange-400 border-orange-500/20',
        cyan: 'from-cyan-500/20 text-cyan-400 border-cyan-500/20',
        emerald: 'from-emerald-500/20 text-emerald-400 border-emerald-500/20',
        purple: 'from-purple-500/20 text-purple-400 border-purple-500/20',
    } : {
        orange: 'from-orange-100 text-orange-600 border-orange-400',
        cyan: 'from-cyan-100 text-cyan-600 border-cyan-400',
        emerald: 'from-emerald-100 text-emerald-600 border-emerald-400',
        purple: 'from-purple-100 text-purple-600 border-purple-400',
    };

    return (
        <motion.div variants={itemVariants}>
            <Card className="bg-white/[0.02] border border-border hover:border-primary/30 transition-all group relative overflow-hidden h-full">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[color]} blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity`} />
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4 pt-4">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color]} border shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 text-emerald-400">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black tracking-widest">+12%</span>
                            </div>
                        )}
                    </div>
                    <p className="text-3xl font-black text-white italic tracking-tighter mb-1">{value}</p>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{sub}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const MetricItem = ({ label, value, icon: Icon, color }: any) => {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const colorClasses: any = isDark ? {
        emerald: 'text-emerald-400',
        cyan: 'text-cyan-400',
        primary: 'text-primary',
        orange: 'text-orange-400',
    } : {
        emerald: 'text-emerald-600',
        cyan: 'text-cyan-600',
        primary: 'text-indigo-600',
        orange: 'text-orange-600',
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-3 w-3 ${colorClasses[color]}`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-lg font-black text-white italic tracking-tighter leading-none">{value}</span>
        </div>
    );
};

export default GrowthPage;
