import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Brain,
    LayoutDashboard,
    Briefcase,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    Bell,
    Search,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Projects', path: '/projects' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: MessageSquare, label: 'AI Engine', path: '/ai-chat' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#030408] border-r border-white/5 pt-8">
            {/* Logo */}
            <div className="px-6 mb-12">
                <Link to="/" className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Brain className="h-6 w-6 text-[#030408]" />
                    </div>
                    <span className="font-heading font-black text-2xl tracking-tighter text-white">Cronos AI</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
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

    return (
        <div className="min-h-screen bg-[#030408] flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen sticky top-0">
                <SidebarContent />
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
                            <SheetContent side="left" className="p-0 w-72 bg-[#030408] border-r border-white/5">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>

                        {/* Breadcrumbs / Page Title Placeholder */}
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-widest uppercase">
                            <span className="hover:text-white cursor-pointer transition-colors">Workspace</span>
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
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#030408]" />
                        </Button>

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
                <main className="flex-1 overflow-y-auto bg-[#030408] scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
