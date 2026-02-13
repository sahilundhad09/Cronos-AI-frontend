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
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-heading font-black text-white uppercase tracking-tight">
                        Project Labels
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Create and manage labels to organize your tasks
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black">
                            <Plus className="h-4 w-4 mr-2" />
                            New Label
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10">
                        <DialogHeader>
                            <DialogTitle className="text-white font-heading font-black uppercase">
                                Create New Label
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Add a new label to categorize your tasks.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                    Label Name *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Bug, Feature, Documentation"
                                    className="bg-slate-800/50 border-white/10 text-white"
                                    maxLength={30}
                                />
                            </div>
                            <div>
                                <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                    Color
                                </Label>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        {colorPresets.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.color === color
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
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-16 h-8 bg-slate-800/50 border-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={closeDialog}
                                className="text-slate-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isSaving || !formData.name.trim()}
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
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
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search labels..."
                        className="pl-10 bg-slate-800/50 border-white/10 text-white"
                    />
                </div>
            )}

            {/* Labels List */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                {filteredLabels.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 text-sm">
                            {searchQuery ? 'No labels found matching your search.' : 'No labels yet. Create your first label to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredLabels.map((label) => (
                            <div
                                key={label.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: label.color }}
                                    />
                                    <span className="text-white font-medium">{label.name}</span>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] border-white/10 text-slate-500"
                                        style={{
                                            backgroundColor: `${label.color}15`,
                                            borderColor: `${label.color}30`,
                                            color: label.color
                                        }}
                                    >
                                        {label.color}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                className="text-slate-400 hover:text-white"
                                            >
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-slate-900 border-white/10">
                                            <DialogHeader>
                                                <DialogTitle className="text-white font-heading font-black uppercase">
                                                    Edit Label
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                                        Label Name *
                                                    </Label>
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="bg-slate-800/50 border-white/10 text-white"
                                                        maxLength={30}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                                        Color
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {colorPresets.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => setFormData({ ...formData, color })}
                                                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.color === color
                                                                        ? 'border-white scale-110'
                                                                        : 'border-white/20 hover:border-white/40'
                                                                        }`}
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <Input
                                                            type="color"
                                                            value={formData.color}
                                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                            className="w-16 h-8 bg-slate-800/50 border-white/10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="ghost"
                                                    onClick={closeDialog}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleUpdate}
                                                    disabled={isSaving || !formData.name.trim()}
                                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(label.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
