import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brain, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { rememberMe: false }
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            });
            const { user, accessToken, refreshToken } = response.data.data;

            setAuth(user, accessToken, refreshToken);

            toast.success('Welcome Back!', {
                description: `Logged in as ${user.name}`,
            });

            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
            toast.error('Login Failed', {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#030408] text-white selection:bg-cyan-500/30">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex flex-col items-center justify-center p-20 w-1/2 relative overflow-hidden bg-[#05060B] border-r border-white/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.03] rounded-full blur-[120px] -z-0" />

                {/* Home Link - Top Left */}
                <Link to="/" className="absolute top-12 left-12 flex items-center gap-3 group z-20">
                    <div className="bg-white/5 p-2 rounded-xl group-hover:bg-cyan-500 transition-all duration-500">
                        <Brain className="h-6 w-6 text-cyan-400 group-hover:text-[#030408]" />
                    </div>
                    <span className="font-heading font-black text-2xl tracking-tighter">Cronos AI</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="z-10 text-center space-y-12"
                >
                    <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-6 rounded-[2.5rem] shadow-2xl shadow-cyan-500/20 inline-block hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="h-20 w-20 text-[#030408]" />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-6xl font-heading font-black tracking-tighter leading-none italic uppercase">
                            Secure <br /> <span className="text-cyan-400">Access</span>
                        </h2>
                        <p className="text-slate-500 text-xl font-bold max-w-sm mx-auto leading-relaxed tracking-tight">
                            Your neural workflows are ready. Re-sync with your project context.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-10 pt-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Core Active</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Login Form */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-10 bg-[#030408]">
                <div className="w-full max-w-md space-y-12">
                    {/* Logo for mobile */}
                    <Link to="/" className="lg:hidden flex items-center gap-3 justify-center mb-12 animate-fade-in">
                        <Brain className="h-8 w-8 text-cyan-500" />
                        <span className="font-heading font-black text-2xl tracking-tighter">Cronos AI</span>
                    </Link>

                    <div className="space-y-3">
                        <h1 className="text-5xl font-heading font-black tracking-tighter italic uppercase">Log in</h1>
                        <p className="text-slate-500 text-lg font-bold">Access the future of orchestration.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-4">
                        <div className="space-y-3 text-left">
                            <Label htmlFor="email" className="text-slate-500 font-black text-[10px] ml-1 uppercase tracking-[0.3em]">Command Center Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@cronos.ai"
                                className="h-16 rounded-2xl bg-white/[0.02] border-white/5 focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all text-white font-bold placeholder:text-slate-700 shadow-inner"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-3 text-left relative">
                            <Label htmlFor="password" title="password" className="text-slate-500 font-black text-[10px] ml-1 uppercase tracking-[0.3em]">Access Code</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••••••"
                                className="h-16 rounded-2xl bg-white/[0.02] border-white/5 focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all text-white font-bold placeholder:text-slate-700 pr-12 shadow-inner"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between ml-1 pt-1">
                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" className="h-5 w-5 border-white/10 rounded-lg data-[state=checked]:bg-cyan-500 data-[state=checked]:text-[#030408]" />
                                <label htmlFor="remember" className="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-400 transition-colors">Remember Auth</label>
                            </div>
                        </div>

                        <Button className="w-full h-16 text-xl font-heading font-black uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-2xl shadow-2xl shadow-cyan-500/20 active:scale-[0.98] transition-all overflow-hidden relative group" type="submit" disabled={isLoading}>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    Initialize <Zap className="h-5 w-5 fill-[#030408]" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="pt-10 text-center">
                        <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                            New to the network?{' '}
                            <Link to="/register" className="text-cyan-500 font-black hover:text-cyan-400 ml-2 transition-colors">
                                Register Instance
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
