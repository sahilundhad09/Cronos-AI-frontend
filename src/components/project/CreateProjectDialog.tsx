import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Camera, X as CloseIcon } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

interface CreateProjectDialogProps {
    trigger?: React.ReactNode;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ trigger }) => {
    const queryClient = useQueryClient();
    const { activeWorkspace } = useWorkspaceStore();
    const { createProject, isLoading } = useProjectStore();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspace) return;

        try {
            const project = await createProject(activeWorkspace.id, {
                name,
                description,
                color
            }) as any;

            if (project && selectedFile) {
                await useProjectStore.getState().uploadProjectImage(project.id, selectedFile);
            }

            // Invalidate dashboard and project queries
            queryClient.invalidateQueries({ queryKey: ['workspace-projects', activeWorkspace.id] });
            queryClient.invalidateQueries({ queryKey: ['workspace-analytics', activeWorkspace.id] });

            setIsOpen(false);
            setName('');
            setDescription('');
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-xl px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Initialize Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-black italic uppercase tracking-tighter">
                        New <span className="text-primary">Orchestration</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                        Define the parameters for your next mission
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-8">
                        <div className="space-y-2">
                            <Label htmlFor="p-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mission Name</Label>
                            <Input
                                id="p-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-secondary/30 border-border rounded-xl h-12 focus:border-primary/50 transition-all font-bold"
                                placeholder="e.g. Operation Void"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p-desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Objective (Optional)</Label>
                            <Input
                                id="p-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-secondary/30 border-border rounded-xl h-12 focus:border-primary/50 transition-all font-bold"
                                placeholder="Define mission focus..."
                            />
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tactical Identity Color</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:border-primary/30'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <Input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-12 h-8 p-0 border-none bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Project Emblem (Optional)</Label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            
                            <div 
                                onClick={() => !previewUrl && fileInputRef.current?.click()}
                                className={`
                                    relative h-32 w-full rounded-2xl border-2 border-dashed 
                                    flex flex-col items-center justify-center gap-2 transition-all cursor-pointer
                                    ${previewUrl ? 'border-primary/20 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/20'}
                                `}
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} className="h-full w-full object-cover rounded-2xl opacity-80" alt="Preview" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                                            <Button 
                                                type="button"
                                                variant="secondary" 
                                                size="sm" 
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg bg-card"
                                            >
                                                Change
                                            </Button>
                                        </div>
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white shadow-lg"
                                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                                        >
                                            <CloseIcon size={12} />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                                            <Camera size={20} />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Upload Emblem</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                        >
                            {isLoading ? 'Processing...' : 'Deploy Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { CreateProjectDialog };
export default CreateProjectDialog;
