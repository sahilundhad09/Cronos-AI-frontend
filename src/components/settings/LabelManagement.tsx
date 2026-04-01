import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LabelManagementProps {
    projectId: string;
}

export const LabelManagement: React.FC<LabelManagementProps> = ({ projectId }) => {
    const projectLabels = useSettingsStore(state => state.projectLabels);
    const loadProjectLabels = useSettingsStore(state => state.loadProjectLabels);
    const createLabel = useSettingsStore(state => state.createLabel);
    const updateLabel = useSettingsStore(state => state.updateLabel);
    const deleteLabel = useSettingsStore(state => state.deleteLabel);
    const isLoading = useSettingsStore(state => state.loadingStates.labels);
    const isSaving = useSettingsStore(state => state.isSaving);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        color: '#3B82F6'
    });

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
        '#14B8A6', // Teal
        '#F97316', // Orange
    ];

    useEffect(() => {
        loadProjectLabels(projectId);
    }, [projectId, loadProjectLabels]);

    const handleCreate = async () => {
        if (!formData.name.trim()) return;

        try {
            await createLabel(projectId, formData.name, formData.color);
            setFormData({ name: '', color: '#3B82F6' });
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error('Failed to create label:', error);
        }
    };

    const handleUpdate = async () => {
        if (!editingLabel || !formData.name.trim()) return;

        try {
            await updateLabel(projectId, editingLabel.id, formData.name, formData.color);
            setEditingLabel(null);
            setFormData({ name: '', color: '#3B82F6' });
        } catch (error) {
            console.error('Failed to update label:', error);
        }
    };

    const handleDelete = async (labelId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this label? It will be removed from all tasks.'
        );

        if (confirmed) {
            try {
                await deleteLabel(projectId, labelId);
            } catch (error) {
                console.error('Failed to delete label:', error);
            }
        }
    };

    const openEditDialog = (label: any) => {
        setEditingLabel(label);
        setFormData({
            name: label.name,
            color: label.color
        });
    };

    const closeDialog = () => {
        setEditingLabel(null);
        setIsCreateDialogOpen(false);
        setFormData({ name: '', color: '#3B82F6' });
    };

    // Filter labels by search query
    const filteredLabels = projectLabels.filter(label =>
        label.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h2 className="text-lg sm:text-xl font-heading font-black text-foreground uppercase tracking-tight italic">
                        Project Labels
                    </h2>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-black mt-1 sm:mt-1.5 opacity-70 leading-relaxed">
                        Create and manage labels to organize your tasks
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20 h-10">
                            <Plus className="h-4 w-4 mr-2" />
                            New Label
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl font-heading font-black uppercase tracking-tight italic text-foreground text-left">
                                Create New Label
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-[11px] sm:text-xs font-semibold leading-relaxed text-left">
                                Add a new label to categorize your tasks in the neural network.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div>
                                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-2.5 block">
                                    Label Name *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Bug, Feature, Documentation"
                                    className="bg-secondary/30 border-border text-foreground h-11"
                                    maxLength={30}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-2.5 block">
                                    Identifier Color
                                </Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            {colorPresets.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setFormData({ ...formData, color })}
                                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.color === color
                                                        ? 'border-primary ring-2 ring-primary/20 scale-110'
                                                        : 'border-border hover:border-border/60'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                        <Input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-16 h-8 bg-secondary/30 border-border"
                                        />
                                    </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-6">
                            <Button
                                variant="ghost"
                                onClick={closeDialog}
                                className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isSaving || !formData.name.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-lg shadow-primary/20"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    'Create Label'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            {projectLabels.length > 0 && (
                <div className="relative group/search mb-4 sm:mb-6">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/50 group-focus-within/search:text-primary transition-colors" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter labels by name..."
                        className="pl-10 sm:pl-11 bg-secondary/30 border-border text-foreground h-10 sm:h-12 focus:border-primary/50 transition-all font-black uppercase text-[10px] sm:text-[11px] tracking-tight placeholder:opacity-50"
                    />
                </div>
            )}

            {/* Labels List */}
            <div className="bg-card/30 border border-border rounded-xl shadow-sm overflow-hidden">
                {filteredLabels.length === 0 ? (
                    <div className="p-16 text-center">
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic opacity-50">
                            {searchQuery ? 'Zero matches found in terminal.' : 'No active labels detected in this sector.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {filteredLabels.map((label) => (
                            <div
                                key={label.id}
                                className="p-4 sm:p-5 flex flex-col xs:flex-row xs:items-center justify-between hover:bg-secondary/10 transition-colors group gap-3 xs:gap-4"
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div
                                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-sm ring-1 ring-border shrink-0"
                                        style={{ backgroundColor: label.color }}
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-foreground font-black uppercase text-[11px] sm:text-[12px] tracking-tight truncate max-w-[120px] sm:max-w-none">{label.name}</span>
                                        <Badge
                                            variant="outline"
                                            className="text-[8px] sm:text-[9px] border-border/50 text-muted-foreground font-black uppercase tracking-[0.15em] h-4 sm:h-4.5 px-1.5 sm:px-2 bg-secondary/20 shrink-0"
                                            style={{
                                                backgroundColor: `${label.color}15`,
                                                borderColor: `${label.color}30`,
                                                color: label.color
                                            }}
                                        >
                                            {label.color}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Dialog
                                        open={editingLabel?.id === label.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                openEditDialog(label);
                                            } else {
                                                closeDialog();
                                            }
                                        }}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest"
                                            >
                                                Edit Tag
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-card border-border shadow-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-heading font-black uppercase tracking-tight italic text-foreground">
                                                    Refine Label
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4">
                                                <div>
                                                    <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-2.5 block">
                                                        Label Name *
                                                    </Label>
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="bg-secondary/30 border-border text-foreground h-11"
                                                        maxLength={30}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-2.5 block">
                                                        Identifier Color
                                                    </Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {colorPresets.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => setFormData({ ...formData, color })}
                                                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.color === color
                                                                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                                                                        : 'border-border hover:border-primary/40'
                                                                        }`}
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <Input
                                                            type="color"
                                                            value={formData.color}
                                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                            className="w-16 h-10 bg-secondary/30 border-border p-1 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter className="pt-6">
                                                <Button
                                                    variant="ghost"
                                                    onClick={closeDialog}
                                                    className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleUpdate}
                                                    disabled={isSaving || !formData.name.trim()}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-lg shadow-primary/20"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Syncing...
                                                        </>
                                                    ) : (
                                                        'Update Tag'
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(label.id)}
                                        className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
