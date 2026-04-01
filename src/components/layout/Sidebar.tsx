import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
    LogOut,
    Plus,
    Check,
    ChevronsUpDown,
    Settings,
    Palette,
    X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useSidebar } from '@/context/SidebarContext';

// ── Types ──

export interface WorkspaceSwitcherProps {
    workspaces: any[];
    activeWorkspace: any;
    setActiveWorkspace: (id: string) => void;
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (open: boolean) => void;
    newWorkspaceName: string;
    setNewWorkspaceName: (name: string) => void;
    newWorkspaceDesc: string;
    setNewWorkspaceDesc: (desc: string) => void;
    handleCreateWorkspace: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
}

export interface SidebarNavItemProps {
    to: any;
    item: any;
    isActive: boolean;
    onClick?: () => void;
}

export interface SidebarContentProps {
    workspaces: any[];
    activeWorkspace: any;
    setActiveWorkspace: (id: string) => void;
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (open: boolean) => void;
    newWorkspaceName: string;
    setNewWorkspaceName: (name: string) => void;
    newWorkspaceDesc: string;
    setNewWorkspaceDesc: (desc: string) => void;
    handleCreateWorkspace: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    menuItems: any[];
    location: any;
    handleLogout: () => void;
    user: any;
    onClose?: () => void;
    onToggle?: () => void;
}

// ── Workspace Switcher ──

