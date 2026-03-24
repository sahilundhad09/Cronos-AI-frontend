import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsTab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    visible?: boolean;
}

interface SettingsLayoutProps {
    title: string;
    subtitle?: string;
    breadcrumbs: { label: string; href?: string }[];
    tabs: SettingsTab[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    title,
    subtitle,
    breadcrumbs,
    tabs,
    activeTab,
    onTabChange,
    children
}) => {
    // Filter visible tabs
    const visibleTabs = tabs.filter(tab => tab.visible !== false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border bg-secondary/30 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground/40 shrink-0" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        to={crumb.href}
                                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 shrink-0">
                            <Settings className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight italic truncate">
                                {title}
                            </h1>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-0.5 sm:mt-1 truncate">
                                {subtitle || 'Configuration & Management'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6 sm:space-y-8">
                    {/* Tabs Navigation */}
                    <div className="border-b border-border overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="bg-transparent h-auto p-0 gap-4 sm:gap-8 min-w-max">
                            {visibleTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-12 sm:h-14 px-0 text-muted-foreground data-[state=active]:text-foreground font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all gap-2 sm:gap-2.5"
                                >
                                    <span className="opacity-50 group-data-[state=active]:opacity-100 scale-75 sm:scale-100">{tab.icon}</span>
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </Tabs>
            </div>
        </div>
    );
};
