import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    MessageSquare,
    Sparkles,
    Loader2,
    ChevronDown,
    ChevronUp,
    Quote
} from 'lucide-react';
import { useAIStore } from '@/store/useAIStore';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSummarizerProps {
    projectId: string;
    comments: any[];
}

const CommentSummarizer: React.FC<CommentSummarizerProps> = ({ projectId, comments }) => {
    const { summarizeComments, isGenerating } = useAIStore();
    const [summary, setSummary] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSummarize = async () => {
        if (comments.length === 0) return;
        try {
            const result = await summarizeComments(projectId, comments);
            setSummary(result);
            setIsExpanded(true);
        } catch (error) {
            console.error('Failed to summarize comments', error);
        }
    };

    if (comments.length < 2 && !summary) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Discussion Protocol
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={isGenerating || comments.length === 0}
                    className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-2 border border-cyan-500/10"
                >
                    {isGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Sparkles className="h-3 w-3" />
                    )}
                    Neural Catch-up
                </Button>
            </div>

            <AnimatePresence>
                {summary && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 relative group">
                            <div className="absolute top-3 right-3">
                                <Quote className="h-4 w-4 text-cyan-500/20" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-8 bg-cyan-500/30 rounded-full" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-500/70">AI Intelligence Summary</span>
                                </div>
                                <div className="prose prose-invert prose-xs max-w-none text-[11px] font-bold text-slate-400 leading-relaxed italic whitespace-pre-line">
                                    {summary}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommentSummarizer;
