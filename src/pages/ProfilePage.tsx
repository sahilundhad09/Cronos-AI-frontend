import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Shield, Lock, Save, Loader2, Camera, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage: React.FC = () => {
    const { user, updateProfile, changePassword, uploadAvatar } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile state
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        avatar_url: ''
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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

    const handleAvatarClick = () => {
        if (!isAvatarUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type', {
                description: 'Please select an image file.'
            });
            return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const cancelAvatarUpdate = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const confirmAvatarUpload = async () => {
        if (!selectedFile) return;

        setIsAvatarUploading(true);
        const uploadToast = toast.loading('Initiating Neural Link...', {
            description: 'Uploading personnel identification to secure storage.'
        });

        try {
            await uploadAvatar(selectedFile);
            toast.success('Synchronization Complete', {
                id: uploadToast,
                description: 'Your personnel profile has been updated across the network.'
            });
            cancelAvatarUpdate();
        } catch (error: any) {
            toast.error('Link Interrupted', {
                id: uploadToast,
                description: error.response?.data?.message || 'Neural synchronization protocol failed.'
            });
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile(profileData);
            toast.success('Identity Core Updated', {
                description: 'Your personnel data reaches the consensus layer.'
            });
        } catch (error: any) {
            toast.error('Update Protocol Failure', {
                description: error.response?.data?.message || 'Data validation failed.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mismatch Detected', {
                description: 'Security keys do not match.'
            });
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success('Security Keys Rotated', {
                description: 'Session termination imminent for re-authentication.'
            });

            setTimeout(() => {
                const { logout } = useAuthStore.getState();
                logout();
                window.location.href = '/login';
            }, 2000);
        } catch (error: any) {
            toast.error('Encryption Failure', {
                description: error.response?.data?.message || 'Current authorization key invalid.'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Header Section - Glassmorphism Aesthetic */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-border shadow-2xl shadow-primary/5 rounded-2xl"
            >
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none hidden lg:block">
                    <User size={200} className="text-foreground" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-6 lg:gap-8 relative z-10">
                    {/* Avatar Section */}
                    <div className="relative group shrink-0">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className={`h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-2xl bg-secondary border-2 flex items-center justify-center text-4xl sm:text-5xl font-black text-primary overflow-hidden shadow-2xl transition-all duration-700 ${
                                previewUrl 
                                    ? 'border-primary/50 shadow-primary/30 ring-2 ring-primary/10' 
                                    : 'border-primary/20 shadow-primary/20'
                            }`}
                        >
                            {isAvatarUploading && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-md flex items-center justify-center z-30">
                                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {previewUrl ? (
                                    <motion.div 
                                        key="preview-container"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative h-full w-full"
                                    >
                                        <motion.img 
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="h-full w-full object-cover" 
                                        />
                                        {/* Holographic Scan Line */}
                                        <motion.div 
                                            initial={{ top: "-10%" }}
                                            animate={{ top: "110%" }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary),1)] z-10"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                                    </motion.div>
                                ) : user?.avatar_url ? (
                                    <motion.img 
                                        key="avatar"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        src={user.avatar_url} 
                                        alt={user.name} 
                                        className="h-full w-full object-cover" 
                                    />
                                ) : (
                                    <motion.span 
                                        key="initial"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            
                            {/* Selected Preview Overlay */}
                            <AnimatePresence>
                                {previewUrl && !isAvatarUploading && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute bottom-3 left-0 right-0 flex justify-center z-20"
                                    >
                                        <Badge className="bg-primary/90 text-primary-foreground font-black uppercase text-[8px] tracking-[0.2em] px-2 py-0.5 backdrop-blur-md border-none shadow-xl">
                                            PENDING
                                        </Badge>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Upload Trigger */}
                        {!previewUrl && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAvatarClick}
                                className={`absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-xl cursor-pointer shadow-2xl border-2 border-card z-30 ${
                                    isAvatarUploading ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            >
                                <Camera size={14} strokeWidth={2.5} />
                            </motion.div>
                        )}
                    </div>

                    {/* User Info Section */}
                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-heading font-black italic uppercase tracking-tighter text-foreground">
                            Personnel <span className="text-primary">Profile</span>
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border-none">
                                {user?.role || 'Operational Agent'}
                            </Badge>
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-wide italic opacity-70">
                                {user?.email}
                            </span>
                        </div>
                        
                        {/* Action Buttons - Moved here */}
                        <AnimatePresence>
                            {previewUrl && !isAvatarUploading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="flex items-center justify-center md:justify-start gap-2 pt-2"
                                >
                                    <Button 
                                        onClick={confirmAvatarUpload}
                                        size="sm" 
                                        className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-black uppercase text-[10px] shadow-lg shadow-primary/20"
                                    >
                                        <Save size={12} className="mr-1" /> Save
                                    </Button>
                                    <Button 
                                        onClick={cancelAvatarUpdate}
                                        size="sm" 
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <Tabs defaultValue="general" className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <TabsList className="bg-card/50 backdrop-blur-md p-1.5 border border-border rounded-[1.5rem] h-16 shadow-lg max-w-md mx-auto grid grid-cols-2">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] italic transition-all duration-300"
                    >
                        Personnel Data
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="rounded-xl px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] italic transition-all duration-300"
                    >
                        Security Keys
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 p-10 rounded-[3rem] bg-card border border-border space-y-10 shadow-xl shadow-primary/[0.02]">
                            <div className="flex items-center justify-between border-b border-border pb-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3 italic">
                                    <User size={18} /> Identification core
                                </h3>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-50 border-none">V 4.0.2</Badge>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Full Name</Label>
                                        <div className="relative">
                                            <Input
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-[1.25rem] h-14 font-bold text-sm pl-5"
                                                placeholder="Enter operative name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Secure Comm-Link</Label>
                                        <Input
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-[1.25rem] h-14 font-bold text-sm pl-5"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-primary/5">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Personnel Diagnostic</Label>
                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-secondary/10 border border-primary/10 group/uplink relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
                                            <div className="text-[8px] font-mono uppercase tracking-tighter text-primary">Status: Secure</div>
                                        </div>
                                        
                                        <div className="h-20 w-20 rounded-2xl bg-card border border-primary/20 flex items-center justify-center text-primary group-hover/uplink:border-primary/40 transition-all duration-500 overflow-hidden shadow-xl ring-1 ring-primary/5">
                                            {previewUrl ? (
                                                <div className="relative h-full w-full">
                                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                                                </div>
                                            ) : user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Current" className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={32} className="opacity-20" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 space-y-2 text-center sm:text-left">
                                            <div>
                                                <p className="text-[11px] font-black uppercase text-foreground tracking-tight leading-none mb-1">Neural Identity Uplink</p>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed opacity-60">
                                                    Synchronize personnel identification across the distributed network. 
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                                                <Button
                                                    type="button"
                                                    onClick={handleAvatarClick}
                                                    disabled={isAvatarUploading}
                                                    className="h-8 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-black uppercase text-[9px] tracking-widest px-4 border border-primary/20 transition-all"
                                                >
                                                    Upload Avatar
                                                </Button>
                                                {previewUrl && (
                                                    <Button
                                                        type="button"
                                                        onClick={confirmAvatarUpload}
                                                        disabled={isAvatarUploading}
                                                        className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-background font-black uppercase text-[9px] tracking-widest px-4 shadow-lg shadow-emerald-500/20 transition-all"
                                                    >
                                                        Confirm Sync
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Save size={18} className="mr-3" />}
                                        Update Identity Consensus
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-secondary/30 border border-border flex flex-col items-center justify-center text-center space-y-8 shadow-inner relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div className="p-6 bg-card rounded-[2rem] border border-primary/20 shadow-2xl shadow-primary/10 relative z-10 transition-transform group-hover:scale-110 duration-500">
                                <Shield size={44} className="text-primary animate-pulse" />
                            </div>
                            <div className="space-y-3 relative z-10">
                                <h4 className="text-foreground font-black uppercase italic tracking-tighter text-2xl leading-none">Operational Integrity</h4>
                                <p className="text-muted-foreground text-xs font-bold leading-relaxed max-w-[200px] mx-auto italic opacity-80">
                                    Your personnel data is fragmented, encrypted, and distributed across the Cronos AI neural net.
                                </p>
                            </div>
                            
                            <div className="pt-4 relative z-10">
                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.3em] px-5 py-2">
                                    Protocol active
                                </Badge>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-xl mx-auto p-12 rounded-[4rem] bg-card border border-border space-y-12 shadow-2xl shadow-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                <Lock size={24} className="text-primary" />
                            </div>
                            <h3 className="text-3xl font-heading font-black italic uppercase tracking-tighter text-foreground">
                                Authorization <span className="text-primary">Keys</span>
                            </h3>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic opacity-60">Synchronize security protocols</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-2">Active Authorization key</Label>
                                <Input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-[1.5rem] h-16 font-bold tracking-[0.5em]"
                                    required
                                />
                            </div>

                            <div className="pt-4 space-y-6 border-t border-border/50 mt-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-2">New Access consensus key</Label>
                                    <Input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-[1.5rem] h-16 font-bold tracking-[0.5em]"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-2">Confirm selection</Label>
                                    <Input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-[1.5rem] h-16 font-bold tracking-[0.5em]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-10">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-500 hover:scale-[1.02] shadow-xl shadow-destructive/5 group"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Shield size={20} className="mr-3 group-hover:animate-ping" />}
                                    Rotate Security Keys
                                </Button>
                                <p className="text-center mt-8 text-[9px] text-muted-foreground font-black uppercase tracking-[0.25em] leading-loose italic opacity-50 px-8">
                                    Rotation will initiate a full system purge of existing session links across the neural network.
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
