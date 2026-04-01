import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Shield, Lock, Save, Loader2, Camera, Trash2, Mail, Phone, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const ProfilePage: React.FC = () => {
    const location = useLocation();
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
        email: '',
        avatar_url: ''
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const isCaptureMode = useMemo(() => {
        const q = new URLSearchParams(location.search || '');
        const normalized = new Set(['1', 'true', 'yes', 'full', 'on']);
        const captureValue = (q.get('capture') || '').toLowerCase();
        const screenshotValue = (q.get('screenshot') || '').toLowerCase();
        const fullshotValue = (q.get('fullshot') || '').toLowerCase();

        return (
            normalized.has(captureValue) ||
            normalized.has(screenshotValue) ||
            normalized.has(fullshotValue)
        );
    }, [location.search]);

    // Sync state when user is loaded or changed
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
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

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type', {
                description: 'Please select an image file.'
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large', {
                description: 'Maximum file size is 5MB.'
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
        const uploadToast = toast.loading('Uploading avatar...');

        try {
            await uploadAvatar(selectedFile);
            toast.success('Avatar updated successfully', {
                id: uploadToast,
                description: 'Your profile picture has been updated.'
            });
            cancelAvatarUpdate();
        } catch (error: any) {
            toast.error('Upload failed', {
                id: uploadToast,
                description: error.response?.data?.message || 'Failed to update avatar.'
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
            toast.success('Profile updated', {
                description: 'Your profile information has been saved.'
            });
        } catch (error: any) {
            toast.error('Update failed', {
                description: error.response?.data?.message || 'Failed to update profile.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Password mismatch', {
                description: 'New passwords do not match.'
            });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password too short', {
                description: 'Password must be at least 8 characters.'
            });
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success('Password changed', {
                description: 'Please log in with your new password.'
            });

            setTimeout(() => {
                const { logout } = useAuthStore.getState();
                logout();
            }, 2000);
        } catch (error: any) {
            toast.error('Password change failed', {
                description: error.response?.data?.message || 'Current password is incorrect.'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-b from-background to-secondary/5 ${isCaptureMode ? 'screenshot-unlock' : ''}`}>
            <ScrollArea
                className={isCaptureMode ? 'h-auto overflow-visible screenshot-unlock capture-scroll' : 'h-full'}
                data-screenshot-scroll="true"
            >
                <div className={`container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isCaptureMode ? 'py-4 sm:py-5 space-y-4 sm:space-y-5' : 'py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8'}`}>
                    
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        aria-label="Upload avatar"
                        title="Upload avatar"
                        className="hidden"
                    />

                    {/* Header Section - Responsive Glassmorphism */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border shadow-2xl shadow-primary/5 rounded-2xl sm:rounded-3xl"
                    >
                        {/* Background Decorative Element */}
                        <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none hidden lg:block">
                            <User size={200} className="text-foreground" />
                        </div>

                        <div className="p-6 sm:p-8 lg:p-10">
                            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 xl:gap-12 relative z-10">
                                {/* Avatar Section */}
                                <div className="relative group shrink-0">
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        className={`h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 rounded-2xl bg-secondary border-2 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black text-primary overflow-hidden shadow-2xl transition-all duration-700 ${
                                            previewUrl 
                                                ? 'border-primary/50 shadow-primary/30 ring-2 ring-primary/10' 
                                                : 'border-primary/20 shadow-primary/20'
                                        }`}
                                    >
                                        {isAvatarUploading && (
                                            <div className="absolute inset-0 bg-background/50 backdrop-blur-md flex items-center justify-center z-30">
                                                <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-primary" />
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
                                                    className="text-2xl sm:text-3xl md:text-4xl"
                                                >
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
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
                                                    className="absolute bottom-2 left-0 right-0 flex justify-center z-20"
                                                >
                                                    <Badge className="bg-primary/90 text-primary-foreground font-black uppercase text-[7px] sm:text-[8px] tracking-[0.2em] px-2 py-0.5 backdrop-blur-md border-none shadow-xl">
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
                                            className={`absolute -bottom-1 -right-1 p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-xl cursor-pointer shadow-2xl border-2 border-card z-30 ${
                                                isAvatarUploading ? 'opacity-50 pointer-events-none' : ''
                                            }`}
                                        >
                                            <Camera size={12} strokeWidth={2.5} className="sm:w-[14px] sm:h-[14px]" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* User Info Section */}
                                <div className="text-center lg:text-left space-y-2 sm:space-y-3 flex-1">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black italic uppercase tracking-tighter text-foreground">
                                        Personnel <span className="text-primary">Profile</span>
                                    </h1>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 items-center">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border-none">
                                            {user?.role || 'Operational Agent'}
                                        </Badge>
                                        <span className="text-muted-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-wide italic opacity-70 truncate max-w-[200px] sm:max-w-none">
                                            {user?.email}
                                        </span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <AnimatePresence>
                                        {previewUrl && !isAvatarUploading && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="flex items-center justify-center lg:justify-start gap-2 pt-2"
                                            >
                                                <Button 
                                                    onClick={confirmAvatarUpload}
                                                    size="sm" 
                                                    className="h-7 sm:h-8 px-2 sm:px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-black uppercase text-[9px] sm:text-[10px] shadow-lg shadow-primary/20"
                                                >
                                                    <Save size={11} className="mr-1 sm:mr-1.5" /> Save
                                                </Button>
                                                <Button 
                                                    onClick={cancelAvatarUpdate}
                                                    size="sm" 
                                                    variant="ghost"
                                                    className="h-7 sm:h-8 w-7 sm:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs Section - Responsive */}
                    <Tabs defaultValue="general" className="w-full space-y-6 sm:space-y-8">
                        <div className={isCaptureMode ? 'pt-1 pb-2' : 'sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 pb-4 -mt-2'}>
                            <TabsList className="bg-card/50 backdrop-blur-md p-1 border border-border rounded-2xl sm:rounded-3xl h-auto min-h-[3rem] sm:h-16 w-full max-w-2xl mx-auto grid grid-cols-2 gap-1">
                                <TabsTrigger
                                    value="general"
                                    className="rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-wider sm:tracking-widest text-[9px] sm:text-[10px] italic transition-all duration-300"
                                >
                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                    <span className="hidden xs:inline">Personnel</span>
                                    <span className="xs:hidden">Data</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-wider sm:tracking-widest text-[9px] sm:text-[10px] italic transition-all duration-300"
                                >
                                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                    Security
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* General Settings */}
                        <TabsContent value="general" className={`${isCaptureMode ? 'space-y-4 sm:space-y-5' : 'space-y-6 sm:space-y-8'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`grid grid-cols-1 lg:grid-cols-3 ${isCaptureMode ? 'gap-4 lg:gap-5' : 'gap-6 lg:gap-8'}`}>
                                {/* Main Form Card */}
                                <Card className="lg:col-span-2 border-border shadow-xl bg-card/50 backdrop-blur-sm">
                                    <CardHeader className="border-b border-border pb-4 sm:pb-6">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <CardTitle className="text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2">
                                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                                    Identification Core
                                                </CardTitle>
                                                <CardDescription className="text-[10px] sm:text-[11px] mt-1">
                                                    Manage your personal information and contact details
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-50 border-none">
                                                V 4.0.2
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6 lg:p-8">
                                        <form onSubmit={handleProfileUpdate} className="space-y-5 sm:space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        Full Name
                                                    </Label>
                                                    <Input
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                        className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 font-medium text-sm"
                                                        placeholder="Enter operative name"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        Email Address
                                                    </Label>
                                                    <Input
                                                        value={profileData.email}
                                                        disabled
                                                        className="bg-secondary/10 border-border rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 font-medium text-sm opacity-70 cursor-not-allowed"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                                        <Phone className="h-3 w-3" />
                                                        Secure Comm-Link
                                                    </Label>
                                                    <Input
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 font-medium text-sm"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                                        <Award className="h-3 w-3" />
                                                        Role / Access Level
                                                    </Label>
                                                    <Input
                                                        value={user?.role || 'Operational Agent'}
                                                        disabled
                                                        className="bg-secondary/10 border-border rounded-xl sm:rounded-2xl h-11 sm:h-12 md:h-14 font-medium text-sm opacity-70 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            <Separator className="my-4 sm:my-6" />

                                            {/* Avatar Upload Section */}
                                            <div className="space-y-4">
                                                <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                                    <Camera className="h-3 w-3" />
                                                    Personnel Identification
                                                </Label>
                                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-secondary/10 border border-primary/10">
                                                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-card border border-primary/20 flex items-center justify-center text-primary overflow-hidden shadow-xl ring-1 ring-primary/5 shrink-0">
                                                        {previewUrl ? (
                                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                        ) : user?.avatar_url ? (
                                                            <img src={user.avatar_url} alt="Current" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User size={28} className="opacity-30" />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-3 text-center sm:text-left">
                                                        <div>
                                                            <p className="text-[10px] sm:text-[11px] font-black uppercase text-foreground mb-1">Avatar Configuration</p>
                                                            <p className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">
                                                                Upload a profile picture to personalize your account
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                                            <Button
                                                                type="button"
                                                                onClick={handleAvatarClick}
                                                                disabled={isAvatarUploading}
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 rounded-lg text-[9px] sm:text-[10px] font-black"
                                                            >
                                                                Choose File
                                                            </Button>
                                                            {previewUrl && (
                                                                <Button
                                                                    type="button"
                                                                    onClick={confirmAvatarUpload}
                                                                    disabled={isAvatarUploading}
                                                                    size="sm"
                                                                    className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black"
                                                                >
                                                                    Save Avatar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-11 sm:h-12 md:h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl sm:rounded-2xl font-black uppercase tracking-wider sm:tracking-[0.2em] text-[10px] sm:text-[11px] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                            >
                                                {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                                Update Profile
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Info Card */}
                                <Card className="border-border bg-gradient-to-br from-primary/5 via-transparent to-transparent overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
                                    <CardContent className="p-6 sm:p-8 text-center space-y-6 relative">
                                        <div className="p-4 bg-card rounded-2xl border border-primary/20 shadow-xl inline-block mx-auto">
                                            <Shield size={40} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter mb-2">Operational Integrity</h3>
                                            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                                                Your personnel data is encrypted and secured with military-grade protocols.
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5">
                                                Protocol Active
                                            </Badge>
                                        </div>
                                        <div className="text-[8px] text-muted-foreground/50 font-mono">
                                            Last updated: {new Date().toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security" className={`${isCaptureMode ? 'space-y-4 sm:space-y-5' : 'space-y-6 sm:space-y-8'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className="max-w-2xl mx-auto">
                                <Card className="border-border shadow-xl bg-card/50 backdrop-blur-sm">
                                    <CardHeader className="text-center border-b border-border pb-6 sm:pb-8">
                                        <div className="mx-auto p-3 bg-primary/10 rounded-2xl border border-primary/20 w-fit mb-4">
                                            <Lock size={28} className="text-primary" />
                                        </div>
                                        <CardTitle className="text-xl sm:text-2xl font-heading font-black italic uppercase tracking-tighter">
                                            Authorization <span className="text-primary">Keys</span>
                                        </CardTitle>
                                        <CardDescription className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-2">
                                            Update your security credentials
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8">
                                        <form onSubmit={handlePasswordChange} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">
                                                    Current Password
                                                </Label>
                                                <Input
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11 sm:h-12 font-medium tracking-wider"
                                                    placeholder="Enter current password"
                                                    required
                                                />
                                            </div>

                                            <Separator />

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">
                                                        New Password
                                                    </Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11 sm:h-12 font-medium tracking-wider"
                                                        placeholder="Enter new password"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">
                                                        Confirm New Password
                                                    </Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="bg-secondary/20 border-border focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11 sm:h-12 font-medium tracking-wider"
                                                        placeholder="Confirm new password"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full h-11 sm:h-12 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 rounded-xl font-black uppercase tracking-wider text-[10px] sm:text-[11px] transition-all duration-300"
                                                >
                                                    {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                                    Change Password
                                                </Button>
                                            </div>

                                            <div className="text-center pt-4">
                                                <p className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">
                                                    Password must be at least 8 characters long and include a mix of letters, numbers, and symbols
                                                </p>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    );
};

export default ProfilePage;