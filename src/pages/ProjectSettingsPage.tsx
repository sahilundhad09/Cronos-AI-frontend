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
    X
} from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400">Project not found</p>
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
            <TabsContent value="general" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight mb-6">
                        General Information
                    </h2>

                    <div className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <Label htmlFor="name" className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                Project Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter project name"
                                className="bg-slate-800/50 border-white/10 text-white"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description" className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter project description"
                                className="bg-slate-800/50 border-white/10 text-white min-h-[100px]"
                                maxLength={1000}
                            />
                            <p className="text-xs text-slate-600 mt-1">
                                {formData.description.length}/1000 characters
                            </p>
                        </div>

                        {/* Color */}
                        <div>
                            <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                Project Color
                            </Label>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    {colorPresets.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleInputChange('color', color)}
                                            className={`w-10 h-10 rounded-lg border-2 transition-all ${formData.color === color
                                                ? 'border-white scale-110'
                                                : 'border-white/20 hover:border-white/40'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => handleInputChange('color', e.target.value)}
                                    className="w-20 h-10 bg-slate-800/50 border-white/10"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="start_date" className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                    Start Date
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    className="bg-slate-800/50 border-white/10 text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date" className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                    End Date
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    min={formData.start_date}
                                    className="bg-slate-800/50 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {hasChanges && (
                            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !formData.name.trim()}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="ghost"
                                    disabled={isSaving}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <MemberManagement projectId={projectId!} />
                </div>
            </TabsContent>

            {/* Labels Tab */}
            <TabsContent value="labels" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <LabelManagement projectId={projectId!} />
                </div>
            </TabsContent>

            {/* Statuses Tab */}
            <TabsContent value="statuses" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <StatusManagement projectId={projectId!} />
                </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight mb-6">
                        Advanced Settings
                    </h2>

                    {/* Archive Project */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-white mb-2">
                            {currentProject.archived ? 'Unarchive Project' : 'Archive Project'}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            {currentProject.archived
                                ? 'Restore this project to active status.'
                                : 'Hide this project from active lists. You can unarchive it later.'}
                        </p>
                        <Button
                            onClick={handleArchive}
                            disabled={isSaving}
                            variant="outline"
                            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                            {currentProject.archived ? 'Unarchive Project' : 'Archive Project'}
                        </Button>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-red-500/20 pt-8">
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Danger Zone
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Once you delete a project, there is no going back. All tasks, comments, and data will be permanently deleted.
                            </p>
                            <Button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="bg-red-500 hover:bg-red-400 text-white font-black"
                            >
                                Delete Project
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </SettingsLayout>
    );
};
