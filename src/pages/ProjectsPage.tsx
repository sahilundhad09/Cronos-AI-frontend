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
    List
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
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    if (!activeWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-6 text-center">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-6 max-w-sm">
                    <Briefcase className="h-12 w-12 text-slate-500 mb-4 mx-auto opacity-20" />
                    <h2 className="text-2xl font-heading font-black text-white italic uppercase tracking-tighter">Sector <span className="text-cyan-400">Locked</span></h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4 leading-relaxed">
                        Navigate to a workspace to access project orchestrations.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-heading font-black tracking-tighter uppercase italic">
                        Project <span className="text-cyan-400">Command</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        Sector: {activeWorkspace.name} // Status: {isLoading ? 'Scanning...' : 'Ready'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-[#030408]' : 'text-slate-500 hover:text-white'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-[#030408]' : 'text-slate-500 hover:text-white'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <PermissionGate roles={['owner', 'admin', 'member']}>
                        <CreateProjectDialog />
                    </PermissionGate>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="SEARCH MISSIONS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none pl-12 pr-4 h-12 text-xs font-bold text-white placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* Project List/Grid */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {[1, 2, 3].map(i => <ProjectSkeleton key={i} />)}
                    </motion.div>
                ) : filteredProjects.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "space-y-4"
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl"
                    >
                        <Layers className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-heading font-black text-slate-500 uppercase italic tracking-widest">Static Silence</h3>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">No projects matching your signature found in this sector.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProjectCard = ({ project, viewMode, itemVariants, onOpen }: { project: Project, viewMode: 'grid' | 'list', itemVariants: any, onOpen: () => void }) => {
    if (viewMode === 'list') {
        return (
            <motion.div
                variants={itemVariants}
                className="bg-[#0A0D18] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition-all group cursor-pointer"
                onClick={onOpen}
            >
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight line-clamp-1 max-w-md">{project.description || 'No objective defined'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="hidden lg:block w-48">
                        <div className="flex justify-between items-center mb-1.5 px-0.5">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sync</span>
                            <span className="text-[9px] font-black text-cyan-400">{project.progress || 0}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${project.status === 'active' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                            {project.status}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div variants={itemVariants}>
            <Card className="bg-[#0A0D18] border-white/5 hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden cursor-pointer h-full flex flex-col" onClick={onOpen}>
                <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                        <div className="bg-white/5 p-3 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                            <Briefcase className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#0A0D18] border-white/5 text-white p-2">
                                <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest">Mission Profile</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest">Parameters</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest">Archive Link</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-heading font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase italic">{project.name}</h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed line-clamp-2 min-h-[2.5rem]">
                            {project.description || 'No primary objective defined for this orchestration.'}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 mt-auto">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <span>Protocol Sync</span>
                            <span className="text-cyan-400">{project.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress || 0}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Modified: 2h ago</span>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2].map(i => (
                                <div key={i} className="h-6 w-6 rounded-lg bg-slate-800 border-2 border-[#0A0D18] flex items-center justify-center text-[8px] font-black text-slate-500">
                                    M
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ProjectSkeleton = () => (
    <Card className="bg-[#0A0D18] border-white/5 animate-pulse">
        <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div className="bg-white/5 h-12 w-12 rounded-xl" />
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
            </div>
            <div className="space-y-3">
                <div className="h-8 w-3/4 bg-white/5 rounded-lg" />
                <div className="h-4 w-full bg-white/5 rounded-lg opacity-50" />
                <div className="h-4 w-1/2 bg-white/5 rounded-lg opacity-50" />
            </div>
            <div className="space-y-4 pt-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full" />
            </div>
        </CardContent>
    </Card>
);

export default ProjectsPage;
