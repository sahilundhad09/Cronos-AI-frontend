import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Search,
    Layers,
    MoreVertical,
    ArrowUpRight,
    Clock,
    LayoutGrid,
    List,
    X
} from 'lucide-react';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
    const navigate = useNavigate();
    const { activeWorkspace } = useWorkspaceStore();
    const {
        projects,
        isLoading,
        fetchProjects,
        setActiveProject
    } = useProjectStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (activeWorkspace) {
            fetchProjects(activeWorkspace.id);
        }
    }, [activeWorkspace, fetchProjects]);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
    };

    const itemVariants = {
        hidden: { y: 16, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } }
    };

    if (!activeWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-6 text-center">
                <div className="bg-card p-8 rounded-2xl border border-border mb-6 max-w-sm">
                    <Briefcase className="h-10 w-10 text-muted-foreground/60 mb-4 mx-auto" />
                    <h2 className="text-xl font-heading font-black text-foreground italic uppercase tracking-tight">
                        Sector <span className="text-primary">Locked</span>
                    </h2>
                    <p className="text-muted-foreground/60 font-bold uppercase text-[9px] tracking-widest mt-3 leading-relaxed">
                        Navigate to a workspace to access project orchestrations.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background text-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tighter uppercase italic text-foreground">
                            Project <span className="text-primary">Command</span>
                        </h1>
                        <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-[0.25em]">
                            Sector: {activeWorkspace.name}
                            <span className="mx-2 text-muted-foreground/40">//</span>
                            <span className={isLoading ? 'text-amber-500/70' : 'text-emerald-500/70'}>
                                {isLoading ? 'Scanning...' : 'Ready'}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        {/* View toggle */}
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <List className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <PermissionGate roles={['owner', 'admin', 'member']}>
                            <CreateProjectDialog />
                        </PermissionGate>
                    </div>
                </div>

                {/* ── Search bar ── */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="
                            w-full h-11 pl-10 pr-10
                            bg-muted/30 border border-border
                            hover:border-border/60 focus:border-primary/40
                            rounded-xl outline-none
                            text-[11px] font-bold text-foreground placeholder:text-muted-foreground/40
                            transition-colors
                        "
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* ── Stats row ── */}
                {!isLoading && projects.length > 0 && (
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span>{filteredProjects.length} mission{filteredProjects.length !== 1 ? 's' : ''}</span>
                        {searchQuery && <span className="text-primary/60">filtered from {projects.length}</span>}
                    </div>
                )}

                {/* ── Project grid / list ── */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
                        >
                            {[1, 2, 3, 4, 5, 6].map(i => <ProjectSkeleton key={i} />)}
                        </motion.div>
                    ) : filteredProjects.length > 0 ? (
                        <motion.div
                            key="projects"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                                    : 'flex flex-col gap-2.5'
                            }
                        >
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    viewMode={viewMode}
                                    itemVariants={itemVariants}
                                    onOpen={() => {
                                        setActiveProject(project);
                                        navigate(`/projects/${project.id}`);
                                    }}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="py-20 text-center bg-card border border-dashed border-border rounded-2xl"
                        >
                            <Layers className="h-9 w-9 text-muted-foreground/20 mx-auto mb-3" />
                            <h3 className="text-sm font-heading font-black text-muted-foreground uppercase italic tracking-widest">Static Silence</h3>
                            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-1.5 max-w-xs mx-auto">
                                {searchQuery
                                    ? `No missions matching "${searchQuery}" found in this sector.`
                                    : 'No projects found in this sector.'
                                }
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Project Card
───────────────────────────────────────────── */
const ProjectCard = ({
    project,
    viewMode,
    itemVariants,
    onOpen
}: {
    project: Project;
    viewMode: 'grid' | 'list';
    itemVariants: any;
    onOpen: () => void;
}) => {

    /* List row */
    if (viewMode === 'list') {
        return (
            <motion.div
                variants={itemVariants}
                onClick={onOpen}
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 bg-card/60 border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-card transition-all duration-300 cursor-pointer"
            >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                        <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight truncate">{project.name}</h3>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight line-clamp-1 max-w-md">{project.description || 'No objective defined'}</p>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0 pl-14 sm:pl-0">
                    <div className="hidden lg:block w-36">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Sync</span>
                            <span className="text-[9px] font-black text-primary tabular-nums">{project.progress || 0}%</span>
                        </div>
                        <div className="h-[3px] w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress || 0}%` }} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            project.status === 'active'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-muted text-muted-foreground/40 border border-border'
                        }`}>
                            {project.status}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </motion.div>
        );
    }

    /* Grid card */
    return (
        <motion.div variants={itemVariants} className="h-full">
            <Card
                onClick={onOpen}
                className="bg-card/60 border-border hover:border-primary/40 hover:bg-card/80 transition-all duration-300 group overflow-hidden cursor-pointer h-full flex flex-col"
            >
                <CardContent className="p-5 space-y-5 flex-1 flex flex-col">

                    {/* Card top */}
                    <div className="flex items-start justify-between mt-3">
                        <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-all duration-300">
                            <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground/40 hover:text-foreground hover:bg-accent rounded-lg"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-card border-border text-foreground p-1.5 rounded-xl min-w-[160px]">
                                <DropdownMenuItem className="rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 cursor-pointer">Mission Profile</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 cursor-pointer">Parameters</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border my-1" />
                                <DropdownMenuItem className="rounded-lg text-[9px] font-black uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-2 cursor-pointer">Archive Link</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Name + description */}
                    <div className="space-y-1.5">
                        <h3 className="text-base sm:text-lg font-heading font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase italic leading-tight">
                            {project.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight leading-relaxed line-clamp-2 min-h-[2.5rem]">
                            {project.description || 'No primary objective defined for this orchestration.'}
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 pt-2 mt-auto">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground/60">Protocol Sync</span>
                            <span className="text-primary tabular-nums">{project.progress || 0}%</span>
                        </div>
                        <div className="h-[3px] w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress || 0}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                            <Clock className="h-3 w-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Modified: 2h ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                                project.status === 'active'
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'bg-muted text-muted-foreground/40 border border-border'
                            }`}>
                                {project.status}
                            </span>
                            <div className="flex -space-x-1.5">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-5 w-5 rounded-md bg-muted border border-background flex items-center justify-center text-[7px] font-black text-muted-foreground/40">
                                        M
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────── */
const ProjectSkeleton = () => (
    <Card className="bg-card/40 border-border animate-pulse">
        <CardContent className="p-5 space-y-5">
            <div className="flex justify-between items-start">
                <div className="bg-muted h-10 w-10 rounded-xl" />
                <div className="h-7 w-7 bg-muted rounded-lg" />
            </div>
            <div className="space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded-lg" />
                <div className="h-3 w-full bg-muted/60 rounded-lg" />
                <div className="h-3 w-2/3 bg-muted/60 rounded-lg" />
            </div>
            <div className="space-y-2 pt-2">
                <div className="h-[3px] w-full bg-muted rounded-full" />
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="h-3 w-24 bg-muted/60 rounded" />
                <div className="h-5 w-10 bg-muted/60 rounded" />
            </div>
        </CardContent>
    </Card>
);

export default ProjectsPage;