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
            <div className="relative overflow-hidden p-8 rounded-[2.5rem] bg-card border border-border shadow-xl shadow-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <User size={140} className="text-foreground" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-[2rem] bg-secondary border-2 border-primary/20 flex items-center justify-center text-4xl font-black text-primary overflow-hidden shadow-2xl shadow-primary/10 transition-transform hover:scale-105 duration-500">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span>{user?.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-2.5 bg-primary text-primary-foreground rounded-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl border-4 border-card">
                            <Camera size={16} strokeWidth={3} />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2.5">
                        <h1 className="text-4xl font-heading font-black italic uppercase tracking-tighter text-foreground">
                            Personnel <span className="text-primary">Profile</span>
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3.5 py-1">
                                {user?.role || 'Specialist'}
                            </Badge>
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full space-y-8">
                <TabsList className="bg-card p-1.5 border border-border rounded-2xl h-14 shadow-sm">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] italic transition-all"
                    >
                        Personnel Data
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="rounded-xl px-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] italic transition-all"
                    >
                        Security Protocol
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-8 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-3 italic">
                                <User size={16} /> Identity Core
                            </h3>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Full Name</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12 font-bold text-sm"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Comm-Link Phone</Label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12 font-bold text-sm"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Avatar Neural-Link (URL)</Label>
                                    <Input
                                        value={profileData.avatar_url}
                                        onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                                        className="bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12 font-bold text-sm"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                        Initialize Protocol Update
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-primary/[0.02] border border-primary/10 flex flex-col items-center justify-center text-center space-y-6 shadow-inner">
                            <div className="p-5 bg-primary/10 rounded-full border border-primary/20 shadow-xl shadow-primary/5">
                                <Shield size={40} className="text-primary" />
                            </div>
                            <h4 className="text-foreground font-black uppercase italic tracking-tighter text-xl">Operational Security</h4>
                            <p className="text-muted-foreground text-xs font-bold leading-relaxed max-w-[240px] italic">
                                Your personnel data is encrypted and synced across the neural network for maximum operational integrity.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="max-w-lg mx-auto p-10 rounded-[3rem] bg-card border border-border space-y-8 shadow-xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-3 italic">
                            <Lock size={16} /> Access Authorization
                        </h3>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Current Access Key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div className="space-y-2.5 pt-4 border-t border-border">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">New Access Key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Confirm New Key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div className="pt-8">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-13 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/30 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] shadow-lg shadow-destructive/5"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Shield size={16} className="mr-2" />}
                                    Update Security Protocol
                                </Button>
                                <p className="text-center mt-6 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-loose italic opacity-60">
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
