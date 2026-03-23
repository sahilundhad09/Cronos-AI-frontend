import React, { useEffect, useRef, useState } from 'react';
import { useAIStore, AIGeneration } from '@/store/useAIStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Zap,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    Loader2,
    Calendar,
    Flag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIOrchestratorProps {
    projectId: string;
    isActive?: boolean;
}

const AIOrchestrator: React.FC<AIOrchestratorProps> = ({ projectId, isActive = true }) => {
    const { generateTasks, acceptGeneration, isGenerating } = useAIStore();
    const { fetchProjectTasks } = useTaskStore();
    const [prompt, setPrompt] = useState('');
    const [taskCount, setTaskCount] = useState(8);
    const [currentGen, setCurrentGen] = useState<AIGeneration | null>(null);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isActive && containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isActive]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        try {
            const gen = await generateTasks(projectId, prompt, taskCount);
            setCurrentGen(gen);
            setSelectedIndices(gen.generated_tasks.map((_, i) => i));
        } catch (err: any) {
            console.error('❌ Error generating tasks:', err.message);
        }
    };

    const toggleTaskSelection = (idx: number) => {
        setSelectedIndices(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleAccept = async () => {
        if (!currentGen || selectedIndices.length === 0) return;
        try {
            await acceptGeneration(projectId, currentGen.id, selectedIndices);
            await fetchProjectTasks(projectId);
            setCurrentGen(null);
            setSelectedIndices([]);
            setPrompt('');
        } catch (err: any) {
            console.error(err);
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pr-1 pb-6">

            {/* ── Command Input ── */}
            <div className="space-y-4">

                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <h2 className="text-lg sm:text-xl font-heading font-black text-foreground uppercase italic tracking-tighter">
                            Neural <span className="text-primary">Llama Orchestrator</span>
                        </h2>
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-relaxed">
                            Provide mission parameters for automated milestone decomposition
                        </p>
                    </div>
                </div>

                {/* Input card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-20 group-focus-within:opacity-60 transition-opacity" />
                    <div className="relative bg-card border border-primary/60 rounded-2xl p-4 space-y-4">

                        <Textarea
                            value={prompt}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                            placeholder="e.g. Build a secure client portal with file sharing, real-time collaboration, and multi-factor authentication..."
                            className="bg-transparent text-muted-foreground focus-visible:ring-0 placeholder:text-muted-foreground/60 resize-none min-h-[80px] sm:min-h-[100px] font-bold text-sm leading-relaxed p-0 hover:border-primary/90 p-3"
                        />

                        {/* Controls row — stacks on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-border">

                            {/* Left: slider + meta */}
                            <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-6 flex-1">

                                {/* Task count slider */}
                                <div className="flex items-center gap-3 w-full xs:w-auto xs:max-w-xs flex-1">
                                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] whitespace-nowrap flex-shrink-0">Tasks:</span>
                                    <div className="flex-1">
                                        <input
                                            type="range"
                                            min="3"
                                            max="15"
                                            value={taskCount}
                                            onChange={(e) => setTaskCount(parseInt(e.target.value))}
                                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted-foreground/40 accent-primary"
                                            aria-label="Generated task count"
                                            title="Generated task count"
                                        />
                                    </div>
                                    <span className="text-xs font-black text-primary tabular-nums min-w-[2ch] text-center flex-shrink-0">{taskCount}</span>
                                </div>

                                {/* Engine meta — hidden on mobile */}
                                <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                                    <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Groq / Llama 3.3 70B</span>
                                    <span className="text-foreground/10">·</span>
                                    <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Latency: Optimized</span>
                                </div>
                            </div>

                            {/* Generate button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black h-10 rounded-xl px-5 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 gap-2 flex-shrink-0 transition-all font-heading"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Zap className="h-3.5 w-3.5" /> Initialize Generation</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Generated Tasks Preview ── */}
            {currentGen && currentGen.generated_tasks && currentGen.generated_tasks.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Section header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-0.5">
                            <h3 className="text-base sm:text-lg font-heading font-black text-foreground uppercase italic tracking-tight">
                                Generated <span className="text-primary">Milestones</span>
                            </h3>
                            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                {selectedIndices.length} of {currentGen.generated_tasks.length} selected
                            </p>
                        </div>

                        {/* Action buttons — scrollable row on xs */}
                        <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-0.5 flex-shrink-0">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedIndices(currentGen.generated_tasks.map((_, i) => i))}
                                disabled={selectedIndices.length === currentGen.generated_tasks.length}
                                className="flex-shrink-0 text-muted-foreground/40 hover:text-foreground uppercase font-black text-[9px] tracking-widest h-8 px-3 disabled:opacity-30"
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedIndices([])}
                                disabled={selectedIndices.length === 0}
                                className="flex-shrink-0 text-muted-foreground/40 hover:text-foreground uppercase font-black text-[9px] tracking-widest h-8 px-3 disabled:opacity-30"
                            >
                                None
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={isGenerating || selectedIndices.length === 0}
                                className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black h-9 rounded-xl px-4 sm:px-5 uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20 gap-2 transition-all"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Deploy {selectedIndices.length} {selectedIndices.length === 1 ? 'Task' : 'Tasks'}
                            </Button>
                        </div>
                    </div>

                    {/* Task cards */}
                    <div className="grid gap-2.5">
                        {currentGen.generated_tasks.map((task, idx) => {
                            const isSelected = selectedIndices.includes(idx);
                            return (
                                <Card
                                    key={idx}
                                    onClick={() => toggleTaskSelection(idx)}
                                    className={`border transition-all duration-200 group cursor-pointer ${
                                        isSelected
                                            ? 'bg-emerald-500/[0.04] border-emerald-500/40'
                                            : 'bg-muted/10 border-border/50 hover:border-primary/25 hover:bg-accent/30'
                                    }`}
                                >
                                    <CardContent className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">

                                        {/* Index / check indicator */}
                                        <div className={`h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center transition-all border ${
                                            isSelected
                                                ? 'bg-emerald-500/15 border-emerald-500/40'
                                                : 'bg-cyan-500/[0.08] border-cyan-500/20 group-hover:border-cyan-500/40'
                                        }`}>
                                            {isSelected ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <span className="text-sm font-black text-cyan-400 tabular-nums">{idx + 1}</span>
                                            )}
                                        </div>

                                        {/* Task body */}
                                        <div className="flex-1 space-y-1.5 min-w-0">
                                            <h4 className={`text-sm font-bold transition-colors leading-snug ${
                                                isSelected ? 'text-emerald-400' : 'text-foreground group-hover:text-primary'
                                            }`}>
                                                {task.title}
                                            </h4>

                                            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">
                                                {task.description}
                                            </p>

                                            {/* Meta pills — wrap on small screens */}
                                            <div className="flex items-center flex-wrap gap-2 gap-y-1.5 pt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Flag className="h-3 w-3 text-muted-foreground/20 flex-shrink-0" />
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[8px] border-border text-muted-foreground/60 h-4 px-1.5 uppercase font-black tracking-widest"
                                                    >
                                                        {task.priority || 'medium'}
                                                    </Badge>
                                                </div>

                                                {task.estimated_hours && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                                        <span>{task.estimated_hours}h</span>
                                                    </div>
                                                )}

                                                {task.suggested_assignee && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/70">
                                                        <div className="h-4 w-4 rounded-md bg-primary/10 flex items-center justify-center text-[8px] font-black flex-shrink-0">
                                                            {task.suggested_assignee.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="truncate max-w-[12ch]">{task.suggested_assignee}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <ChevronRight className={`h-4 w-4 flex-shrink-0 mt-1 transition-colors ${
                                            isSelected ? 'text-emerald-500' : 'text-muted-foreground/20 group-hover:text-primary'
                                        }`} />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIOrchestrator;