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
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-heading font-black text-foreground uppercase tracking-tight italic">
                        Task Statuses
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-black mt-1.5">
                        Manage the columns in your Kanban board
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4 mr-2" />
                            New Status
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-heading font-black uppercase tracking-tight italic text-foreground">
                                Create New Status
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-xs font-semibold leading-relaxed">
                                Add a new status column to your Kanban board.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div>
                                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-2.5 block">
                                    Status Name *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., To Do, In Progress, Done"
                                    className="bg-secondary/30 border-border text-foreground h-11"
                                    maxLength={50}
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
                                                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                                                    : 'border-border hover:border-primary/40'
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
                                onClick={handleCreate}
                                disabled={isSaving || !formData.name.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-lg shadow-primary/20"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Sector'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statuses List */}
            <div className="bg-card/50 border border-border rounded-xl shadow-sm overflow-hidden">
                {sortedStatuses.length === 0 ? (
                    <div className="p-16 text-center">
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.1em] italic">
                            No active statuses detected. Configure terminal columns.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {sortedStatuses.map((status) => (
                            <div
                                key={status.id}
                                className="p-5 flex items-center justify-between hover:bg-primary/[0.02] transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <GripVertical className="h-5 w-5 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />
                                    <div
                                        className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-border"
                                        style={{ backgroundColor: status.color }}
                                    />
                                    <span className="text-foreground font-black uppercase text-[13px] tracking-tight">{status.name}</span>
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] border-border text-muted-foreground font-black uppercase tracking-widest px-2 py-0 h-4.5 bg-secondary/30"
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
                                                className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest"
                                            >
                                                Edit Parameters
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-card border-border shadow-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-heading font-black uppercase tracking-tight italic text-foreground">
                                                    Refine Status
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4">
                                                <div>
                                                    <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-2.5 block">
                                                        Status Name *
                                                    </Label>
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="bg-secondary/30 border-border text-foreground h-11"
                                                        maxLength={50}
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
                                                        'Update Parameters'
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
                                        className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-all rounded-lg"
                                        title={sortedStatuses.length === 1 ? 'Last status retention active' : 'Terminate status'}
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
                <DialogContent className="bg-card border-destructive/20 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-heading font-black uppercase tracking-tight italic text-destructive">
                            Decommission Status
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs font-semibold leading-relaxed">
                            Terminal operation detected. Re-route active task data to an alternative sector.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground block">
                            Target Redirect Sector
                        </Label>
                        <Select value={moveTasksToStatusId} onValueChange={setMoveTasksToStatusId}>
                            <SelectTrigger className="bg-secondary/30 border-border text-foreground h-12">
                                <SelectValue placeholder="Select destination..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {sortedStatuses
                                    .filter(s => s.id !== statusToDelete?.id)
                                    .map((status) => (
                                        <SelectItem key={status.id} value={status.id} className="text-foreground focus:bg-primary/10 uppercase text-[10px] font-black">
                                            {status.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest leading-relaxed">
                                CRITICAL: All tasks in "{statusToDelete?.name}" will be permanently re-linked to the selected sector.
                            </p>
                        </div>
                    </div>
                     <DialogFooter className="pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setStatusToDelete(null);
                                setMoveTasksToStatusId('');
                            }}
                            className="text-muted-foreground hover:text-foreground font-black uppercase text-[10px] tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isSaving || !moveTasksToStatusId}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-lg shadow-destructive/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Purging...
                                </>
                            ) : (
                                'Execute Purchase'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
