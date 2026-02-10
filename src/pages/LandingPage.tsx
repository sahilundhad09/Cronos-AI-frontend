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

const LandingPage = () => {
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
        <div className="flex flex-col min-h-screen bg-[#030408] text-white selection:bg-cyan-500/30">
            {/* Navigation */}
            <header className="px-6 lg:px-12 h-20 flex items-center border-b border-white/5 sticky top-0 bg-[#030408]/80 backdrop-blur-xl z-50">
                <Link className="flex items-center gap-2.5 group" to="/">
                    <div className="bg-gradient-to-br from-cyan-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                        <Brain className="h-6 w-6 text-[#030408]" />
                    </div>
                    <span className="font-heading font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Cronos AI
                    </span>
                </Link>
                <nav className="ml-auto hidden md:flex items-center gap-10">
                    <Link className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors" to="#features">Capabilities</Link>
                    <Link className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors" to="#how-it-works">The Engine</Link>
                    <Link className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors" to="/login">Sign In</Link>
                    <Link to="/register">
                        <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#030408] font-bold rounded-xl px-8 h-11 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </Button>
                    </Link>
                </nav>
                <div className="ml-auto md:hidden">
                    <Link to="/login">
                        <Button variant="ghost" className="text-cyan-400 font-bold">Log in</Button>
                    </Link>
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

                            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-slate-400 text-xl md:text-2xl font-medium leading-relaxed opacity-90">
                                Beyond tasks. Cronos AI automates your workflows, predicts project health, and generates intelligent roadmaps in real-time.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                                <Link to="/register">
                                    <Button size="lg" className="h-16 px-12 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95">
                                        <Sparkles className="mr-2 h-6 w-6" /> Initialize Workspace
                                    </Button>
                                </Link>
                                <Link to="#features">
                                    <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold border-white/10 hover:bg-white/5 bg-white/5 backdrop-blur-sm rounded-2xl transition-all">
                                        View Capabilities
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section - Now below the fold */}
                <section className="py-24 border-y border-white/5 bg-[#05060B]">
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
                <section id="features" className="py-32 md:py-48 bg-[#030408] relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] -z-10" />

                    <div className="container px-4 mx-auto text-center mb-24 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                            Technology Stack
                        </div>
                        <h2 className="text-5xl md:text-8xl font-heading font-extrabold tracking-tight">
                            One Command <span className="italic font-light text-slate-500">Center</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-slate-400 text-xl font-medium leading-relaxed">
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
                <section id="how-it-works" className="py-32 md:py-48 bg-[#05060B]">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-32 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                                The Logic
                            </div>
                            <h2 className="text-5xl md:text-8xl font-heading font-extrabold tracking-tight">Neural <span className="text-cyan-400 italic">Workflows</span></h2>
                            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">From concept to execution in three intelligent cycles.</p>
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

                {/* Dashboard Preview Placeholder / UI Showcase */}
                <section className="py-32 relative overflow-hidden bg-[#030408]">
                    <div className="container px-4 mx-auto">
                        <div className="relative p-1 rounded-[3rem] bg-gradient-to-br from-cyan-500/20 via-white/5 to-transparent border border-white/5 shadow-2xl">
                            <div className="bg-[#0A0D18] rounded-[2.8rem] aspect-video flex items-center justify-center p-8 overflow-hidden">
                                <div className="space-y-8 text-center">
                                    <Bot className="h-24 w-24 text-cyan-500 mx-auto animate-bounce" />
                                    <h3 className="text-3xl font-heading font-bold text-slate-300 italic tracking-widest uppercase">The Workspace of Tomorrow</h3>
                                    <div className="flex gap-4 justify-center">
                                        <div className="h-2 w-32 bg-cyan-500/20 rounded-full animate-pulse" />
                                        <div className="h-2 w-16 bg-white/10 rounded-full animate-pulse delay-75" />
                                        <div className="h-2 w-24 bg-indigo-500/20 rounded-full animate-pulse delay-150" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Call */}
                <section className="py-48 relative overflow-hidden bg-[#030408]">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    <div className="container px-4 mx-auto text-center space-y-16">
                        <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-transform duration-500">
                            <Brain className="h-12 w-12 text-[#030408]" />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-6xl md:text-[9rem] font-heading font-extrabold tracking-tighter leading-[0.8] mb-4">
                                Deploy <span className="text-cyan-400">Intelligence.</span>
                            </h2>
                            <p className="text-slate-400 text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                                Join the elite teams building the future with Cronos AI.
                            </p>
                        </div>
                        <div className="pt-8">
                            <Link to="/register">
                                <Button size="lg" className="h-20 px-16 text-2xl font-heading font-black bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(6,182,212,0.5)] active:scale-95 transition-all">
                                    Get Started Free <ArrowRight className="ml-3 h-8 w-8" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 border-t border-white/5 bg-[#030408] px-8 lg:px-24">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/5 p-2 rounded-xl">
                                <Brain className="h-6 w-6 text-cyan-400" />
                            </div>
                            <span className="font-heading font-bold text-2xl tracking-tight">Cronos AI</span>
                        </div>
                        <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">The Apex of Project Management</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-12 text-center md:text-left">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Lex</Link>
                                <Link to="#" className="text-sm text-slate-500 hover:text-white transition-colors">Security Audit</Link>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Social</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="#" className="text-sm text-slate-500 hover:text-white transition-colors">Twitter // X</Link>
                                <Link to="#" className="text-sm text-slate-500 hover:text-white transition-colors">Neural Net (Discord)</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-600 font-black tracking-[0.4em] uppercase">© 2026 Cronos AI Operations. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center gap-3 group">
        <div className="text-7xl md:text-8xl font-heading font-extrabold tracking-tighter text-white transition-all duration-500 group-hover:text-cyan-400 group-hover:scale-105">{value}</div>
        <div className="text-slate-500 font-black text-[10px] tracking-[0.4em] uppercase">{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="group p-12 rounded-[3.5rem] bg-[#0A0D18]/40 border border-white/5 hover:border-cyan-500/40 transition-all duration-700 shadow-2xl overflow-hidden relative backdrop-blur-sm">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/[0.02] rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-all duration-700" />
        <div className="bg-cyan-500/10 w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-cyan-400 mb-10 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-[#030408] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-3xl font-heading font-extrabold mb-6 text-white group-hover:text-cyan-400 transition-colors tracking-tight">{title}</h3>
        <p className="text-slate-500 font-semibold text-lg leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
    </div>
);

const StepItem = ({ number, title, description }: { number: string; title: string; description: string }) => (
    <div className="group text-center space-y-8 relative">
        <div className="text-[14rem] font-heading font-black text-white/[0.02] absolute -top-32 left-1/2 -translate-x-1/2 -z-10 select-none group-hover:text-cyan-500/[0.05] transition-colors duration-700">{number}</div>
        <div className="text-6xl font-heading font-black text-cyan-500/20 group-hover:text-cyan-400 transition-all duration-500">{number}</div>
        <div className="space-y-4">
            <h3 className="text-3xl font-heading font-black text-white italic tracking-tighter">{title}</h3>
            <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-[280px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">{description}</p>
        </div>
    </div>
);

export default LandingPage;
