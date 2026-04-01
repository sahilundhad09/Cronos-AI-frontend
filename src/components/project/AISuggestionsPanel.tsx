import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    AlertTriangle,
    ArrowUpRight,
    Users,
    Target,
    Shield,
    Lightbulb,
    RefreshCw,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { toast } from 'sonner';

interface Suggestion {
    task?: string;
    current_priority?: string;
    suggested_priority?: string;
    suggested_assignee?: string;
    risk_level?: string;
    reason?: string;
    description?: string;
    mitigation?: string;
}

interface SuggestionsData {
    priority_suggestions?: Suggestion[];
    assignment_suggestions?: Suggestion[];
    blocker_warnings?: Suggestion[];
    general_recommendations?: string[];
}

interface AISuggestionsPanelProps {
    projectId: string;
}

const RISK_COLORS: Record<string, string> = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    critical: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
};

const AISuggestionsPanel = ({ projectId }: AISuggestionsPanelProps) => {
    const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/projects/${projectId}/ai/suggestions`, {
                params: { suggestion_type: 'all' }
            });
            setSuggestions(response.data.data.suggestions);
            setGeneratedAt(response.data.data.generated_at);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate suggestions');
        } finally {
            setIsLoading(false);
        }
    };

    if (!suggestions && !isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/5">
                    <Sparkles className="h-12 w-12 text-purple-400" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-heading font-black text-white uppercase italic tracking-tighter">
                        AI <span className="text-purple-400">Insights</span>
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] max-w-sm">
                        Get AI-powered priority recommendations, blocker warnings, and smart assignment suggestions
                    </p>
                </div>
                <Button
                    onClick={fetchSuggestions}
                    className="h-11 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black uppercase text-[10px] tracking-widest gap-2 rounded-xl shadow-lg shadow-purple-500/20"
                >
                    <Sparkles className="h-4 w-4" /> Generate Insights
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                <div className="relative">
                    <div className="h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <Sparkles className="h-6 w-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Neural Analysis in Progress...
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 py-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-heading font-black text-white uppercase italic tracking-tight">
                            AI Insights
                        </h3>
                        {generatedAt && (
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                Generated {new Date(generatedAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                    className="h-8 px-3 border-white/10 hover:border-purple-500/30 text-[9px] font-black uppercase tracking-widest gap-2"
                >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 gap-6"
                >
                    {/* Priority Suggestions */}
                    {suggestions?.priority_suggestions && suggestions.priority_suggestions.length > 0 && (
                        <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <Target className="h-4 w-4 text-orange-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                                        Priority Recommendations
                                    </h4>
                                    <Badge variant="outline" className="ml-auto border-orange-500/20 text-orange-400 text-[8px] font-black">
                                        {suggestions.priority_suggestions.length}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    {suggestions.priority_suggestions.map((s, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-orange-500/20 transition-all"
                                        >
                                            <div className="flex items-start gap-2">
                                                <ChevronRight className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                                                <div className="space-y-1.5">
                                                    <p className="text-sm font-bold text-white leading-tight">{s.task}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] font-black uppercase ${PRIORITY_COLORS[s.current_priority?.toLowerCase() || ''] || 'text-slate-400'}`}>
                                                            {s.current_priority}
                                                        </span>
                                                        <ArrowUpRight className="h-3 w-3 text-slate-600" />
                                                        <span className={`text-[9px] font-black uppercase ${PRIORITY_COLORS[s.suggested_priority?.toLowerCase() || ''] || 'text-cyan-400'}`}>
                                                            {s.suggested_priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{s.reason}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Blocker Warnings */}
                    {suggestions?.blocker_warnings && suggestions.blocker_warnings.length > 0 && (
                        <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                                        Blocker Warnings
                                    </h4>
                                    <Badge variant="outline" className="ml-auto border-red-500/20 text-red-400 text-[8px] font-black">
                                        {suggestions.blocker_warnings.length}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    {suggestions.blocker_warnings.map((b, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/20 transition-all"
                                        >
                                            <div className="flex items-start gap-2">
                                                <Shield className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-white leading-tight">{b.task}</p>
                                                        <Badge className={`text-[7px] font-black px-1.5 py-0 border ${RISK_COLORS[b.risk_level?.toLowerCase() || 'low']}`}>
                                                            {b.risk_level?.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium">{b.description}</p>
                                                    {b.mitigation && (
                                                        <p className="text-[10px] text-cyan-400/70 font-bold">
                                                            💡 {b.mitigation}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Assignment Suggestions */}
                    {suggestions?.assignment_suggestions && suggestions.assignment_suggestions.length > 0 && (
                        <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                        <Users className="h-4 w-4 text-cyan-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                                        Assignment Suggestions
                                    </h4>
                                    <Badge variant="outline" className="ml-auto border-cyan-500/20 text-cyan-400 text-[8px] font-black">
                                        {suggestions.assignment_suggestions.length}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    {suggestions.assignment_suggestions.map((a, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all"
                                        >
                                            <div className="flex items-start gap-2">
                                                <ChevronRight className="h-3.5 w-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                                <div className="space-y-1.5">
                                                    <p className="text-xs font-bold text-white leading-tight">{a.task}</p>
                                                    <p className="text-[10px] text-cyan-400 font-black uppercase tracking-wide">
                                                        → {a.suggested_assignee}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{a.reason}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* General Recommendations */}
                    {suggestions?.general_recommendations && suggestions.general_recommendations.length > 0 && (
                        <Card className="bg-[#0A0D18] border-white/5 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <Lightbulb className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                                        Recommendations
                                    </h4>
                                </div>
                                <div className="space-y-2.5">
                                    {suggestions.general_recommendations.map((rec, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all"
                                        >
                                            <div className="h-5 w-5 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-[8px] font-black text-emerald-400">{i + 1}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{rec}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AISuggestionsPanel;
