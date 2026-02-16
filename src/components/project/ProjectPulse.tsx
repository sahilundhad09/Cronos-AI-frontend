import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Sparkles,
    Flag
} from 'lucide-react';
import { useAIStore } from '@/store/useAIStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectPulseProps {
    projectId: string;
}

const ProjectPulse: React.FC<ProjectPulseProps> = ({ projectId }) => {
    const { getProjectPulse, isGenerating } = useAIStore();
    const [pulseData, setPulseData] = useState<any>(null);

    const fetchPulse = async () => {
        try {
            const data = await getProjectPulse(projectId);
            setPulseData(data);
        } catch (error) {
            console.error('Failed to fetch project pulse', error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchPulse();
        }
    }, [projectId]);

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
        }
    };

    const getStatusIcon = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'critical': return <AlertTriangle className="h-4 w-4" />;
            case 'high': return <AlertTriangle className="h-4 w-4" />;
            case 'medium': return <TrendingUp className="h-4 w-4" />;
            case 'low': return <CheckCircle2 className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    if (isGenerating && !pulseData) {
        return (
            <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Synchronizing Pulse...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/20 transition-all duration-500 overflow-hidden relative group">
            <CardHeader className="pb-2 border-b border-white/5 bg-gradient-to-r from-cyan-500/5 to-transparent">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-heading font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-500" /> Project <span className="text-cyan-400">Pulse</span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchPulse}
                        disabled={isGenerating}
                        className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 gap-1"
                    >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Recalculate
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <AnimatePresence mode="wait">
                    {pulseData ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Predicted Status</h4>
                                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${getRiskColor(pulseData.pulse.risk_level)}`}>
                                        {getStatusIcon(pulseData.pulse.risk_level)}
                                        {pulseData.pulse.project_status} // {pulseData.pulse.risk_level} Risk
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Completion</h4>
                                    <p className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase italic">{pulseData.pulse.estimated_completion}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <Flag className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Velocity Report</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic">
                                    "{pulseData.pulse.summary}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tasks Left</p>
                                    <p className="text-lg font-black text-white">{pulseData.raw_stats.remainingTasks}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Weekly Drift</p>
                                    <p className="text-lg font-black text-white">{pulseData.raw_stats.weeklyVelocity} / wk</p>
                                </div>
                            </div>

                            {pulseData.pulse.risk_reason && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/70 border-t border-white/5 pt-4">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Blocker Link: {pulseData.pulse.risk_reason}</span>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-6 space-y-4"
                        >
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural analytics pending for this sector</p>
                            <Button
                                onClick={fetchPulse}
                                className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-[#030408] text-cyan-400 font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] border border-cyan-500/20"
                            >
                                Initialize Analytics
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ProjectPulse;
