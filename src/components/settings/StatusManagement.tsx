import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusManagementProps {
    projectId: string;
}

export const StatusManagement: React.FC<StatusManagementProps> = ({ projectId }) => {
    const projectStatuses = useSettingsStore(state => state.projectStatuses);
    const loadProjectStatuses = useSettingsStore(state => state.loadProjectStatuses);
    const createStatus = useSettingsStore(state => state.createStatus);
    const updateStatus = useSettingsStore(state => state.updateStatus);
    const deleteStatus = useSettingsStore(state => state.deleteStatus);
    const isLoading = useSettingsStore(state => state.loadingStates.statuses);
    const isSaving = useSettingsStore(state => state.isSaving);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusToDelete, setStatusToDelete] = useState<any>(null);
    const [moveTasksToStatusId, setMoveTasksToStatusId] = useState<string>('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        color: '#3B82F6'
    });

    // Color presets
    const colorPresets = [
        '#94A3B8', // Slate (To Do)
        '#3B82F6', // Blue (In Progress)
        '#F59E0B', // Amber (In Review)
        '#10B981', // Green (Done)
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#EF4444', // Red (Blocked)
    ];

    useEffect(() => {
        loadProjectStatuses(projectId);
    }, [projectId, loadProjectStatuses]);

    const handleCreate = async () => {
        if (!formData.name.trim()) return;

        try {
            const position = projectStatuses.length;
            await createStatus(projectId, formData.name, formData.color, position);
            setFormData({ name: '', color: '#3B82F6' });
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error('Failed to create status:', error);
        }
    };

    const handleUpdate = async () => {
        if (!editingStatus || !formData.name.trim()) return;

        try {
            await updateStatus(
                projectId,
                editingStatus.id,
                formData.name,
                formData.color,
                editingStatus.position
            );
            setEditingStatus(null);
            setFormData({ name: '', color: '#3B82F6' });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteClick = (status: any) => {
        setStatusToDelete(status);
        setDeleteDialogOpen(true);
        // Set default move-to status (first status that isn't the one being deleted)
        const otherStatuses = projectStatuses.filter(s => s.id !== status.id);
        if (otherStatuses.length > 0) {
            setMoveTasksToStatusId(otherStatuses[0].id);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!statusToDelete) return;

        try {
            await deleteStatus(projectId, statusToDelete.id, moveTasksToStatusId || undefined);
            setDeleteDialogOpen(false);
            setStatusToDelete(null);
            setMoveTasksToStatusId('');
        } catch (error) {
            console.error('Failed to delete status:', error);
        }
    };

    const openEditDialog = (status: any) => {
        setEditingStatus(status);
        setFormData({
            name: status.name,
            color: status.color
        });
    };

    const closeDialog = () => {
        setEditingStatus(null);
        setIsCreateDialogOpen(false);
        setFormData({ name: '', color: '#3B82F6' });
    };

    // Sort statuses by position
    const sortedStatuses = [...projectStatuses].sort((a, b) => a.position - b.position);

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
                        Task Statuses
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage the columns in your Kanban board
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black">
                            <Plus className="h-4 w-4 mr-2" />
                            New Status
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10">
                        <DialogHeader>
                            <DialogTitle className="text-white font-heading font-black uppercase">
                                Create New Status
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Add a new status column to your Kanban board.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                    Status Name *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., To Do, In Progress, Done"
                                    className="bg-slate-800/50 border-white/10 text-white"
                                    maxLength={50}
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
                                    'Create Status'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statuses List */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                {sortedStatuses.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 text-sm">
                            No statuses yet. Create your first status to set up your Kanban board.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {sortedStatuses.map((status) => (
                            <div
                                key={status.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-5 w-5 text-slate-600 cursor-move" />
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: status.color }}
                                    />
                                    <span className="text-white font-medium">{status.name}</span>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] border-white/10 text-slate-500"
                                    >
                                        Position {status.position + 1}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Dialog
                                        open={editingStatus?.id === status.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                openEditDialog(status);
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
                                                    Edit Status
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                                                        Status Name *
                                                    </Label>
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="bg-slate-800/50 border-white/10 text-white"
                                                        maxLength={50}
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
                                        onClick={() => handleDeleteClick(status)}
                                        disabled={sortedStatuses.length === 1}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                                        title={sortedStatuses.length === 1 ? 'Cannot delete the last status' : 'Delete status'}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white font-heading font-black uppercase">
                            Delete Status
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            What should happen to tasks in this status?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">
                            Move tasks to
                        </Label>
                        <Select value={moveTasksToStatusId} onValueChange={setMoveTasksToStatusId}>
                            <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/10">
                                {sortedStatuses
                                    .filter(s => s.id !== statusToDelete?.id)
                                    .map((status) => (
                                        <SelectItem key={status.id} value={status.id} className="text-white">
                                            {status.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-2">
                            All tasks in "{statusToDelete?.name}" will be moved to the selected status.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setStatusToDelete(null);
                                setMoveTasksToStatusId('');
                            }}
                            className="text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isSaving || !moveTasksToStatusId}
                            className="bg-red-500 hover:bg-red-400 text-white font-black"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Status'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
