import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { TabsContent } from '@/components/ui/tabs';
import {
    Info,
    Users,
    Tag,
    Columns,
    AlertTriangle,
    Loader2,
    Save,
    X,
    Upload,
    Zap,
    Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MemberManagement } from '@/components/settings/MemberManagement';
import { LabelManagement } from '@/components/settings/LabelManagement';
import { StatusManagement } from '@/components/settings/StatusManagement';

export const ProjectSettingsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const currentProject = useSettingsStore(state => state.currentProject);
    const isLoading = useSettingsStore(state => state.loadingStates.project);
    const isSaving = useSettingsStore(state => state.isSaving);
    const loadProjectSettings = useSettingsStore(state => state.loadProjectSettings);
    const updateProject = useSettingsStore(state => state.updateProject);
    const archiveProject = useSettingsStore(state => state.archiveProject);
    const deleteProject = useSettingsStore(state => state.deleteProject);
    const uploadProjectImage = useSettingsStore(state => state.uploadProjectImage);

    // Image upload state
    const [stagedImage, setStagedImage] = useState<{ file: File; preview: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Form state for general settings
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        start_date: '',
        end_date: ''
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Load project settings on mount
    useEffect(() => {
        if (projectId) {
            loadProjectSettings(projectId);
        }
    }, [projectId, loadProjectSettings]);

    // Update form when project loads
    useEffect(() => {
        if (currentProject) {
            setFormData({
                name: currentProject.name || '',
                description: currentProject.description || '',
                color: currentProject.color || '#3B82F6',
                start_date: currentProject.start_date ? currentProject.start_date.split('T')[0] : '',
                end_date: currentProject.end_date ? currentProject.end_date.split('T')[0] : ''
            });
        }
    }, [currentProject]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!projectId) return;

        try {
            const updateData: any = {
                name: formData.name,
                description: formData.description || null,
                color: formData.color || null,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
            };

            await updateProject(projectId, updateData);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save project settings:', error);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setStagedImage({ file, preview });
        }
    };

    const handleEmblemSync = async () => {
        if (!projectId || !stagedImage) return;
        try {
            await uploadProjectImage(projectId, stagedImage.file);
            setStagedImage(null);
        } catch (error) {
            console.error('Failed to sync project emblem:', error);
        }
    };

    const handleAbortEmblem = () => {
        if (stagedImage) {
            URL.revokeObjectURL(stagedImage.preview);
            setStagedImage(null);
        }
    };

    const handleCancel = () => {
        if (currentProject) {
            setFormData({
                name: currentProject.name || '',
                description: currentProject.description || '',
                color: currentProject.color || '#3B82F6',
                start_date: currentProject.start_date ? currentProject.start_date.split('T')[0] : '',
                end_date: currentProject.end_date ? currentProject.end_date.split('T')[0] : ''
            });
            setHasChanges(false);
        }
    };

    const handleArchive = async () => {
        if (!projectId || !currentProject) return;

        const confirmed = window.confirm(
            currentProject.archived
                ? 'Are you sure you want to unarchive this project?'
                : 'Are you sure you want to archive this project? It will be hidden from active lists.'
        );

        if (confirmed) {
            try {
                await archiveProject(projectId, !currentProject.archived);
            } catch (error) {
                console.error('Failed to archive project:', error);
            }
        }
    };

    const handleDelete = async () => {
        if (!projectId || !currentProject) return;

        const projectName = prompt(
            'This action cannot be undone. Type the project name to confirm deletion:'
        );

        if (projectName === currentProject.name) {
            try {
                await deleteProject(projectId);
                navigate('/projects');
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        } else if (projectName !== null) {
            alert('Project name does not match. Deletion cancelled.');
        }
    };

    if (isLoading && !currentProject) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Project not found</p>
                    <Button onClick={() => navigate('/projects')} className="mt-4">
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General', icon: <Info className="h-4 w-4" /> },
        { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
        { id: 'labels', label: 'Labels', icon: <Tag className="h-4 w-4" /> },
        { id: 'statuses', label: 'Statuses', icon: <Columns className="h-4 w-4" /> },
        { id: 'advanced', label: 'Advanced', icon: <AlertTriangle className="h-4 w-4" /> }
    ];

    const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: currentProject.name, href: `/projects/${projectId}` },
        { label: 'Settings' }
    ];

    // Color presets
    const colorPresets = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#6366F1', // Indigo
    ];

    return (
        <SettingsLayout
            title="Project Settings"
            breadcrumbs={breadcrumbs}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 sm:space-y-6 m-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Emblem Management */}
                    <div className="bg-card/50 border border-border rounded-2xl p-4 sm:p-6 flex flex-col items-center">
                        <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 sm:mb-8 self-start opacity-70">
                            Mission Emblem
                        </h2>
                        
                        <div className="relative group mb-6 sm:mb-8">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-2 border-dashed border-border group-hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden bg-secondary/20 relative shadow-2xl">
                                {stagedImage || currentProject.image_url ? (
                                    <>
                                        <img 
                                            src={stagedImage?.preview || currentProject.image_url || ''} 
                                            alt="Project Emblem" 
                                            className="w-full h-full object-cover"
                                        />
                                        <AnimatePresence>
                                            {stagedImage && (
                                                <motion.div 
                                                    initial={{ top: "-100%" }}
                                                    animate={{ top: "100%" }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] z-10"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/50">Neural Link Offline</p>
                                    </div>
                                )}
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 w-10 shadow-lg"
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageSelect} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>

                        <AnimatePresence>
                            {stagedImage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-2 w-full"
                                >
                                    <Button 
                                        onClick={handleEmblemSync}
                                        disabled={isSaving}
                                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[9px] tracking-widest h-9 rounded-xl"
                                    >
                                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "SYNC EMBLEM"}
                                    </Button>
                                    <Button 
                                        onClick={handleAbortEmblem}
                                        variant="ghost" 
                                        className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* General Information */}
                    <div className="lg:col-span-2 bg-card/50 border border-border rounded-2xl p-5 sm:p-8">
                        <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 sm:mb-8 opacity-70">
                            Mission Parameters
                        </h2>

                    <div className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <Label htmlFor="name" className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-2 block">
                                Project Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter project name"
                                className="bg-secondary/30 border-border text-foreground"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description" className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-2 block">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter project description"
                                className="bg-secondary/30 border-border text-foreground min-h-[100px]"
                                maxLength={1000}
                            />
                            <p className="text-xs text-slate-600 mt-1">
                                {formData.description.length}/1000 characters
                            </p>
                        </div>

                        {/* Color */}
                        <div>
                            <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-2 block">
                                Project Color
                            </Label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="grid grid-cols-5 xs:grid-cols-6 sm:flex sm:flex-wrap gap-2">
                                    {colorPresets.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleInputChange('color', color)}
                                            className={`w-10 h-10 rounded-xl border-2 transition-all relative group/color ${formData.color === color
                                                ? 'border-primary ring-4 ring-primary/10'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                            title={color}
                                        >
                                            <div 
                                                className="absolute inset-1 rounded-lg"
                                                style={{ backgroundColor: color }}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 bg-secondary/30 border border-border rounded-xl p-2 px-3">
                                    <Palette className="h-4 w-4 text-primary" />
                                    <Input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => handleInputChange('color', e.target.value)}
                                        className="w-10 h-8 p-0 border-none bg-transparent cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="start_date" className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-2 block">
                                    Start Date
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    className="bg-secondary/30 border-border text-foreground appearance-none"
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date" className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-2 block">
                                    End Date
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    min={formData.start_date}
                                    className="bg-secondary/30 border-border text-foreground appearance-none"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {hasChanges && (
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !formData.name.trim()}
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] sm:text-[11px] tracking-widest px-8 shadow-lg shadow-primary/20 h-10 sm:h-11"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                            Update Parameters
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="ghost"
                                    disabled={isSaving}
                                    className="w-full sm:w-auto text-muted-foreground hover:text-foreground font-black uppercase text-[10px] sm:text-[11px] tracking-widest h-10 sm:h-11"
                                >
                                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                    Abort
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6 m-0">
                <div className="bg-card/50 border border-border rounded-xl p-4 sm:p-6">
                    <MemberManagement projectId={projectId!} />
                </div>
            </TabsContent>

            {/* Labels Tab */}
            <TabsContent value="labels" className="space-y-6 m-0">
                <div className="bg-card/50 border border-border rounded-xl p-4 sm:p-6">
                    <LabelManagement projectId={projectId!} />
                </div>
            </TabsContent>

            {/* Statuses Tab */}
            <TabsContent value="statuses" className="space-y-6 m-0">
                <div className="bg-card/50 border border-border rounded-xl p-4 sm:p-6">
                    <StatusManagement projectId={projectId!} />
                </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 m-0">
                <div className="bg-card/50 border border-border rounded-xl p-5 sm:p-6">
                    <h2 className="text-base sm:text-lg font-heading font-black text-foreground uppercase tracking-tight mb-6">
                        Advanced Settings
                    </h2>
                    {/* ... (rest of advanced tab content) */}
                    <div className="mb-8">
                        <h3 className="text-xs sm:text-sm font-bold text-foreground mb-2 text-amber-400">
                            {currentProject.archived ? 'UNARCHIVE PROJECT' : 'ARCHIVE PROJECT'}
                        </h3>
                        <p className="text-[11px] sm:text-sm text-muted-foreground mb-4">
                            {currentProject.archived
                                ? 'Restore this project to active status. It will reappear in mission lists.'
                                : 'Hide this project from active lists. All data persists but is categorized as inactive.'}
                        </p>
                        <Button
                            onClick={handleArchive}
                            disabled={isSaving}
                            variant="outline"
                            className="w-full sm:w-auto border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-black uppercase text-[10px] tracking-widest h-10"
                        >
                            {currentProject.archived ? 'Initiate Restore' : 'Initiate Archival'}
                        </Button>
                    </div>

                    <div className="border-t border-red-500/20 pt-8">
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 sm:p-6">
                            <h3 className="text-xs sm:text-sm font-bold text-red-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
                                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Danger Zone
                            </h3>
                            <p className="text-[11px] sm:text-sm text-slate-400 mb-4">
                                Permanent erasure. All neural data, tactical assets, and mission history will be purged. This action is irreversible.
                            </p>
                            <Button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="w-full sm:w-auto bg-red-500 hover:bg-red-400 text-white font-black uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-red-500/20"
                            >
                                PURGE PROJECT
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </SettingsLayout>
    );
};
