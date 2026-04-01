import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import {
    Search,
    FolderOpen,
    CheckSquare,
    Users,
    ArrowRight,
    BarChart3,
    Settings,
    Brain,
    LayoutDashboard,
    Command
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface SearchResult {
    id: string;
    type: 'project' | 'page' | 'action';
    title: string;
    subtitle?: string;
    icon: any;
    action: () => void;
}

const SearchDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { projects } = useProjectStore();
    const { activeWorkspace } = useWorkspaceStore();

    // Cmd+K listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const go = useCallback((path: string) => {
        setIsOpen(false);
        navigate(path);
    }, [navigate]);

    // Build search results
    const getResults = (): SearchResult[] => {
        const q = query.toLowerCase().trim();
        const results: SearchResult[] = [];

        // Quick navigation pages (always show if query is empty or matching)
        const pages: SearchResult[] = [
            { id: 'p-dash', type: 'page', title: 'Dashboard', subtitle: 'Overview & stats', icon: LayoutDashboard, action: () => go('/dashboard') },
            { id: 'p-proj', type: 'page', title: 'Projects', subtitle: 'All projects', icon: FolderOpen, action: () => go('/projects') },
            { id: 'p-team', type: 'page', title: 'Team', subtitle: 'Members & roles', icon: Users, action: () => go('/team') },
            { id: 'p-analytics', type: 'page', title: 'Analytics', subtitle: 'Reports & metrics', icon: BarChart3, action: () => go('/analytics') },
            { id: 'p-ai', type: 'page', title: 'AI Chat', subtitle: 'Neural Engine', icon: Brain, action: () => go('/ai-chat') },
            { id: 'p-profile', type: 'page', title: 'Profile', subtitle: 'Account settings', icon: Settings, action: () => go('/profile') },
        ];

        if (activeWorkspace) {
            pages.push({
                id: 'p-ws',
                type: 'page',
                title: 'Workspace Settings',
                subtitle: activeWorkspace.name,
                icon: Settings,
                action: () => go(`/workspaces/${activeWorkspace.id}/settings`)
            });
        }

        // Filter pages
        const filteredPages = q
            ? pages.filter(p => p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q))
            : pages;
        results.push(...filteredPages);

        // Search projects
        const filteredProjects = projects
            .filter(p => !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
            .slice(0, 5)
            .map(p => ({
                id: `proj-${p.id}`,
                type: 'project' as const,
                title: p.name,
                subtitle: p.description?.slice(0, 60) || 'No description',
                icon: FolderOpen,
                action: () => go(`/projects/${p.id}`)
            }));

        if (filteredProjects.length > 0) {
            results.push(...filteredProjects);
        }

        return results;
    };

    const results = getResults();

    // Keyboard navigation
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            results[selectedIndex].action();
        }
    };

    const TYPE_LABELS: Record<string, string> = {
        page: 'NAVIGATE',
        project: 'PROJECT',
        action: 'ACTION',
    };

    const TYPE_COLORS: Record<string, string> = {
        page: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        project: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        action: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    };

    return (
        <>
            {/* Trigger button in header */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-slate-500 hover:text-slate-400 group"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Search</span>
                <kbd className="hidden sm:flex items-center gap-0.5 h-5 px-1.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-600 group-hover:text-slate-500">
                    <Command className="h-2.5 w-2.5" />K
                </kbd>
            </button>

            {/* Search Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl p-0 max-w-2xl w-[90vw] gap-0 [&>button]:hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                        <Search className="h-5 w-5 text-slate-500 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search projects, pages, actions..."
                            className="flex-1 bg-transparent text-sm font-bold text-white placeholder:text-slate-600 outline-none"
                        />
                        <kbd className="h-6 px-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-600 flex items-center">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar py-2">
                        {results.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <CheckSquare className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    No results found
                                </p>
                            </div>
                        ) : (
                            <div className="px-2">
                                {results.map((result, index) => {
                                    const Icon = result.icon;
                                    return (
                                        <button
                                            key={result.id}
                                            onClick={result.action}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${index === selectedIndex
                                                ? 'bg-white/[0.05] border border-white/10'
                                                : 'border border-transparent hover:bg-white/[0.02]'
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-lg border ${TYPE_COLORS[result.type]}`}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{result.title}</p>
                                                {result.subtitle && (
                                                    <p className="text-[9px] text-slate-500 font-medium truncate">{result.subtitle}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${TYPE_COLORS[result.type]}`}>
                                                    {TYPE_LABELS[result.type]}
                                                </span>
                                                {index === selectedIndex && (
                                                    <ArrowRight className="h-3 w-3 text-cyan-400" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <kbd className="h-5 w-5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-600 flex items-center justify-center">↑</kbd>
                                <kbd className="h-5 w-5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-600 flex items-center justify-center">↓</kbd>
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="h-5 px-1.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-600 flex items-center">↵</kbd>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Open</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SearchDialog;
