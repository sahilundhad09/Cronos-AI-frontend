import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    Users,
    Bell,
    LogOut,
    Search,
    ChevronRight,
    Plus,
    Check,
    Briefcase,
    Brain,
    ChevronsUpDown,
    Menu,
    Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useProjectStore } from '@/store/useProjectStore';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from '@/components/ui/sheet';
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

interface MainLayoutProps {
    children: React.ReactNode;
}

// Sub-components moved outside to prevent re-mounting on every re-render
const WorkspaceSwitcher = ({
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
}: any) => (
    <div className="px-4 mb-8">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between px-3 py-6 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group"
                >
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-400/20 border border-cyan-500/20 flex items-center justify-center font-black text-xs text-cyan-400">
                            {activeWorkspace?.name?.substring(0, 1).toUpperCase() || 'C'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-white truncate leading-none mb-1">
                                {activeWorkspace?.name || 'Loading...'}
                            </p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                {activeWorkspace?.role || 'Member'} Protocol
                            </p>
                        </div>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-[#0A0D18] border-white/5 text-white rounded-2xl p-2" align="start" sideOffset={8}>
                <DropdownMenuLabel className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">
                    Switch Workspace
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="max-h-60 overflow-y-auto py-1 scrollbar-none">
                    {workspaces.map((ws: any) => (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => setActiveWorkspace(ws.id)}
                            className={`rounded-xl px-3 py-2.5 flex items-center justify-between group transition-colors cursor-pointer mb-1 ${activeWorkspace?.id === ws.id ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${activeWorkspace?.id === ws.id
                                    ? 'bg-cyan-500 text-[#030408]'
                                    : 'bg-white/5 text-slate-400'
                                    }`}>
                                    {ws.name.substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold truncate">{ws.name}</span>
                            </div>
                            {activeWorkspace?.id === ws.id && <Check className="h-3.5 w-3.5" />}
                        </DropdownMenuItem>
                    ))}
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="rounded-xl px-3 py-3 mt-1 text-cyan-400 hover:bg-cyan-500 hover:text-[#030408] font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                        >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Initialize New
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0A0D18] border-white/5 text-white rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                                Create New <span className="text-cyan-400">Workspace</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                Define your neural command center
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateWorkspace}>
                            <div className="grid gap-6 py-8">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace Name</Label>
                                    <Input
                                        id="name"
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-cyan-500/50 transition-all font-bold"
                                        placeholder="e.g. Project Omega"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        value={newWorkspaceDesc}
                                        onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-cyan-500/50 transition-all font-bold"
                                        placeholder="Neural link focus area..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-500/20"
                                >
                                    {isLoading ? 'Processing...' : 'Initialize Workspace'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

const SidebarContent = ({
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
    handleLogout
}: any) => (
    <div className="flex flex-col h-full bg-[#030408] border-r border-white/5 pt-8">
        {/* Logo */}
        <div className="px-6 mb-12">
            <Link to="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                    <Brain className="h-6 w-6 text-[#030408]" />
                </div>
                <span className="font-heading font-black text-2xl tracking-tighter text-white uppercase italic">Cronos <span className="text-cyan-400">AI</span></span>
            </Link>
        </div>

        {/* Workspace Switcher */}
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

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item: any) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                        <span className="font-bold text-sm tracking-tight uppercase tracking-[0.05em]">{item.label}</span>
                        {isActive && (
                            <motion.div
                                layoutId="active-pill"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                            />
                        )}
                    </Link>
                );
            })}
        </nav>

        {/* Footer / Settings */}
        <div className="p-4 border-t border-white/5 space-y-2">
            <PermissionGate roles={['owner', 'admin']}>
                <Link
                    to="/settings"
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${location.pathname === '/settings'
                        ? 'bg-white/5 text-white border border-white/10'
                        : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                >
                    <Settings className="h-5 w-5 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-bold text-sm tracking-tight uppercase tracking-[0.05em]">Settings</span>
                </Link>
            </PermissionGate>
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-300 group border border-transparent"
            >
                <LogOut className="h-5 w-5" />
                <span className="font-bold text-sm tracking-tight uppercase tracking-[0.05em]">Disconnect</span>
            </button>
        </div>
    </div>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const {
        workspaces,
        activeWorkspace,
        fetchWorkspaces,
        setActiveWorkspace,
        createWorkspace,
        acceptWorkspaceInvitation,
        declineWorkspaceInvitation,
        isLoading
    } = useWorkspaceStore();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');

    const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead } = useNotificationStore();
    const { acceptProjectInvitation } = useProjectStore();

    useEffect(() => {
        fetchWorkspaces();
        fetchNotifications();
        fetchUnreadCount();

        // Optional: Poll for new notifications
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchWorkspaces, fetchNotifications, fetchUnreadCount]);

    const handleAcceptProjectInvite = async (projectId: string, invitationId: string, notificationId: string) => {
        try {
            await acceptProjectInvitation(projectId, invitationId);
            await markAsRead(notificationId);
            fetchNotifications();
            toast.success('Project Invitation Accepted!', {
                description: 'You have successfully joined the project.',
            });
            // Redirect to the project or refresh
            navigate(`/projects/${projectId}`);
        } catch (error: any) {
            console.error('Failed to accept project invitation', error);
            toast.error('Failed to Accept Invitation', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    };

    const handleAcceptWorkspaceInvite = async (token: string, notificationId: string) => {
        if (!token) {
            console.error('Missing authorization token');
            toast.error('Invalid Invitation', {
                description: 'Missing authorization token.',
            });
            return;
        }
        try {
            await acceptWorkspaceInvitation(token);
            await markAsRead(notificationId);
            fetchNotifications();
            toast.success('Workspace Invitation Accepted!', {
                description: 'You have successfully joined the workspace.',
            });
            // Store has already refreshed workspaces
        } catch (error: any) {
            console.error('Failed to accept workspace invitation', error);
            toast.error('Failed to Accept Invitation', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    };

    const handleDeclineWorkspaceInvite = async (token: string, notificationId: string) => {
        if (!token) {
            console.error('Missing authorization token');
            await markAsRead(notificationId);
            return;
        }
        try {
            await declineWorkspaceInvitation(token);
            await markAsRead(notificationId);
            fetchNotifications();
            toast.success('Invitation Declined', {
                description: 'You have declined the workspace invitation.',
            });
        } catch (error: any) {
            console.error('Failed to decline workspace invitation', error);
            toast.error('Failed to Decline Invitation', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged Out', {
            description: 'You have been successfully logged out.',
        });
        navigate('/login');
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createWorkspace({ name: newWorkspaceName, description: newWorkspaceDesc });
            setIsCreateDialogOpen(false);
            setNewWorkspaceName('');
            setNewWorkspaceDesc('');
        } catch (error) {
            console.error('Failed to create workspace', error);
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Projects', path: '/projects' },
        { icon: Users, label: 'Team', path: '/team' },
    ];

    const sidebarProps = {
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
        handleLogout
    };

    return (
        <div className="min-h-screen bg-[#030408] flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen sticky top-0">
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Navbar */}
                <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-[#030408]/80 backdrop-blur-xl z-40">
                    <div className="flex items-center gap-4">
                        {/* Mobile Sheet Toggle */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72 bg-[#030408] border-r border-white/5 text-white">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Access all neural command sectors
                                    </SheetDescription>
                                </SheetHeader>
                                <SidebarContent {...sidebarProps} />
                            </SheetContent>
                        </Sheet>

                        {/* Breadcrumbs / Page Title Placeholder */}
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-widest uppercase">
                            <span className="hover:text-white cursor-pointer transition-colors max-w-[150px] truncate">
                                {activeWorkspace?.name || 'Workspace'}
                            </span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Command Hub Search */}
                        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 h-11 rounded-xl w-64 focus-within:border-cyan-500/30 focus-within:bg-white/[0.05] transition-all group">
                            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400" />
                            <input
                                type="text"
                                placeholder="COMMAND HUB (⌘K)"
                                className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-slate-700 w-full"
                            />
                        </div>

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#030408]" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 bg-[#0A0D18] border-white/5 text-white rounded-2xl p-2" align="end">
                                <DropdownMenuLabel className="flex justify-between items-center px-2 py-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Alerts</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full">{unreadCount} Pending</span>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Bell className="h-8 w-8 text-slate-700 mx-auto mb-3 opacity-20" />
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Active Signals</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-3 rounded-xl transition-colors mb-1 last:mb-0 hover:bg-white/[0.02] group relative ${!n.is_read ? 'bg-cyan-500/[0.02]' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === 'workspace_invite' ? 'bg-amber-500/10 text-amber-400' :
                                                        n.type === 'project_invite' ? 'bg-purple-500/10 text-purple-400' :
                                                            n.type === 'task_assigned' ? 'bg-cyan-500/10 text-cyan-400' :
                                                                'bg-slate-500/10 text-slate-400'
                                                        }`}>
                                                        {n.type === 'workspace_invite' ? <Briefcase className="h-4 w-4" /> :
                                                            n.type === 'project_invite' ? <Users className="h-4 w-4" /> :
                                                                <Bell className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <p className="text-[11px] font-black text-white truncate leading-none">{n.title}</p>
                                                            <span className="text-[8px] font-bold text-slate-600 whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).replace('about ', '')}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 mb-2 font-medium">
                                                            {n.message}
                                                        </p>
                                                        {n.type === 'workspace_invite' && !n.is_read && (
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                {!n.meta?.token && (
                                                                    <p className="text-[8px] text-red-400 font-black uppercase tracking-widest bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                                                                        Signal Corrupted: Missing Auth Token
                                                                    </p>
                                                                )}
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        disabled={!n.meta?.token}
                                                                        className="h-7 px-3 bg-amber-500 hover:bg-amber-400 text-[#030408] font-black text-[9px] uppercase tracking-tighter rounded-lg disabled:opacity-50"
                                                                        onClick={() => handleAcceptWorkspaceInvite(n.meta?.token, n.id)}
                                                                    >
                                                                        Join Command Center
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 px-3 text-slate-500 hover:text-white font-black text-[9px] uppercase tracking-tighter rounded-lg"
                                                                        onClick={() => handleDeclineWorkspaceInvite(n.meta?.token, n.id)}
                                                                    >
                                                                        Decline
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {n.type === 'project_invite' && !n.is_read && (
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                {!n.meta?.invitationId && (
                                                                    <p className="text-[8px] text-red-400 font-black uppercase tracking-widest bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                                                                        Signal Corrupted: Missing Auth Token
                                                                    </p>
                                                                )}
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 px-3 bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black text-[9px] uppercase tracking-tighter rounded-lg"
                                                                        onClick={() => handleAcceptProjectInvite(n.meta.projectId, n.meta.invitationId, n.id)}
                                                                    >
                                                                        Authorize Entry
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {!n.is_read && n.type !== 'project_invite' && n.type !== 'workspace_invite' && (
                                                            <button
                                                                onClick={() => markAsRead(n.id)}
                                                                className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
                                                            >
                                                                Acknowledge
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {!n.is_read && (
                                                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="justify-center text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white rounded-xl py-2 cursor-pointer">
                                    Signal History
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Profile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-white/5 p-0">
                                    <Avatar className="h-10 w-10 rounded-xl border border-white/10 group-hover:border-cyan-500/30 transition-all">
                                        <AvatarImage src={user?.avatar_url} />
                                        <AvatarFallback className="bg-cyan-500 text-[#030408] font-black">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-[#0A0D18] border-white/5 text-white rounded-2xl p-2" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-black leading-none tracking-tight">{user?.name}</p>
                                        <p className="text-xs leading-none text-slate-500 font-bold uppercase tracking-wider">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="rounded-xl hover:bg-cyan-500 hover:text-[#030408] font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={() => navigate('/profile')}>
                                    Profile Protocol
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl hover:bg-cyan-500 hover:text-[#030408] font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={() => navigate('/settings')}>
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem className="rounded-xl hover:bg-red-500/20 hover:text-red-400 font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={handleLogout}>
                                    Terminate Session
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-hidden bg-[#030408]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
