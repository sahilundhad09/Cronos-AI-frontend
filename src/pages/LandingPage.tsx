import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Brain,
    BarChart3,
    LayoutDashboard,
    ShieldCheck,
    ArrowRight,
    Cpu,
    Sparkles,
    MessageSquare,
    Bot
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const LandingPage = () => {
    const { isAuthenticated } = useAuthStore();

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-cyan-500/30">
            {/* Navigation */}
            <header className="px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
                <Link className="flex items-center gap-2 group" to="/">
                    <img src="/favicon.png" alt="Cronos AI" className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl" />
                    <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                        Cronos AI
                    </span>
                </Link>
                <nav className="ml-auto hidden md:flex items-center gap-10">
                    <button
                        onClick={() => scrollToSection('features')}
                        className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Capabilities
                    </button>
                    <button
                        onClick={() => scrollToSection('how-it-works')}
                        className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        The Engine
                    </button>
                    {isAuthenticated ? (
                        <Link to="/dashboard">
                            <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-bold rounded-xl px-8 h-11 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95">
                                Go to Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors" to="/login">Sign In</Link>
                            <Link to="/register">
                                <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-bold rounded-xl px-8 h-11 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
                {/* Mobile nav */}
                <div className="ml-auto flex items-center gap-2 md:hidden">
                    {isAuthenticated ? (
                        <Link to="/dashboard">
                            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-bold rounded-lg px-4 h-9 text-sm">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="text-cyan-400 font-bold text-sm h-9 px-3">
                                    Log in
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-bold rounded-lg px-4 h-9 text-sm">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center pb-16 sm:pb-20 overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[400px] sm:h-[600px] bg-cyan-500/5 rounded-full blur-[160px] -z-10 animate-pulse" />
                    <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

                    <div className="container px-4 mx-auto text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="max-w-5xl mx-auto space-y-6 sm:space-y-10"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
                                Evolution of Project Intelligence
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-[7.5rem] font-heading font-extrabold tracking-tighter leading-[0.88] sm:leading-[0.85]">
                                The AI that{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-teal-300 to-indigo-500">orchestrates</span>
                                <br />
                                your vision
                            </motion.h1>

                            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-xl md:text-2xl font-medium leading-relaxed opacity-90 px-2 sm:px-0">
                                Beyond tasks. Cronos AI automates your workflows, predicts project health, and generates intelligent roadmaps in real-time.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-4 sm:pt-6 px-4 sm:px-0">
                                <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto h-13 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-xl sm:rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95">
                                        <Sparkles className="mr-2 h-5 sm:h-6 w-5 sm:w-6" />
                                        {isAuthenticated ? "Go to Dashboard" : "Initialize Workspace"}
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => scrollToSection('features')}
                                    className="w-full sm:w-auto h-13 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold border-white/10 hover:bg-white/5 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all"
                                >
                                    View Capabilities
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 sm:py-24 border-y border-border bg-card">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-16 text-center"
                        >
                            <StatItem label="Throughput Increase" value="480%" />
                            <StatItem label="Planning Latency" value="-90%" />
                            <StatItem label="Actionable Insights" value="2.5M+" />
                        </motion.div>
                    </div>
                </section>

                {/* Core Capabilities */}
                <section id="features" className="py-20 sm:py-32 md:py-48 bg-background relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/5 rounded-full blur-[140px] -z-10" />

                    <div className="container px-4 mx-auto text-center mb-14 sm:mb-24 space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                            Technology Stack
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-8xl font-heading font-extrabold tracking-tight">
                            One Command <span className="italic font-light text-slate-500">Center</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-xl font-medium leading-relaxed px-2 sm:px-0">
                            Every tool your team needs, supercharged by deep learning and predictive modeling.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 container mx-auto px-4 lg:px-12">
                        <FeatureCard
                            icon={<Cpu className="h-6 sm:h-8 w-6 sm:w-8" />}
                            title="Autonomous Task Gen"
                            description="Describe your goal and Cronos generates structured tasks, subtasks, and assigns them to the best-suited team members."
                        />
                        <FeatureCard
                            icon={<Bot className="h-6 sm:h-8 w-6 sm:w-8" />}
                            title="Project AI Assistant"
                            description="A dedicated neural agent that knows your project context. Ask about deadlines, roadblocks, or summarization anytime."
                        />
                        <FeatureCard
                            icon={<LayoutDashboard className="h-6 sm:h-8 w-6 sm:w-8" />}
                            title="Smart Kanban Board"
                            description="A fluid, high-performance interface for task management with AI-assisted priority sorting and drag-and-drop."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 sm:h-8 w-6 sm:w-8" />}
                            title="Precision Analytics"
                            description="Track completion rates, team velocity, and project health with deep-dive visualizations and pattern recognition."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="h-6 sm:h-8 w-6 sm:w-8" />}
                            title="Neural Notifications"
                            description="Get alerted on what matters. Our AI filters noise and highlights critical updates that require your immediate attention."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 sm:h-8 w-6 sm:w-8" />}
                            title="Enterprise Workspaces"
                            description="Secure, isolated environments for your teams. Manage multiple projects with role-based access and data isolation."
                        />
                    </div>
                </section>

                {/* The Engine */}
                <section id="how-it-works" className="py-20 sm:py-32 md:py-48 bg-card">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-16 sm:mb-32 space-y-4 sm:space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                                The Logic
                            </div>
                            <h2 className="text-4xl sm:text-5xl md:text-8xl font-heading font-extrabold tracking-tight">
                                Neural <span className="text-cyan-400 italic">Workflows</span>
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-xl font-medium max-w-2xl mx-auto px-2 sm:px-0">
                                From concept to execution in three intelligent cycles.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 lg:gap-24 relative max-w-6xl mx-auto">
                            <StepItem
                                number="α"
                                title="Deep Context Sync"
                                description="Initialize your workspace and let Cronos ingest your project parameters and team velocity metrics."
                            />
                            <StepItem
                                number="β"
                                title="AI Orchestration"
                                description="Our engine generates the optimal path forward, breaking down complex objectives into actionable tasks."
                            />
                            <StepItem
                                number="γ"
                                title="Autonomous Feedback"
                                description="The system continuously learns from your delivery patterns to improve accuracy and suggest future optimizations."
                            />
                        </div>
                    </div>
                </section>

                {/* Dashboard Preview */}
                <section className="py-20 sm:py-32 md:py-48 relative overflow-hidden bg-background">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-cyan-500/10 rounded-full blur-[160px] -z-10" />

                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-20 space-y-4 sm:space-y-6">
                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading font-extrabold tracking-tight">
                                Built for <span className="text-cyan-400">Deep Work</span>
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-xl font-medium max-w-2xl mx-auto px-2 sm:px-0">
                                A high-fidelity interface designed for focus, precision, and cognitive flow.
                            </p>
                        </div>

                        <div className="relative max-w-6xl mx-auto rounded-[1.5rem] sm:rounded-[3rem] p-1 sm:p-1.5 bg-gradient-to-br from-cyan-500/30 via-border to-transparent shadow-2xl">
                            <DashboardMockup />
                        </div>
                    </div>
                </section>

                {/* Final Call */}
                <section className="py-24 sm:py-48 relative overflow-hidden bg-background">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    <div className="container px-4 mx-auto text-center space-y-10 sm:space-y-16">
                        <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 w-16 sm:w-24 h-16 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-transform duration-500">
                            <Brain className="h-8 sm:h-12 w-8 sm:w-12 text-[#030408]" />
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-5xl sm:text-6xl md:text-[9rem] font-heading font-extrabold tracking-tighter leading-[0.85] sm:leading-[0.8] mb-4 px-2 sm:px-0">
                                Deploy <span className="text-cyan-400">Intelligence.</span>
                            </h2>
                            <p className="text-muted-foreground text-lg sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                                Join the elite teams building the future with Cronos AI.
                            </p>
                        </div>
                        <div className="pt-4 sm:pt-8 px-4 sm:px-0">
                            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                                <Button size="lg" className="w-full sm:w-auto h-16 sm:h-20 px-10 sm:px-16 text-xl sm:text-2xl font-heading font-black bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-2xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(6,182,212,0.5)] active:scale-95 transition-all">
                                    {isAuthenticated ? "Enter Dashboard" : "Get Started Free"}
                                    <ArrowRight className="ml-2 sm:ml-3 h-6 sm:h-8 w-6 sm:w-8" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 sm:py-20 border-t border-border bg-background px-4 sm:px-8 lg:px-24">
                <div className="container mx-auto flex flex-col items-center md:flex-row md:items-start md:justify-between gap-8 sm:gap-12">
                    <div className="flex flex-col items-center md:items-start gap-3 sm:gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/favicon.png" alt="Cronos AI" className="h-7 sm:h-8 w-7 sm:w-8 rounded-xl" />
                            <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight">Cronos AI</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-bold tracking-widest uppercase text-center md:text-left">
                            The Apex of Project Management
                        </p>
                    </div>
                    <div className="flex flex-row gap-12 sm:gap-16 text-center md:text-left">
                        <div className="space-y-3 sm:space-y-4">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Protocol</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Lex</Link>
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security Audit</Link>
                            </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Social</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter // X</Link>
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Neural Net (Discord)</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-border text-center">
                    <p className="text-[10px] text-muted-foreground font-black tracking-[0.4em] uppercase">© 2026 Cronos AI Operations. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const DashboardMockup = () => (
    <div className="bg-card rounded-[1.3rem] sm:rounded-[2.8rem] aspect-video overflow-hidden relative shadow-inner border border-white/5">
        {/* Mock Sidebar — hidden on very small screens */}
        <div className="hidden sm:flex absolute left-0 top-0 bottom-0 w-14 md:w-20 border-r border-border/50 bg-background/50 flex-col items-center py-6 md:py-8 gap-6 md:gap-8">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Cpu className="h-4 md:h-5 w-4 md:w-5 text-cyan-400" />
            </div>
            <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg bg-foreground/5" />
            <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg bg-foreground/5" />
            <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg bg-foreground/5" />
            <div className="mt-auto w-6 md:w-8 h-6 md:h-8 rounded-full bg-foreground/10" />
        </div>

        {/* Mock Header */}
        <div className="absolute top-0 left-0 sm:left-14 md:left-20 right-0 h-12 sm:h-14 md:h-16 border-b border-border/50 bg-background/30 backdrop-blur-md flex items-center px-3 sm:px-6 md:px-8 justify-between">
            <div className="w-32 sm:w-48 md:w-64 h-6 sm:h-7 md:h-8 rounded-lg bg-foreground/5 border border-border flex items-center px-2 sm:px-3">
                <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-cyan-500/40 mr-1 sm:mr-2 flex-shrink-0" />
                <div className="w-16 sm:w-20 md:w-24 h-1.5 sm:h-2 bg-foreground/10 rounded-full" />
            </div>
            <div className="flex gap-2 sm:gap-4">
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg bg-foreground/5" />
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg bg-foreground/5" />
            </div>
        </div>

        {/* Mock Content area */}
        <div className="absolute inset-0 left-0 sm:left-14 md:left-20 top-12 sm:top-14 md:top-16 p-3 sm:p-5 md:p-8 grid grid-cols-12 gap-3 sm:gap-5 md:gap-8 overflow-hidden">
            {/* Main Widget */}
            <div className="col-span-8 space-y-3 sm:space-y-5 md:space-y-8">
                <div className="h-28 sm:h-36 md:h-48 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 border border-border/50 p-3 sm:p-5 md:p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 sm:p-3 md:p-4">
                        <Sparkles className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="w-24 sm:w-28 md:w-32 h-2 sm:h-2.5 md:h-3 bg-cyan-500/20 rounded-full" />
                        <div className="w-36 sm:w-48 md:w-64 h-6 sm:h-8 md:h-10 bg-foreground/10 rounded-lg sm:rounded-xl" />
                        <div className="flex gap-1.5 sm:gap-2">
                            <div className="w-10 sm:w-11 md:w-12 h-5 sm:h-5.5 md:h-6 bg-cyan-500/40 rounded-full" />
                            <div className="w-10 sm:w-11 md:w-12 h-5 sm:h-5.5 md:h-6 bg-foreground/10 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-8">
                    <div className="h-24 sm:h-32 md:h-40 rounded-xl sm:rounded-2xl md:rounded-3xl bg-card border border-border/80 p-3 sm:p-4 md:p-6 flex items-center justify-center">
                        <BarChart3 className="h-10 sm:h-12 md:h-16 w-10 sm:w-12 md:w-16 text-cyan-500/20" />
                    </div>
                    <div className="h-24 sm:h-32 md:h-40 rounded-xl sm:rounded-2xl md:rounded-3xl bg-card border border-border/80 p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 flex flex-col justify-center">
                        <div className="w-full h-1.5 sm:h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '70%' }} className="h-full bg-cyan-500" />
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '45%' }} transition={{ delay: 0.2 }} className="h-full bg-indigo-500" />
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '90%' }} transition={{ delay: 0.4 }} className="h-full bg-teal-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chat Mock */}
            <div className="col-span-4 space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex-1 bg-background/50 backdrop-blur-xl border border-border p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl space-y-3 sm:space-y-4 md:space-y-6 h-full shadow-2xl relative">
                    <div className="flex items-center gap-2 sm:gap-3 border-b border-border pb-2 sm:pb-3 md:pb-4">
                        <div className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4 text-white" />
                        </div>
                        <div className="w-12 sm:w-14 md:w-16 h-1.5 sm:h-2 bg-foreground/20 rounded-full" />
                    </div>
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="w-4/5 h-10 sm:h-12 md:h-16 bg-card border border-border rounded-xl sm:rounded-2xl rounded-tl-none p-2 sm:p-3 md:p-4">
                            <div className="w-full h-1.5 sm:h-2 bg-foreground/10 rounded-full mb-1.5 sm:mb-2" />
                            <div className="w-2/3 h-1.5 sm:h-2 bg-foreground/10 rounded-full" />
                        </div>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="ml-auto w-3/4 h-8 sm:h-10 md:h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl sm:rounded-2xl rounded-tr-none"
                        />
                    </div>
                    <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 h-7 sm:h-8 md:h-10 bg-foreground/5 border border-border rounded-lg sm:rounded-xl flex items-center px-2 sm:px-3">
                        <div className="w-full h-1.5 sm:h-2 bg-foreground/10 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center gap-1.5 sm:gap-3 group">
        <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tighter text-foreground transition-all duration-500 group-hover:text-cyan-400 group-hover:scale-105">
            {value}
        </div>
        <div className="text-muted-foreground font-black text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-center leading-tight">
            {label}
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="group p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl lg:rounded-[3.5rem] bg-card/40 border border-border hover:border-cyan-500/40 transition-all duration-700 shadow-2xl overflow-hidden relative backdrop-blur-sm">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/[0.02] rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-all duration-700" />
        <div className="bg-cyan-500/10 w-14 sm:w-16 lg:w-20 h-14 sm:h-16 lg:h-20 rounded-2xl sm:rounded-2xl lg:rounded-[1.8rem] flex items-center justify-center text-cyan-400 mb-6 sm:mb-8 lg:mb-10 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-[#030408] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold mb-3 sm:mb-4 lg:mb-6 text-foreground group-hover:text-cyan-400 transition-colors tracking-tight">
            {title}
        </h3>
        <p className="text-muted-foreground font-semibold text-sm sm:text-base lg:text-lg leading-relaxed group-hover:text-foreground transition-colors">
            {description}
        </p>
    </div>
);

const StepItem = ({ number, title, description }: { number: string; title: string; description: string }) => (
    <div className="group text-center space-y-4 sm:space-y-6 sm:space-y-8 relative">
        <div className="text-[8rem] sm:text-[14rem] font-heading font-black text-foreground/[0.02] absolute -top-16 sm:-top-32 left-1/2 -translate-x-1/2 -z-10 select-none group-hover:text-cyan-500/[0.05] transition-colors duration-700">
            {number}
        </div>
        <div className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-cyan-500/20 group-hover:text-cyan-400 transition-all duration-500">
            {number}
        </div>
        <div className="space-y-2 sm:space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-foreground italic tracking-tighter">
                {title}
            </h3>
            <p className="text-muted-foreground font-bold text-sm sm:text-base lg:text-lg leading-relaxed max-w-[280px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                {description}
            </p>
        </div>
    </div>
);

export default LandingPage;