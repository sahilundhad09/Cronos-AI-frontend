import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Briefcase, 
    LayoutDashboard, 
    Users, 
    Brain, 
    Settings, 
    Plus,
    ChevronRight,
    Command
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectStore } from '@/store/useProjectStore';

interface CommandHubProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CommandHub: React.FC<CommandHubProps> = ({ isOpen, onOpenChange }) => {
    const navigate = useNavigate();
    const { projects } = useProjectStore();
    const [query, setQuery] = useState('');

    // Reset query when opening
    useEffect(() => {
        if (isOpen) setQuery('');
    }, [isOpen]);

    const navigationItems = [
        { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
        { id: 'proj', label: 'All Projects', icon: Briefcase, path: '/projects', category: 'Navigation' },
        { id: 'team', label: 'Team Protocol', icon: Users, path: '/team', category: 'Navigation' },
        { id: 'neural', label: 'Neural Engine', icon: Brain, path: '/ai-chat', category: 'Navigation' },
        { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings', category: 'Navigation' },
    ];

    const actionItems = [
        { id: 'new-proj', label: 'Initialize New Project', icon: Plus, action: 'create-project', category: 'Actions' },
    ];

    const filteredProjects = useMemo(() => {
        if (!query) return projects.slice(0, 5);
        return projects.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
    }, [projects, query]);

    const filteredNav = useMemo(() => {
        if (!query) return navigationItems;
        return navigationItems.filter(item => 
            item.label.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    const handleSelect = (path?: string, action?: string) => {
        if (path) {
            navigate(path);
            onOpenChange(false);
        } else if (action === 'create-project') {
            // This might need more complex logic to trigger the dialog in MainLayout
            // For now, let's just go to projects page
            navigate('/projects');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 gap-0 bg-[#0A0D18]/95 backdrop-blur-2xl border-white/10 overflow-hidden rounded-3xl shadow-2xl shadow-cyan-500/10">
                <DialogHeader className="p-4 border-b border-white/5">
                    <DialogTitle className="sr-only">Command Hub Search</DialogTitle>
                    <div className="flex items-center gap-3 px-2">
                        <Search className="h-5 w-5 text-cyan-400 animate-pulse" />
                        <Input
                            placeholder="Search projects, tasks, or protocols..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg font-bold placeholder:text-slate-600 h-12"
                            autoFocus
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[10px] font-black text-slate-500 uppercase">ESC</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="p-2 pb-4">
                        {/* Projects Category */}
                        {filteredProjects.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Projects</h3>
                                <div className="space-y-1">
                                    {filteredProjects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleSelect(`/projects/${project.id}`)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 group transition-all text-left"
                                        >
                                            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-[#030408] group-hover:border-cyan-500 transition-all">
                                                <Briefcase className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-200 group-hover:text-white truncate">{project.name}</span>
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-cyan-400">Project</span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{project.description || 'No neural description available'}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Category */}
                        {filteredNav.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocols</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    {filteredNav.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item.path)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 group transition-all text-left"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-slate-300 group-hover:text-white text-sm">{item.label}</span>
                                            <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-all text-cyan-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions Category */}
                        {!query && (
                            <div>
                                <h3 className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quick Actions</h3>
                                <div className="space-y-1">
                                    {actionItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(undefined, item.action)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-emerald-500/10 group transition-all text-left"
                                        >
                                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#030408] transition-all">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-slate-300 group-hover:text-white">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {query && filteredProjects.length === 0 && filteredNav.length === 0 && (
                            <div className="py-12 text-center">
                                <Command className="h-10 w-10 text-slate-700 mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No neural signals matching "{query}"</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-500">↑↓</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-500">ENTER</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Select</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
