import React from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { THEME_TEMPLATES, type ThemeTemplate } from '@/lib/themeTemplates';
import { cn } from '@/lib/utils';

export const ThemeCustomization: React.FC = () => {
    const { selectedTemplateId, mode, setTemplate, setMode } = useThemeStore();

    return (
        <div className="space-y-8">
            {/* Mode Selection */}
            <div className="bg-card/80 border border-border rounded-xl p-6">
                <h3 className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-4 italic">
                    Appearance Mode
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setMode('light')}
                        className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                            mode === 'light'
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                        )}
                    >
                        <Sun className="h-5 w-5" />
                        <span className="font-black uppercase text-[11px] tracking-widest italic tracking-tight">Light Mode</span>
                    </button>
                    <button
                        onClick={() => setMode('dark')}
                        className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                            mode === 'dark'
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                        )}
                    >
                        <Moon className="h-5 w-5" />
                        <span className="font-black uppercase text-[11px] tracking-widest italic tracking-tight">Dark Mode</span>
                    </button>
                </div>
            </div>

            {/* Template Selection */}
            <div className="bg-card/80 border border-border rounded-xl p-6">
                <h3 className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground mb-4 italic">
                    Theme Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {THEME_TEMPLATES.map((template: ThemeTemplate) => (
                        <button
                            key={template.id}
                            onClick={() => setTemplate(template.id)}
                            className={cn(
                                "group relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left",
                                selectedTemplateId === template.id
                                    ? "bg-secondary border-primary/50 ring-1 ring-primary/40"
                                    : "bg-secondary/40 border-border hover:border-primary/30"
                            )}
                        >
                            <div className="flex items-center justify-between w-full mb-3">
                                <span className={cn(
                                    "font-black uppercase text-[11px] tracking-tighter italic",
                                    selectedTemplateId === template.id ? "text-primary" : "text-foreground"
                                )}>
                                    {template.name}
                                </span>
                                {selectedTemplateId === template.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </div>
                            
                            <p className="text-[10px] text-muted-foreground font-medium mb-4 line-clamp-2">
                                {template.description}
                            </p>

                            {/* Swatches */}
                            <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-auto">
                                {template.swatches.map((color, i) => (
                                    <div 
                                        key={i} 
                                        className="h-full flex-1" 
                                        style={{ backgroundColor: color }} 
                                    />
                                ))}
                            </div>

                            {selectedTemplateId === template.id && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-primary/[0.03] border border-primary/20 rounded-xl shadow-inner shadow-primary/5">
                <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                    <Sun className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed italic opacity-80">
                    Themes are applied globally across all workspaces and projects linked to your neural profile.
                </p>
            </div>
        </div>
    );
};