const WorkspaceSwitcher = memo<WorkspaceSwitcherProps>(({
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newWorkspaceName,
    setNewWorkspaceName,
    newWorkspaceDesc,
    setNewWorkspaceDesc,
    handleCreateWorkspace,
    isLoading
}) => (
    <div className="px-3 mb-6">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between px-3 py-5 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary/10 hover:border-primary/40 transition-all group"
                >
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/60 border border-primary/30 flex items-center justify-center font-black text-sm text-primary-foreground shadow-lg shadow-primary/20">
                            {activeWorkspace?.logo_url ? (
                                <img src={activeWorkspace.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                activeWorkspace?.name?.substring(0, 1).toUpperCase() || 'C'
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-foreground truncate leading-none mb-1">
                                {activeWorkspace?.name || 'Loading...'}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                {activeWorkspace?.role || 'Member'}
                            </p>
                        </div>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-popover border-border text-popover-foreground rounded-2xl p-2" align="start" sideOffset={8}>
                <DropdownMenuLabel className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-3 py-2">
                    Switch Workspace
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <div className="max-h-60 overflow-y-auto py-1 scrollbar-none">
                    {workspaces.map((ws: any) => (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => setActiveWorkspace(ws.id)}
                            className={`rounded-xl px-3 py-2.5 flex items-center justify-between group transition-all cursor-pointer mb-1 ${
                                activeWorkspace?.id === ws.id
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'hover:bg-accent border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-[10px] font-black ${
                                    activeWorkspace?.id === ws.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {ws.logo_url ? (
                                        <img src={ws.logo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        ws.name.substring(0, 1).toUpperCase()
                                    )}
                                </div>
                                <span className="text-xs font-bold truncate">{ws.name}</span>
                            </div>
                            {activeWorkspace?.id === ws.id && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </DropdownMenuItem>
                    ))}
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="rounded-xl px-3 py-3 mt-1 text-primary hover:bg-primary hover:text-primary-foreground font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border border-primary/20 hover:border-primary"
                        >
                            <Plus className="mr-2 h-3.5 w-3.5" /> New Workspace
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                                Create <span className="text-primary">Workspace</span>
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                                Define your command center
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateWorkspace}>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace Name</Label>
                                    <Input
                                        id="name"
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        className="rounded-xl h-11"
                                        placeholder="e.g. Project Omega"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        value={newWorkspaceDesc}
                                        onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                                        className="rounded-xl h-11"
                                        placeholder="Focus area..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? 'Creating...' : 'Initialize Workspace'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
));

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';

// ── Nav Item ──

const SidebarNavItem = memo<SidebarNavItemProps>(({ to, item, isActive, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
    >
        {/* Active left bar */}
        {isActive && (
            <motion.div
                layoutId="sidebar-active-bar"
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
        )}
        <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-all duration-200 ${
            isActive ? 'text-primary' : 'group-hover:text-primary group-hover:scale-110'
        }`} />
        <span className={`text-[11px] font-black uppercase tracking-[0.08em] transition-colors duration-200 flex-1 ${
            isActive ? 'text-primary' : ''
        }`}>{item.label}</span>
        {item.badge && (
            <span className="text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {item.badge}
            </span>
        )}
    </Link>
));

SidebarNavItem.displayName = 'SidebarNavItem';

// ── Main Sidebar ──

const SidebarContent = memo<SidebarContentProps>(({
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newWorkspaceName,
    setNewWorkspaceName,
    newWorkspaceDesc,
    setNewWorkspaceDesc,
    handleCreateWorkspace,
    isLoading,
    menuItems,
    location,
    handleLogout,
    user,
    onClose,
    onToggle
}) => {
    const { isCollapsed } = useSidebar();
    const isCaptureMode = React.useMemo(() => {
        const q = new URLSearchParams(location.search || '');
        const normalized = new Set(['1', 'true', 'yes', 'full', 'on']);
        const captureValue = (q.get('capture') || '').toLowerCase();
        const screenshotValue = (q.get('screenshot') || '').toLowerCase();
        const fullshotValue = (q.get('fullshot') || '').toLowerCase();

        return (
            normalized.has(captureValue) ||
            normalized.has(screenshotValue) ||
            normalized.has(fullshotValue)
        );
    }, [location.search]);

    const withCaptureSearch = React.useCallback((path: string) => {
        if (!isCaptureMode) return path;
        return {
            pathname: path,
            search: location.search,
        };
    }, [isCaptureMode, location.search]);
    
    return (
    <div className="flex flex-col h-full bg-[hsl(var(--app-sidebar-bg))] relative overflow-hidden">
        {/* Ambient background orb */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />

        {/* ── Logo ── */}
        <div className="px-5 pt-7 pb-6 flex-shrink-0 flex items-center justify-between relative">
            <Link to={withCaptureSearch('/')} onClick={onClose} className="flex items-center gap-3 group text-left">
                {/* <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all group-hover:scale-105"> */}
                    {/* <Brain className="h-5 w-5 text-primary-foreground" /> */}
                    <img src="/favicon.png" alt="Cronos AI" className="h-10 w-10 rounded-xl" />
                {/* </div> */}
                <div className="flex flex-col">
                    <span className="font-heading font-black text-xl tracking-tighter text-foreground uppercase italic leading-none">
                        Cronos <span className="text-primary">AI</span>
                    </span>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-0.5">Neural Intelligence</p>
                </div>
            </Link>

            {/* Collapse Button (Desktop) / Close Button (Mobile) */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground hover:bg-accent -mr-1"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <X className="h-5 w-5" />
            </Button>
        </div>

        {/* ── Workspace Switcher ── */}
        <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            setActiveWorkspace={setActiveWorkspace}
            isCreateDialogOpen={isCreateDialogOpen}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            newWorkspaceName={newWorkspaceName}
            setNewWorkspaceName={setNewWorkspaceName}
            newWorkspaceDesc={newWorkspaceDesc}
            setNewWorkspaceDesc={setNewWorkspaceDesc}
            handleCreateWorkspace={handleCreateWorkspace}
            isLoading={isLoading}
        />

        {/* ── Navigation ── */}
        <div className="px-3 flex-shrink-0 mb-1">
            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-1 mb-2">Navigation</p>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar min-h-0">
            {menuItems.map((item: any) => (
                <SidebarNavItem
                    key={item.path}
                    to={withCaptureSearch(item.path)}
                    item={item}
                    isActive={item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)}
                    onClick={onClose}
                />
            ))}
        </nav>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-3 pb-4 mt-auto space-y-1 border-t border-border pt-4">
            {/* Utility links */}
            <div className="space-y-0.5 mb-2">
                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-1 mb-2">System</p>
                <Link
                    to={withCaptureSearch('/theme-selector')}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        location.pathname === '/theme-selector'
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                >
                    <Palette className="h-[16px] w-[16px] flex-shrink-0 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.08em]">Theme</span>
                </Link>
                <PermissionGate roles={['owner', 'admin']}>
                    <Link
                        to={withCaptureSearch(activeWorkspace?.id ? `/workspaces/${activeWorkspace.id}/settings` : '/settings')}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                            location.pathname.includes('/settings')
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                    >
                        <Settings className="h-[16px] w-[16px] flex-shrink-0 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.08em]">Settings</span>
                    </Link>
                </PermissionGate>
            </div>

            {/* User profile card */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-all group overflow-hidden">
                <Link 
                    to={withCaptureSearch('/profile')} 
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0 group/profile"
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-black text-xs text-primary overflow-hidden shadow-sm transition-all group-hover/profile:scale-105 group-hover/profile:border-primary/40">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="opacity-80">{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[hsl(var(--app-sidebar-bg))] shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-foreground truncate leading-none mb-1 group-hover/profile:text-primary transition-colors">{user?.name || 'Operative'}</p>
                        <p className="text-[8px] font-bold text-muted-foreground truncate uppercase tracking-[0.15em] opacity-60">{activeWorkspace?.role || 'Access Level: 1'}</p>
                    </div>
                </Link>
                
                <div className="w-[1px] h-6 bg-border/50 mx-1" />

                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-110 active:scale-90"
                >
                    <LogOut className="h-[14px] w-[14px]" />
                </button>
            </div>
        </div>
    </div>
    );
});

SidebarContent.displayName = 'SidebarContent';

export { SidebarContent };
export type { SidebarContentProps as SidebarProps };
