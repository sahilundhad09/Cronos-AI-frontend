import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Target,
    TrendingUp,
    Clock,
    Plus,
    ArrowUpRight,
    Bot,
    Layers,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';

const DashboardPage = () => {
    const { user } = useAuthStore();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };



    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-heading font-black tracking-tighter uppercase italic">
                        Neural <span className="text-cyan-400">Overview</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Welcome back, Operator {user?.name?.split(' ')[0]} // Status: Optimal
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl px-6 uppercase tracking-widest text-[10px]">
                        Intelligence Report
                    </Button>
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20">
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
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
                    value="12"
                    trend="+2 this week"
                    icon={<Layers className="h-5 w-5" />}
                    color="cyan"
                />
                <DashboardStatCard
                    label="Neural Tasks"
                    value="156"
                    trend="89% completion rate"
                    icon={<Zap className="h-5 w-5" />}
                    color="teal"
                />
                <DashboardStatCard
                    label="Team Throughput"
                    value="48.2"
                    trend="+12% velocity"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="indigo"
                />
                <DashboardStatCard
                    label="Time Optimized"
                    value="124h"
                    trend="AI efficiency gain"
                    icon={<Clock className="h-5 w-5" />}
                    color="emerald"
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Projects (Placeholder) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-heading font-black tracking-tight uppercase italic flex items-center gap-2">
                            <Target className="h-5 w-5 text-cyan-500" /> High-Priority <span className="text-slate-500">Orchestrations</span>
                        </h2>
                        <Button variant="link" className="text-cyan-500 font-bold uppercase text-[10px] tracking-widest italic">View All</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-white/5 p-2 rounded-lg">
                                            <Layers className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <div className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-widest border border-cyan-500/20">
                                            In Progress
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-heading font-black text-white group-hover:text-cyan-400 transition-colors">Project Ω - Neural Link</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight line-clamp-1">Orchestrating multi-layered data pipelines</p>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Sync Progress</span>
                                            <span>{60 + i * 5}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${60 + i * 5}%` }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                                "Operator, Project Ω is showing a 15% velocity drop. Would you like me to re-assign tasks for optimal throughput?"
                            </p>
                            <div className="space-y-3">
                                <Button className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-[#030408] text-cyan-400 font-black h-10 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-cyan-500/20">
                                    Optimize Workflows
                                </Button>
                                <Button variant="ghost" className="w-full text-slate-500 hover:text-white font-bold text-[9px] uppercase tracking-[0.2em]">
                                    Ignore Protocol
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Stream */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-heading font-black text-slate-400 uppercase italic tracking-widest flex items-center gap-2 px-2">
                            <Activity className="h-4 w-4 text-emerald-500" /> Data <span className="text-slate-600">Stream</span>
                        </h3>
                        <div className="space-y-5 border-l border-white/5 ml-4 pl-6 relative">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[1.55rem] top-1.5 w-2 h-2 rounded-full bg-white/10 border border-[#030408]" />
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-white font-bold leading-none">
                                            <span className="text-cyan-400">@DevOps_AI</span> accepted Task - {i}02
                                        </p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{i * 10} minutes ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardStatCard = ({ label, value, trend, icon, color }: { label: string; value: string; trend: string; icon: React.ReactNode; color: string }) => (
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
                <h3 className="text-3xl font-heading font-black text-white tracking-tighter">{value}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">{trend}</span>
            </div>
        </CardContent>
    </Card>
);

export default DashboardPage;
