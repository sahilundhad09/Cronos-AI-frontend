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
            <header className="px-6 lg:px-12 h-20 flex items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
                <Link className="flex items-center gap-2.5 group" to="/">
                    <div className="bg-gradient-to-br from-cyan-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                        <Brain className="h-6 w-6 text-[#030408]" />
                    </div>
                    <span className="font-heading font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
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
                <div className="ml-auto md:hidden">
                    {isAuthenticated ? (
                        <Link to="/dashboard">
                            <Button variant="ghost" className="text-cyan-400 font-bold">Dashboard</Button>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <Button variant="ghost" className="text-cyan-400 font-bold">Log in</Button>
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] -z-10 animate-pulse" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

                    <div className="container px-4 mx-auto text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="max-w-5xl mx-auto space-y-10"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
                                Evolution of Project Intelligence
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-6xl md:text-[7.5rem] font-heading font-extrabold tracking-tighter leading-[0.85]">
                                The AI that <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-teal-300 to-indigo-500">orchestrates</span> <br />
                                your vision
                            </motion.h1>

                            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed opacity-90">
                                Beyond tasks. Cronos AI automates your workflows, predicts project health, and generates intelligent roadmaps in real-time.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                                    <Button size="lg" className="h-16 px-12 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95">
                                        <Sparkles className="mr-2 h-6 w-6" /> {isAuthenticated ? "Go to Dashboard" : "Initialize Workspace"}
                                    </Button>
                                </Link>
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    onClick={() => scrollToSection('features')}
                                    className="h-16 px-12 text-xl font-bold border-white/10 hover:bg-white/5 bg-white/5 dark:bg-white/5 light:bg-black/5 backdrop-blur-sm rounded-2xl transition-all"
                                >
                                    View Capabilities
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section - Now below the fold */}
                <section className="py-24 border-y border-border bg-card">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center"
                        >
                            <StatItem label="Throughput Increase" value="480%" />
                            <StatItem label="Planning Latency" value="-90%" />
                            <StatItem label="Actionable Insights" value="2.5M+" />
                        </motion.div>
                    </div>
                </section>

                {/* Core Capabilities - Updated with real Features */}
                <section id="features" className="py-32 md:py-48 bg-background relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] -z-10" />

                    <div className="container px-4 mx-auto text-center mb-24 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                            Technology Stack
                        </div>
                        <h2 className="text-5xl md:text-8xl font-heading font-extrabold tracking-tight">
                            One Command <span className="italic font-light text-slate-500">Center</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-muted-foreground text-xl font-medium leading-relaxed">
                            Every tool your team needs, supercharged by deep learning and predictive modeling.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto px-4 lg:px-12">
                        <FeatureCard
                            icon={<Cpu className="h-8 w-8" />}
                            title="Autonomous Task Gen"
                            description="describe your goal and Cronos generates structured tasks, subtasks, and assigns them to the best-suited team members."
                        />
                        <FeatureCard
                            icon={<Bot className="h-8 w-8" />}
                            title="Project AI Assistant"
                            description="A dedicated neural agent that knows your project context. Ask about deadlines, roadblocks, or summerization anytime."
                        />
                        <FeatureCard
                            icon={<LayoutDashboard className="h-8 w-8" />}
                            title="Smart Kanban Board"
                            description="A fluid, high-performance interface for task management with AI-assisted priority sorting and drag-and-drop."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-8 w-8" />}
                            title="Precision Analytics"
                            description="Track completion rates, team velocity, and project health with deep-dive visualizations and pattern recognition."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="h-8 w-8" />}
                            title="Neural Notifications"
                            description="Get alerted on what matters. Our AI filters noise and highlights critical updates that require your immediate attention."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-8 w-8" />}
                            title="Enterprise Workspaces"
                            description="Secure, isolated environments for your teams. Manage multiple projects with role-based access and data isolation."
                        />
                    </div>
                </section>

                {/* The Engine (How it works) */}
                <section id="how-it-works" className="py-32 md:py-48 bg-card">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-32 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                                The Logic
                            </div>
                            <h2 className="text-5xl md:text-8xl font-heading font-extrabold tracking-tight">Neural <span className="text-cyan-400 italic">Workflows</span></h2>
                            <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">From concept to execution in three intelligent cycles.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-24 relative max-w-6xl mx-auto">
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

                {/* Dashboard Preview / Neural Workspace Showcase */}
                <section className="py-32 md:py-48 relative overflow-hidden bg-background">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[160px] -z-10" />
                    
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
                            <h2 className="text-4xl md:text-7xl font-heading font-extrabold tracking-tight">
                                Built for <span className="text-cyan-400">Deep Work</span>
                            </h2>
                            <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
                                A high-fidelity interface designed for focus, precision, and cognitive flow.
                            </p>
                        </div>
                        
                        <div className="relative max-w-6xl mx-auto rounded-[3rem] p-1.5 bg-gradient-to-br from-cyan-500/30 via-border to-transparent shadow-2xl">
                            <DashboardMockup />
                        </div>
                    </div>
                </section>

                {/* Final Call */}
                <section className="py-48 relative overflow-hidden bg-background">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    <div className="container px-4 mx-auto text-center space-y-16">
                        <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-transform duration-500">
                            <Brain className="h-12 w-12 text-[#030408]" />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-6xl md:text-[9rem] font-heading font-extrabold tracking-tighter leading-[0.8] mb-4">
                                Deploy <span className="text-cyan-400">Intelligence.</span>
                            </h2>
                            <p className="text-muted-foreground text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                                Join the elite teams building the future with Cronos AI.
                            </p>
                        </div>
                        <div className="pt-8">
                            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                                <Button size="lg" className="h-20 px-16 text-2xl font-heading font-black bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(6,182,212,0.5)] active:scale-95 transition-all">
                                    {isAuthenticated ? "Enter Dashboard" : "Get Started Free"} <ArrowRight className="ml-3 h-8 w-8" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 border-t border-border bg-background px-8 lg:px-24">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-foreground/5 p-2 rounded-xl">
                                <Brain className="h-6 w-6 text-cyan-400" />
                            </div>
                            <span className="font-heading font-bold text-2xl tracking-tight">Cronos AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-bold tracking-widest uppercase">The Apex of Project Management</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-12 text-center md:text-left">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Protocol</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Lex</Link>
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security Audit</Link>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Social</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter // X</Link>
                                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Neural Net (Discord)</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-10 border-t border-border text-center">
                    <p className="text-[10px] text-muted-foreground font-black tracking-[0.4em] uppercase">© 2026 Cronos AI Operations. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};
