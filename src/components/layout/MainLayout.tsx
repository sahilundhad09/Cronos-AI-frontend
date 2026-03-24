import React, { useEffect, useState, memo, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    BarChart3,
    Bell,
    Brain,
    Briefcase,
    ChevronRight,
    Layers,
    LayoutDashboard,
    Menu,
    Moon,
    Search,
    Sun,
    TrendingUp,
    Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useSocketInit, useNotificationSocket } from '@/hooks/useSocket';
import { useThemeStore } from '@/store/useThemeStore';
import { CommandHub } from './CommandHub';
import { SidebarContent } from './Sidebar';
import { useSidebar } from '@/context/SidebarContext';

interface MainLayoutProps {
    children: React.ReactNode;
}


// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Layout error:', error, errorInfo);
        toast.error('Something went wrong', {
            description: 'Please refresh the page'
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-black">Something went wrong</h1>
                        <Button onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Custom hook for notification handling
const useNotificationHandlers = () => {
    const { markAsRead, fetchNotifications } = useNotificationStore();
    const { acceptProjectInvitation } = useProjectStore();
    const { acceptWorkspaceInvitation, declineWorkspaceInvitation } = useWorkspaceStore();
    const navigate = useNavigate();

    const handleAcceptProjectInvite = useCallback(async (
        projectId: string, 
        invitationId: string, 
        notificationId: string
    ) => {
        try {
            await acceptProjectInvitation(projectId, invitationId);
            await markAsRead(notificationId);
            fetchNotifications();
            toast.success('Project Invitation Accepted!', {
                description: 'You have successfully joined the project.',
            });
            navigate(`/projects/${projectId}`);
        } catch (error: any) {
            console.error('Failed to accept project invitation', error);
            toast.error('Failed to Accept Invitation', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    }, [acceptProjectInvitation, markAsRead, fetchNotifications, navigate]);

    const handleAcceptWorkspaceInvite = useCallback(async (token: string, notificationId: string) => {
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
        } catch (error: any) {
            console.error('Failed to accept workspace invitation', error);
            toast.error('Failed to Accept Invitation', {
                description: error.response?.data?.message || 'Please try again.',
            });
        }
    }, [acceptWorkspaceInvitation, markAsRead, fetchNotifications]);

    const handleDeclineWorkspaceInvite = useCallback(async (token: string, notificationId: string) => {
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
    }, [declineWorkspaceInvitation, markAsRead, fetchNotifications]);

    return {
        handleAcceptProjectInvite,
        handleAcceptWorkspaceInvite,
        handleDeclineWorkspaceInvite
    };
};

// Memoized Components

// Notification Item Component
const NotificationItem = memo(({ 
    notification, 
    onAcceptProjectInvite, 
    onAcceptWorkspaceInvite, 
    onDeclineWorkspaceInvite,
    onMarkAsRead 
}: any) => (
    <div
        className={`p-3 rounded-xl transition-colors mb-1 last:mb-0 hover:bg-white/[0.02] group relative ${!notification.is_read ? 'bg-cyan-500/[0.02]' : ''}`}
    >
        <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                notification.type === 'workspace_invite' ? 'bg-amber-500/10 text-amber-400' :
                notification.type === 'project_invite' ? 'bg-purple-500/10 text-purple-400' :
                notification.type === 'task_assigned' ? 'bg-cyan-500/10 text-cyan-400' :
                'bg-slate-500/10 text-slate-400'
            }`}>
                {notification.type === 'workspace_invite' ? <Briefcase className="h-4 w-4" /> :
                 notification.type === 'project_invite' ? <Users className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3 mb-1.5 flex-wrap">
                    <p className="text-[11px] font-black text-white leading-tight break-words flex-1">{notification.title}</p>
                    <span className="text-[8px] font-bold text-slate-600 whitespace-nowrap pt-0.5">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }).replace('about ', '')}
                    </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2 font-medium break-words">
                    {notification.message}
                </p>
                {notification.type === 'workspace_invite' && !notification.is_read && (
                    <div className="flex flex-col gap-2 mt-2">
                        {!notification.meta?.token && (
                            <p className="text-[8px] text-red-400 font-black uppercase tracking-widest bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                                Signal Corrupted: Missing Auth Token
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                disabled={!notification.meta?.token}
                                className="h-7 px-3 bg-amber-500 hover:bg-amber-400 text-[#030408] font-black text-[9px] uppercase tracking-tighter rounded-lg disabled:opacity-50"
                                onClick={() => onAcceptWorkspaceInvite(notification.meta?.token, notification.id)}
                            >
                                Join Command Center
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-slate-500 hover:text-white font-black text-[9px] uppercase tracking-tighter rounded-lg"
                                onClick={() => onDeclineWorkspaceInvite(notification.meta?.token, notification.id)}
                            >
                                Decline
                            </Button>
                        </div>
                    </div>
                )}
                {notification.type === 'project_invite' && !notification.is_read && (
                    <div className="flex flex-col gap-2 mt-2">
                        {!notification.meta?.invitationId && (
                            <p className="text-[8px] text-red-400 font-black uppercase tracking-widest bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                                Signal Corrupted: Missing Auth Token
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="h-7 px-3 bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-black text-[9px] uppercase tracking-tighter rounded-lg"
                                onClick={() => onAcceptProjectInvite(notification.meta.projectId, notification.meta.invitationId, notification.id)}
                            >
                                Authorize Entry
                            </Button>
                        </div>
                    </div>
                )}
                {!notification.is_read && notification.type !== 'project_invite' && notification.type !== 'workspace_invite' && (
                    <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
                    >
                        Acknowledge
                    </button>
                )}
            </div>
        </div>
        {!notification.is_read && (
            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-cyan-500 rounded-full" />
        )}
    </div>
));

NotificationItem.displayName = 'NotificationItem';

// Main Layout Component
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
        isLoading
    } = useWorkspaceStore();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead } = useNotificationStore();
    const mode = useThemeStore((state) => state.mode);
    const setMode = useThemeStore((state) => state.setMode);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { 
        isCollapsed: isSidebarCollapsed, 
        setCollapsed: setIsSidebarCollapsed,
        isMobileMenuOpen,
        setMobileMenuOpen: setIsMobileMenuOpen
    } = useSidebar();
    
    // Robust media query to sync JS with Tailwind's lg breakpoint (1024px)
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsDesktop(e.matches);
            if (e.matches) setIsMobileMenuOpen(false);
        };

        mediaQuery.addEventListener('change', handleChange);
        handleChange(mediaQuery);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const mountedRef = useRef(true);

    // Initialize socket connection and notification listener
    useSocketInit();
    useNotificationSocket();

    // Custom notification handlers
    const {
        handleAcceptProjectInvite,
        handleAcceptWorkspaceInvite,
        handleDeclineWorkspaceInvite
    } = useNotificationHandlers();

    // Fetch initial data with cleanup
    useEffect(() => {
        mountedRef.current = true;
        
        const initializeData = async () => {
            try {
                await fetchWorkspaces();
                if (mountedRef.current) {
                    await Promise.all([
                        fetchNotifications(),
                        fetchUnreadCount()
                    ]);
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('Failed to initialize data:', error);
                toast.error('Failed to load data', {
                    description: 'Please refresh the page to try again.'
                });
            }
        };

        initializeData();

        // Poll for unread count
        const interval = setInterval(() => {
            if (mountedRef.current) {
                fetchUnreadCount().catch(console.error);
            }
        }, 60000);

        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, [fetchWorkspaces, fetchNotifications, fetchUnreadCount]);

    // Command + K shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen((open) => !open);
            }
            // Escape key to close search
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [isSearchOpen]);

    const handleLogout = useCallback(() => {
        logout();
        toast.success('Logged Out', {
            description: 'You have been successfully logged out.',
        });
        navigate('/login');
    }, [logout, navigate]);

    const handleCreateWorkspace = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) {
            toast.error('Workspace name is required');
            return;
        }
        
        try {
            await createWorkspace({ name: newWorkspaceName, description: newWorkspaceDesc });
            setIsCreateDialogOpen(false);
            setNewWorkspaceName('');
            setNewWorkspaceDesc('');
            toast.success('Workspace created successfully');
        } catch (error: any) {
            console.error('Failed to create workspace', error);
            toast.error('Failed to create workspace', {
                description: error.response?.data?.message || 'Please try again.'
            });
        }
    }, [createWorkspace, newWorkspaceName, newWorkspaceDesc]);

    const menuItems = useMemo(() => [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', exact: true },
        { icon: Briefcase, label: 'Projects', path: '/projects' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: Brain, label: 'Neural Engine', path: '/ai-chat' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: TrendingUp, label: 'Growth', path: '/growth' },
    ], []);

    const sidebarProps = useMemo(() => ({
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
        onClose: () => {
            if (!isDesktop) {
                setIsMobileMenuOpen(false);
            }
        },
        onToggle: () => {
            if (isDesktop) {
                setIsSidebarCollapsed(!isSidebarCollapsed);
            } else {
                setIsMobileMenuOpen(false);
            }
        }
    }), [
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
        isDesktop,
        setIsSidebarCollapsed,
        setIsMobileMenuOpen
    ]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">Initializing Neural Interface...</p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative">
                {/* Mobile Backdrop */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[45] lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Single Instance Sidebar Container */}
                <motion.aside
                    initial={false}
                    animate={{ 
                        x: isDesktop ? (isSidebarCollapsed ? -288 : 0) : (isMobileMenuOpen ? 0 : -288),
                        width: isDesktop ? (isSidebarCollapsed ? 0 : 288) : 288
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed lg:sticky top-0 left-0 z-50 h-screen flex-shrink-0 border-r border-border bg-[hsl(var(--app-sidebar-bg))] transition-colors duration-300 overflow-hidden"
                >
                    <SidebarContent {...sidebarProps} />
                </motion.aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Navbar */}
                    <header className="h-20 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-[hsl(var(--app-header-bg))] backdrop-blur-xl z-40">
                        <div className="flex items-center gap-4">
                            {/* Mobile/Desktop Sidebar Toggle (Hamburger) */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`text-foreground hover:bg-accent ${isDesktop && !isSidebarCollapsed ? 'lg:hidden' : 'flex'}`}
                                onClick={() => isDesktop ? setIsSidebarCollapsed(false) : setIsMobileMenuOpen(true)}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>

                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Layers className="h-4 w-4 text-primary" />
                                </div>

                                {/* Breadcrumbs / Page Title Placeholder */}
                                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground font-bold text-[10px] sm:text-[11px] md:text-xs tracking-widest uppercase overflow-hidden">
                                    <span className="hover:text-foreground cursor-pointer transition-colors max-w-[80px] sm:max-w-[150px] truncate whitespace-nowrap">
                                        {activeWorkspace?.name || 'Workspace'}
                                    </span>
                                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/30 flex-shrink-0" />
                                    <span className="text-foreground max-w-[100px] sm:max-w-none truncate whitespace-nowrap">
                                        {location.pathname.split('/')[1]?.charAt(0).toUpperCase() + location.pathname.split('/')[1]?.slice(1) || 'Dashboard'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                            {/* Command Hub Search Trigger */}
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="hidden md:flex items-center gap-2 bg-card border border-border px-4 h-11 rounded-xl w-56 lg:w-64 hover:border-primary/40 hover:bg-accent/40 transition-all group text-left"
                            >
                                <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex-1">
                                    Command Hub
                                </span>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-muted border border-border group-hover:border-primary/20">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">⌘K</span>
                                </div>
                            </button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
                                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                                aria-label="Toggle theme mode"
                                title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-accent rounded-xl">
                                        <Bell className="h-5 w-5" />
                                        <AnimatePresence>
                                            {unreadCount > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-[420px] bg-popover border-border text-popover-foreground rounded-2xl p-2" align="end" sideOffset={12}>
                                    <DropdownMenuLabel className="flex justify-between items-center px-2 py-1.5 flex-wrap gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">Neural Signals</span>
                                        {unreadCount > 0 && (
                                            <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full shrink-0">
                                                {unreadCount} Pending
                                            </span>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Active Signals</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <NotificationItem
                                                    key={n.id}
                                                    notification={n}
                                                    onAcceptProjectInvite={handleAcceptProjectInvite}
                                                    onAcceptWorkspaceInvite={handleAcceptWorkspaceInvite}
                                                    onDeclineWorkspaceInvite={handleDeclineWorkspaceInvite}
                                                    onMarkAsRead={markAsRead}
                                                />
                                            ))
                                        )}
                                    </div>
                                    <DropdownMenuSeparator className="bg-border" />
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
                                            <AvatarFallback className="bg-cyan-500 text-[#030408] font-black">
                                                {user?.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 max-w-[calc(100vw-2rem)] bg-popover border-border text-popover-foreground rounded-2xl p-2" align="end" forceMount sideOffset={12}>
                                    <DropdownMenuLabel className="font-normal overflow-hidden">
                                        <div className="flex flex-col space-y-1.5 p-2">
                                            <p className="text-sm font-black leading-tight tracking-tight break-words">{user?.name}</p>
                                            <p className="text-[10px] leading-tight text-slate-500 font-bold uppercase tracking-wider break-all">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem className="rounded-xl hover:bg-cyan-500 hover:text-[#030408] font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={() => navigate('/profile')}>
                                        Profile Protocol
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl hover:bg-primary hover:text-primary-foreground font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={() => navigate(activeWorkspace?.id ? `/workspaces/${activeWorkspace.id}/settings` : '/dashboard')}>
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl hover:bg-cyan-500 hover:text-[#030408] font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={() => navigate('/theme-selector')}>
                                        Theme Selector
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem className="rounded-xl hover:bg-red-500/20 hover:text-red-400 font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer p-3" onClick={handleLogout}>
                                        Terminate Session
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <CommandHub isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
                    </header>

                    {/* Dynamic Page Content */}
                    <main className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.35)_100%)]">
                        {children}
                    </main>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default MainLayout;