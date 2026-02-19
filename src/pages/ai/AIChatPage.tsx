import { useState, useEffect } from 'react';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import {
    Brain,
    Sparkles,
    Target,
    MessageSquare,
    Zap,
    ChevronDown,
    Check,
    FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatPage = () => {
    const { projects, fetchProjects } = useProjectStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        if (activeWorkspace) {
            fetchProjects(activeWorkspace.id);
        }
    }, [activeWorkspace, fetchProjects]);

    // Auto-select first project if none selected
    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0]);
        }
    }, [projects, selectedProject]);

    return (
        <div className="h-full flex flex-col bg-[#030408] overflow-hidden">
            {/* Page Header */}
            <header className="border-b border-white/5 bg-[#030408]/50 backdrop-blur-xl px-6 py-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                                <Brain className="h-7 w-7 text-purple-400" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#030408] animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-black tracking-tighter uppercase italic text-white">
                                Neural <span className="text-cyan-400">Engine</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] mt-0.5">
                                AI-Powered Project Intelligence • Active
                            </p>
                        </div>
                    </div>

                    {/* Project Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden sm:block">
                            Active Neural Link
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 bg-slate-800/50 border-white/10 hover:border-cyan-500/50 text-white font-black uppercase text-[10px] tracking-widest gap-2 transition-all min-w-[200px] justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Target className="h-3.5 w-3.5 text-cyan-400" />
                                        <span className="truncate max-w-[140px]">
                                            {selectedProject?.name || 'Select Project'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72 bg-[#0A0D18] border-white/5 text-white rounded-2xl p-2" align="end">
                                <DropdownMenuLabel className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">
                                    Select Project
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                                    {projects.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <FolderOpen className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                No projects found
                                            </p>
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <DropdownMenuItem
                                                key={project.id}
                                                onClick={() => setSelectedProject(project)}
                                                className={`rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer mb-1 transition-colors ${selectedProject?.id === project.id
                                                    ? 'bg-cyan-500/10 text-cyan-400'
                                                    : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedProject?.id === project.id
                                                        ? 'bg-cyan-500 text-[#030408]'
                                                        : 'bg-white/5 text-slate-400'
                                                        }`}>
                                                        {project.name.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <span className="text-xs font-bold truncate block">{project.name}</span>
                                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedProject?.id === project.id && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedProject ? (
                        <motion.div
                            key={selectedProject.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <AIChatPanel projectId={selectedProject.id} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex items-center justify-center"
                        >
                            <div className="text-center max-w-lg px-6">
                                {/* Animated Logo */}
                                <div className="relative mx-auto w-24 h-24 mb-8">
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/5 animate-pulse" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Brain className="h-12 w-12 text-purple-400/50" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500/30 rounded-full animate-ping" />
                                </div>

                                <h2 className="text-2xl font-heading font-black text-white uppercase italic tracking-tighter mb-3">
                                    Awaiting <span className="text-cyan-400">Neural Link</span>
                                </h2>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed mb-8">
                                    Select a project from the dropdown above to establish a connection with the AI intelligence engine
                                </p>

                                {/* Feature Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all group">
                                        <MessageSquare className="h-5 w-5 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Smart Chat</h4>
                                        <p className="text-[9px] text-slate-600 font-bold leading-relaxed">
                                            Ask questions about your project status and tasks
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all group">
                                        <Sparkles className="h-5 w-5 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Task Gen</h4>
                                        <p className="text-[9px] text-slate-600 font-bold leading-relaxed">
                                            Create and assign tasks using natural language
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group">
                                        <Zap className="h-5 w-5 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Analysis</h4>
                                        <p className="text-[9px] text-slate-600 font-bold leading-relaxed">
                                            Get AI-powered insights on project health
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AIChatPage;
