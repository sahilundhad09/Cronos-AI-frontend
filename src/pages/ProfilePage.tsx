import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Shield, Lock, Save, Loader2, Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const ProfilePage: React.FC = () => {
    const { user, updateProfile, changePassword } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // Profile state
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        avatar_url: ''
    });

    // Sync state when user is loaded or changed
    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                avatar_url: user.avatar_url || ''
            });
        }
    }, [user]);

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile(profileData);
            toast.success('Profile Updated', {
                description: 'Your profile information has been synchronized.'
            });
        } catch (error: any) {
            toast.error('Update Failed', {
                description: error.response?.data?.message || 'Please verify your data.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mismatch Detected', {
                description: 'New password and confirmation do not match.'
            });
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success('Security Updated', {
                description: 'Your password has been changed. Re-authenticating...'
            });

            // Password change revokes tokens, so we should log out
            setTimeout(() => {
                const { logout } = useAuthStore.getState();
                logout();
                window.location.href = '/login';
            }, 2000);
        } catch (error: any) {
            toast.error('Security Breach', {
                description: error.response?.data?.message || 'Current password verification failed.'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <User size={120} className="text-white" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-3xl bg-slate-800 border-2 border-cyan-500/30 flex items-center justify-center text-4xl font-black text-cyan-400 overflow-hidden shadow-2xl shadow-cyan-500/20">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span>{user?.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-cyan-500 text-black rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-[#0A0D18]">
                            <Camera size={16} strokeWidth={3} />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-heading font-black italic uppercase tracking-tighter text-white">
                            Personnel <span className="text-cyan-400">Profile</span>
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black uppercase tracking-widest px-3">
                                {user?.role || 'Specialist'}
                            </Badge>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full space-y-6">
                <TabsList className="bg-white/5 p-1 border border-white/10 rounded-2xl h-14 backdrop-blur-md">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-8 data-[state=active]:bg-cyan-500 data-[state=active]:text-[#030408] font-black uppercase tracking-widest text-[10px]"
                    >
                        Personnel Data
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="rounded-xl px-8 data-[state=active]:bg-cyan-500 data-[state=active]:text-[#030408] font-black uppercase tracking-widest text-[10px]"
                    >
                        Security Protocol
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-3">
                                <User size={16} /> Identity Core
                            </h3>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Full Name</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl h-12 font-bold"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Comm-Link Phone</Label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl h-12 font-bold"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Avatar Neural-Link (URL)</Label>
                                    <Input
                                        value={profileData.avatar_url}
                                        onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                                        className="bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl h-12 font-bold"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-[#030408] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                        Initialize Protocol Update
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                                <Shield size={32} className="text-cyan-400" />
                            </div>
                            <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">Operational Security</h4>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-[200px]">
                                Your personnel data is encrypted and synced across the neural network.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="max-w-lg mx-auto p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-3">
                            <Lock size={16} /> Access Authorization
                        </h3>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Current Access Key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">New Access Key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Confirm New Key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Shield size={16} className="mr-2" />}
                                    Update Security Protocol
                                </Button>
                                <p className="text-center mt-4 text-[9px] text-slate-600 font-black uppercase tracking-widest leading-loose">
                                    Changing security keys will terminate all active session links.
                                </p>
                            </div>
                        </form>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfilePage;
