import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Zap, Loader2, Sparkles, Camera, X as CloseIcon, Paperclip, FileText, Flag, ArrowRightLeft } from 'lucide-react';
import { useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useAIStore } from '@/store/useAIStore';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface CreateTaskDialogProps {
    projectId: string;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialStatusId?: string;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ 
    projectId, 
    trigger, 
    isOpen: controlledOpen, 
    onOpenChange: setControlledOpen,
    initialStatusId 
}) => {
    const queryClient = useQueryClient();
    const { activeWorkspace } = useWorkspaceStore();
    const { createTask, isLoading, statuses, fetchProjectStatuses } = useTaskStore();
    const { detailTask } = useAIStore();

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [statusId, setStatusId] = useState(initialStatusId || '');
    const [isDetailing, setIsDetailing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleAIDetail = async () => {
        if (!title.trim()) return;
        setIsDetailing(true);
        try {
            const detailed = await detailTask(projectId, title, description);
            setDescription(detailed);
        } catch (error) {
            console.error('AI Detailer error:', error);
        } finally {
            setIsDetailing(false);
        }
    };

    useEffect(() => {
        if (isOpen && statuses.length === 0) {
            fetchProjectStatuses(projectId);
        }
    }, [isOpen, projectId, statuses.length, fetchProjectStatuses]);

    useEffect(() => {
        if (statuses.length > 0 && !statusId) {
            setStatusId(initialStatusId || statuses[0].id);
        }
    }, [statuses, statusId, initialStatusId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const task = await createTask(projectId, {
                title,
                description,
                priority,
                status_id: statusId
            }) as any;

            if (task && selectedFile) {
                // Upload attachment after creation
                const formData = new FormData();
                formData.append('file', selectedFile);
                await api.post(`/tasks/${task.id}/attachments`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Invalidate analytics and dashboard queries
            if (activeWorkspace) {
                queryClient.invalidateQueries({ queryKey: ['workspace-analytics', activeWorkspace.id] });
            }

            setIsOpen(false);
            setTitle('');
            setDescription('');
            setPriority('medium');
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Failed to create task', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-10 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg w-[calc(100%-1.5rem)] bg-card border-2 border-border/80 text-foreground rounded-[2rem] p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)]">
                <DialogHeader className="px-6 py-5 border-b border-border bg-secondary/10">
                    <DialogTitle className="text-xl font-heading font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                            <Plus className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                        New <span className="text-primary">Milestone</span>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[80vh]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Primary Info Segment */}
                            <div className="space-y-2">
                                <Label htmlFor="t-title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-primary" />
                                    Mission Title
                                </Label>
                                <Input
                                    id="t-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-secondary/30 border-border/60 rounded-xl h-11 focus:border-primary/50 transition-all font-bold text-sm"
                                    placeholder="Define your tactical objective..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="t-desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-primary" />
                                        Briefing
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleAIDetail}
                                        disabled={isDetailing || !title.trim()}
                                        className="h-6 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/10 gap-2 transition-all active:scale-95"
                                    >
                                        {isDetailing ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-3 w-3" />
                                        )}
                                        AI Synchronize
                                    </Button>
                                </div>
                                <Textarea
                                    id="t-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-secondary/30 border-border/60 rounded-xl min-h-[100px] focus:border-primary/50 transition-all font-semibold text-sm leading-relaxed p-4 resize-none"
                                    placeholder="Elaborate on the parameters..."
                                />
                            </div>

                            {/* Tactical Configuration Matrix */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                        <Flag className="h-3 w-3 text-primary" />
                                        Priority
                                    </Label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as any)}
                                        className="w-full bg-secondary/30 border border-border/60 rounded-xl h-11 px-4 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer outline-none"
                                    >
                                        <option value="low" className="bg-card text-foreground">LOW</option>
                                        <option value="medium" className="bg-card text-foreground">MEDIUM</option>
                                        <option value="high" className="bg-card text-foreground">HIGH</option>
                                        <option value="urgent" className="bg-card text-foreground text-red-500 font-black">URGENT</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                        <ArrowRightLeft className="h-3 w-3 text-primary" />
                                        Sector
                                    </Label>
                                    <select
                                        value={statusId}
                                        onChange={(e) => setStatusId(e.target.value)}
                                        className="w-full bg-secondary/30 border border-border/60 rounded-xl h-11 px-4 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer outline-none"
                                        disabled={statuses.length === 0}
                                    >
                                        {statuses.length === 0 ? (
                                            <option value="">SCANNING...</option>
                                        ) : (
                                            statuses.map(s => (
                                                <option key={s.id} value={s.id} className="bg-card text-foreground">{s.name.toUpperCase()}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Asset Uplink Section */}
                            <div className="space-y-3 pt-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <Paperclip className="h-3 w-3 text-primary" />
                                    Tactical Asset Uplink
                                </Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                
                                <div 
                                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                                    className={`
                                        relative h-20 w-full rounded-2xl border-2 border-dashed 
                                        flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group/asset
                                        ${selectedFile ? 'border-primary/20 bg-primary/5' : 'border-border/60 hover:border-primary/40 hover:bg-secondary/30'}
                                    `}
                                >
                                    {selectedFile ? (
                                        <>
                                            {previewUrl ? (
                                                <img src={previewUrl} className="h-full w-full object-cover rounded-2xl opacity-30 px-1" alt="Preview" />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/80 truncate max-w-[180px]">
                                                        {selectedFile.name}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                                                <Button 
                                                    type="button"
                                                    variant="secondary" 
                                                    size="sm" 
                                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                    className="h-7 text-[8px] font-black uppercase tracking-widest rounded-lg bg-card shadow-sm border border-border/40"
                                                >
                                                    Modify
                                                </Button>
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/90 text-white shadow-lg z-10 hover:bg-destructive transition-colors border-2 border-card"
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                                            >
                                                <CloseIcon size={12} />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-8 w-8 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover/asset:text-primary transition-colors">
                                                <Camera size={16} />
                                            </div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover/asset:text-primary/60 transition-colors">Link Local Media</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-0 pt-4 flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="h-11 flex-1 border-border/60 hover:bg-secondary/80 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                Abort
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !title.trim()}
                                className="h-11 flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 flex items-center justify-center gap-3 group/init"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Initialize Link
                                        <Zap className="h-3.5 w-3.5 fill-primary-foreground group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export { CreateTaskDialog };
export default CreateTaskDialog;
