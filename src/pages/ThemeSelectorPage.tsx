import React from 'react';
import { Palette } from 'lucide-react';
import { ThemeCustomization } from '@/components/settings/ThemeCustomization';

const ThemeSelectorPage: React.FC = () => {
    return (
        <div className="min-h-full bg-background text-foreground">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/15 border border-primary/30 flex-shrink-0">
                        <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tighter uppercase italic">
                            Theme <span className="text-primary">Selector</span>
                        </h1>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            Global template-based customization for dark and light mode.
                        </p>
                    </div>
                </div>

                <ThemeCustomization />
            </div>
        </div>
    );
};

export default ThemeSelectorPage;
