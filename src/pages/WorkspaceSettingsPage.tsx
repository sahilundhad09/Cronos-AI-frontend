import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Trash2, ShieldAlert, Info, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceMemberManagement } from '@/components/settings/WorkspaceMemberManagement';

export const WorkspaceSettingsPage: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    const loadWorkspaceSettings = useSettingsStore(state => state.loadWorkspaceSettings);
    const updateWorkspace = useSettingsStore(state => state.updateWorkspace);
    const deleteWorkspace = useSettingsStore(state => state.deleteWorkspace);
    const isLoading = useSettingsStore(state => state.loadingStates.workspace);
    const isSaving = useSettingsStore(state => state.isSaving);

    const { fetchWorkspaces } = useWorkspaceStore();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo_url: ''
    });

    useEffect(() => {
        if (workspaceId) {
            loadWorkspaceSettings(workspaceId).then((ws: any) => {
                if (ws) {
                    setFormData({
                        name: ws.name || '',
                        description: ws.description || '',
                        logo_url: ws.logo_url || ''
                    });
                }
            });
        }
    }, [workspaceId, loadWorkspaceSettings]);

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceId) return;

        try {
            const updateData = {
                name: formData.name,
                description: formData.description || null,
                logo_url: formData.logo_url || null
            };
            await updateWorkspace(workspaceId, updateData);
            // Refresh workspaces in the sidebar
            fetchWorkspaces();
        } catch (error) {
            console.error('Failed to update workspace:', error);
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!workspaceId) return;

        const confirmName = window.prompt(
            `WARNING: This will permanently delete the workspace "${formData.name}" and all its projects. \n\nThis action cannot be undone. \n\nTo confirm, please type the workspace name:`
        );

        if (confirmName === formData.name) {
            try {
                await deleteWorkspace(workspaceId);
                navigate('/dashboard');
                fetchWorkspaces();
            } catch (error) {
                console.error('Failed to delete workspace:', error);
            }
        } else if (confirmName !== null) {
            toast.error('Workspace name does not match. Deletion cancelled.');
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Info className="h-4 w-4" /> },
        { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
        { id: 'advanced', label: 'Advanced', icon: <AlertTriangle className="h-4 w-4" /> }
    ];

    const breadcrumbs = [
        { label: 'Workspaces', href: '/dashboard' },
        { label: formData.name || 'Workspace' }
    ];

    if (isLoading && !formData.name) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <SettingsLayout
            title="Workspace Settings"
            subtitle={formData.name}
            breadcrumbs={breadcrumbs}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight mb-6">
                        Workspace Information
                    </h2>

                    <form onSubmit={handleSaveGeneral} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-slate-400">
                                    Workspace Name *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter workspace name"
                                    className="bg-slate-800/50 border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-slate-400">
                                    Logo URL
                                </Label>
                                <Input
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="bg-slate-800/50 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-black text-slate-400">
                                Description
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this workspace"
                                className="bg-slate-800/50 border-white/10 text-white min-h-[100px]"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    if (workspaceId) {
                                        loadWorkspaceSettings(workspaceId).then((ws: any) => {
                                            if (ws) {
                                                setFormData({
                                                    name: ws.name || '',
                                                    description: ws.description || '',
                                                    logo_url: ws.logo_url || ''
                                                });
                                            }
                                        });
                                    }
                                }}
                                className="text-slate-400 hover:text-white"
                                disabled={isSaving}
                            >
                                Reset Changes
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black px-8"
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
                        </div>
                    </form>
                </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <WorkspaceMemberManagement workspaceId={workspaceId!} />
                </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 m-0">
                <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-6">
                    <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                        <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                            <h3 className="text-red-400 font-black uppercase text-xs tracking-widest mb-1">
                                Danger Zone
                            </h3>
                            <p className="text-slate-400 text-sm font-medium">
                                These actions are permanent and cannot be undone. Be extremely careful.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 divide-y divide-white/5">
                        <div className="flex items-center justify-between pt-0 pb-6">
                            <div className="max-w-md">
                                <h4 className="text-white font-bold text-sm">Delete Workspace</h4>
                                <p className="text-slate-500 text-xs mt-1">
                                    Permanently delete this workspace and all associated projects, tasks, and data. All neural links will be severed.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteWorkspace}
                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black px-6 border border-red-500/20 hover:border-red-500 transition-all"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Workspace
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </SettingsLayout>
    );
};