const DashboardMockup = () => (
    <div className="bg-card rounded-[2.8rem] aspect-video overflow-hidden relative shadow-inner border border-white/5">
        {/* Mock Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-20 border-r border-border/50 bg-background/50 flex flex-col items-center py-8 gap-8 group/sidebar transition-all duration-700">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center"><Cpu className="h-5 w-5 text-cyan-400" /></div>
            <div className="w-8 h-8 rounded-lg bg-foreground/5" />
            <div className="w-8 h-8 rounded-lg bg-foreground/5" />
            <div className="w-8 h-8 rounded-lg bg-foreground/5" />
            <div className="mt-auto w-8 h-8 rounded-full bg-foreground/10" />
        </div>

        {/* Mock Header */}
        <div className="absolute top-0 left-20 right-0 h-16 border-b border-border/50 bg-background/30 backdrop-blur-md flex items-center px-8 justify-between">
            <div className="w-64 h-8 rounded-lg bg-foreground/5 border border-border flex items-center px-3">
                <div className="w-3 h-3 rounded-full bg-cyan-500/40 mr-2" />
                <div className="w-24 h-2 bg-foreground/10 rounded-full" />
            </div>
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-foreground/5" />
                <div className="w-8 h-8 rounded-lg bg-foreground/5" />
            </div>
        </div>

        {/* Mock Content area */}
        <div className="absolute inset-0 left-20 top-16 p-8 grid grid-cols-12 gap-8 overflow-hidden">
            {/* Main Widget */}
            <div className="col-span-8 space-y-8">
                <div className="h-48 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 border border-border/50 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4"><Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" /></div>
                    <div className="space-y-4">
                        <div className="w-32 h-3 bg-cyan-500/20 rounded-full" />
                        <div className="w-64 h-10 bg-foreground/10 rounded-xl" />
                        <div className="flex gap-2">
                             <div className="w-12 h-6 bg-cyan-500/40 rounded-full" />
                             <div className="w-12 h-6 bg-foreground/10 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="h-40 rounded-3xl bg-card border border-border/80 p-6 flex items-center justify-center">
                         <BarChart3 className="h-16 w-16 text-cyan-500/20" />
                    </div>
                    <div className="h-40 rounded-3xl bg-card border border-border/80 p-6 space-y-4">
                        <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '70%' }} className="h-full bg-cyan-500" />
                        </div>
                        <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '45%' }} transition={{ delay: 0.2 }} className="h-full bg-indigo-500" />
                        </div>
                        <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '90%' }} transition={{ delay: 0.4 }} className="h-full bg-teal-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Widget (AI Chat Mock) */}
            <div className="col-span-4 space-y-6">
                <div className="flex-1 bg-background/50 backdrop-blur-xl border border-border p-6 rounded-3xl space-y-6 h-full shadow-2xl relative">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center"><Bot className="h-4 w-4 text-white" /></div>
                        <div className="w-16 h-2 bg-foreground/20 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <div className="w-4/5 h-16 bg-card border border-border rounded-2xl rounded-tl-none p-4">
                             <div className="w-full h-2 bg-foreground/10 rounded-full mb-2" />
                             <div className="w-2/3 h-2 bg-foreground/10 rounded-full" />
                        </div>
                        <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 1 }} className="ml-auto w-3/4 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tr-none" />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 h-10 bg-foreground/5 border border-border rounded-xl flex items-center px-3">
                         <div className="w-full h-2 bg-foreground/10 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center gap-3 group">
        <div className="text-7xl md:text-8xl font-heading font-extrabold tracking-tighter text-foreground transition-all duration-500 group-hover:text-cyan-400 group-hover:scale-105">{value}</div>
        <div className="text-muted-foreground font-black text-[10px] tracking-[0.4em] uppercase">{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="group p-12 rounded-[3.5rem] bg-card/40 border border-border hover:border-cyan-500/40 transition-all duration-700 shadow-2xl overflow-hidden relative backdrop-blur-sm">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/[0.02] rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-all duration-700" />
        <div className="bg-cyan-500/10 w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-cyan-400 mb-10 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-[#030408] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-3xl font-heading font-extrabold mb-6 text-foreground group-hover:text-cyan-400 transition-colors tracking-tight">{title}</h3>
        <p className="text-muted-foreground font-semibold text-lg leading-relaxed group-hover:text-foreground transition-colors">{description}</p>
    </div>
);

const StepItem = ({ number, title, description }: { number: string; title: string; description: string }) => (
    <div className="group text-center space-y-8 relative">
        <div className="text-[14rem] font-heading font-black text-foreground/[0.02] absolute -top-32 left-1/2 -translate-x-1/2 -z-10 select-none group-hover:text-cyan-500/[0.05] transition-colors duration-700">{number}</div>
        <div className="text-6xl font-heading font-black text-cyan-500/20 group-hover:text-cyan-400 transition-all duration-500">{number}</div>
        <div className="space-y-4">
            <h3 className="text-3xl font-heading font-black text-foreground italic tracking-tighter">{title}</h3>
            <p className="text-muted-foreground font-bold text-lg leading-relaxed max-w-[280px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">{description}</p>
        </div>
    </div>
);

export default LandingPage;
