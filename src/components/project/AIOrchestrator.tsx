import React, { useState } from 'react';
import { useAIStore, AIGeneration } from '@/store/useAIStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Zap,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Sparkles,
    Loader2,
    Calendar,
    Flag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIOrchestratorProps {
    projectId: string;
}

const AIOrchestrator: React.FC<AIOrchestratorProps> = ({ projectId }) => {
    const { generateTasks, acceptGeneration, isGenerating, error } = useAIStore();
    const { fetchProjectTasks } = useTaskStore();
    const [prompt, setPrompt] = useState('');
    const [currentGen, setCurrentGen] = useState<AIGeneration | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        try {
            const gen = await generateTasks(projectId, prompt);
            setCurrentGen(gen);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleAccept = async () => {
        if (!currentGen) return;
        try {
            const indices = currentGen.generated_tasks.map((_, i) => i);
            await acceptGeneration(projectId, currentGen.id, indices);
            await fetchProjectTasks(projectId);
            setCurrentGen(null);
            setPrompt('');
        } catch (err: any) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 h-full py-6">
            {/* Command Input */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-xl font-heading font-black text-white uppercase italic tracking-tighter">Neural <span className="text-cyan-400">Llama Orchestrator</span></h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Provide mission parameters for automated milestone decomposition</p>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur opacity-30 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative bg-[#0A0D18] border border-white/5 rounded-3xl p-6 space-y-4">
                        <Textarea
                            value={prompt}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                            placeholder="e.g. Build a secure client portal with file sharing, real-time collaboration, and multi-factor authentication. Include design, backend infrastructure, and testing phases..."
                            className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-700 resize-none min-h-[120px] font-bold text-sm leading-relaxed p-0"
                        />
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Engine: Groq / Llama 3.3 70B</span>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Latency: Optimized</span>
                            </div>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20 gap-3"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Objectives...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4" /> Initialize Generation
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <XCircle className="h-4 w-4" /> {error}
                    </div>
                )}
            </div>

            {/* Preview Area */}
            {currentGen && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-heading font-black text-white uppercase italic tracking-tighter">Generated <span className="text-cyan-400">Milestones</span></h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Review and accept the proposed task structure</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentGen(null)}
                                className="text-slate-500 hover:text-white uppercase font-black text-[9px] tracking-widest"
                            >
                                Reject All
                            </Button>
                            <Button
                                onClick={handleAccept}
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#030408] font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 gap-3"
                            >
                                <CheckCircle2 className="h-4 w-4" /> Deploy to Workspace
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 600px)' }}>
                        {currentGen.generated_tasks.map((task, idx) => (
                            <Card key={idx} className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all group">
                                <CardContent className="p-5 flex items-start gap-6">
                                    <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                                        <span className="text-sm font-black text-cyan-400">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">{task.title}</h4>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">{task.description}</p>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                                                <Flag className="h-3.5 w-3.5" />
                                                <Badge variant="outline" className="text-[8px] border-slate-700 h-5 px-2">{task.priority || 'medium'}</Badge>
                                            </div>
                                            {task.estimated_hours && (
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{task.estimated_hours}h</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIOrchestrator;
