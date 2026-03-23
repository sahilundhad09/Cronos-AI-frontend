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
import { Loader2, Save, Trash2, ShieldAlert, Info, Users, AlertTriangle, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceMemberManagement } from '@/components/settings/WorkspaceMemberManagement';
import { ThemeCustomization } from '@/components/settings/ThemeCustomization';

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
        { id: 'theme', label: 'Theme', icon: <Palette className="h-4 w-4" /> },
        { id: 'advanced', label: 'Advanced', icon: <AlertTriangle className="h-4 w-4" /> }
    ];

    const breadcrumbs = [
        { label: 'Workspaces', href: '/dashboard' },
        { label: formData.name || 'Workspace' }
    ];

    if (isLoading && !formData.name) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <div className="bg-card border border-border rounded-xl p-4 sm:p-8 shadow-sm">
                    <h2 className="text-lg sm:text-xl font-heading font-black text-foreground uppercase tracking-tight italic mb-6 sm:mb-8">
                        Workspace Information
                    </h2>

                    <form onSubmit={handleSaveGeneral} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground">
                                    Workspace Name *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter workspace name"
                                    className="bg-secondary/30 border-border text-foreground h-11 px-4 focus:border-primary/50 transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground">
                                    Logo URL
                                </Label>
                                <Input
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="bg-secondary/30 border-border text-foreground h-11 px-4 focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground">
                                Description
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this workspace"
                                className="bg-secondary/30 border-border text-foreground min-h-[120px] p-4 focus:border-primary/50 transition-colors resize-none"
                            />
                        </div>

                        <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
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
                                className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest w-full sm:w-auto"
                                disabled={isSaving}
                            >
                                Reset Changes
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 sm:px-10 h-11 uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Parameters
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6 m-0">
                <div className="bg-card border border-border rounded-xl p-4 sm:p-8 shadow-sm">
                    <WorkspaceMemberManagement workspaceId={workspaceId!} />
                </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6 m-0">
                <ThemeCustomization />
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 m-0">
                <div className="bg-card border border-destructive/20 rounded-xl p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 bg-destructive/5 border border-destructive/10 rounded-xl mb-8">
                        <ShieldAlert className="h-6 w-6 text-destructive mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-destructive font-black uppercase text-[10px] tracking-[0.2em] mb-1.5">
                                Restricted Access Sector
                            </h3>
                            <p className="text-muted-foreground text-xs font-semibold leading-relaxed">
                                These actions are permanent and cannot be undone. Terminal deletion will erase all project history and associated neural links.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 divide-y divide-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-0 pb-4">
                            <div className="max-w-md">
                                <h4 className="text-foreground font-black uppercase text-sm italic tracking-tight mb-2">Workspace Decommission</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed font-semibold">
                                    Permanently delete this workspace and all associated projects, tasks, and data. This action is irreversible.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteWorkspace}
                                className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground font-black px-6 sm:px-8 h-12 uppercase text-[10px] tracking-widest border border-destructive/20 hover:border-destructive transition-all shadow-lg hover:shadow-destructive/20 w-full sm:w-auto"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Terminate Workspace
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </SettingsLayout>
    );
};
