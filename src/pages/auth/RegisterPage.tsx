import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brain, Loader2, Rocket, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Register
            await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            // 2. Automatically login after registration
            const loginResponse = await api.post('/auth/login', {
                email: data.email,
                password: data.password,
            });

            const { user, accessToken, refreshToken } = loginResponse.data.data;

            setAuth(user, accessToken, refreshToken);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="z-10 text-center space-y-12"
                >
                    <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-7 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 inline-block hover:rotate-6 transition-transform duration-500">
                        <Rocket className="h-20 w-20 text-[#030408]" />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-6xl font-heading font-black tracking-tighter leading-none italic uppercase">
                            Deploy <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Identity</span>
                        </h2>
                        <p className="text-slate-500 text-xl font-bold max-w-sm mx-auto leading-relaxed tracking-tight">
                            Join the autonomous project revolution. Scale your delivery logic.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-10">
                        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-center backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
                            <div className="text-cyan-400 font-black text-3xl mb-1 group-hover:scale-110 transition-transform tracking-tighter">99.7%</div>
                            <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Accuracy</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-center backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
                            <div className="text-cyan-400 font-black text-3xl mb-1 group-hover:scale-110 transition-transform tracking-tighter">10x</div>
                            <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Velocity</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Register Form */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-10 bg-[#030408]">
                <div className="w-full max-w-md space-y-10">
                    {/* Logo for mobile */}
                    <Link to="/" className="lg:hidden flex items-center gap-3 justify-center mb-10">
                        <Brain className="h-8 w-8 text-cyan-500" />
                        <span className="font-heading font-black text-2xl tracking-tighter">Cronos AI</span>
                    </Link>

                    <div className="space-y-3 text-center lg:text-left">
                        <h1 className="text-4xl font-heading font-black tracking-tighter italic uppercase">New Instance</h1>
                        <p className="text-slate-500 text-lg font-bold">Establish your secure workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-black rounded-2xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2 text-left">
                            <Label htmlFor="name" className="text-slate-500 font-black text-[10px] ml-1 uppercase tracking-[0.3em]">Identity Link (Name)</Label>
                            <Input
                                id="name"
                                placeholder="Sahil Undhad"
                                className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all text-white font-bold placeholder:text-slate-700"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 text-left">
                            <Label htmlFor="email" className="text-slate-500 font-black text-[10px] ml-1 uppercase tracking-[0.3em]">Communication Channel</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@cronos.ai"
                                className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all text-white font-bold placeholder:text-slate-700"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="password" title="password" className="text-slate-500 font-black text-[10px] ml-1 uppercase tracking-[0.3em]">Access Pad</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all text-white font-bold placeholder:text-slate-700"
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="space-y-2 text-left">
                                <Label htmlFor="confirmPassword" title="confirmPassword" className="text-slate-500 font-black text-[10px] ml-1 uppercase tracking-[0.3em]">Verify Pad</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all text-white font-bold placeholder:text-slate-700"
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        <Button className="w-full h-16 text-xl font-heading font-black uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-2xl shadow-2xl shadow-cyan-500/20 active:scale-[0.98] transition-all overflow-hidden relative group" type="submit" disabled={isLoading}>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    Get Started <Zap className="h-5 w-5 fill-[#030408]" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="pt-10 text-center">
                        <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                            Already on the grid?{' '}
                            <Link to="/login" className="text-cyan-500 font-black hover:text-cyan-400 ml-2 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
