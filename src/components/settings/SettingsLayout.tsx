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
            <div className="border-b border-border bg-secondary/30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-6">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        to={crumb.href}
                                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Settings className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-black text-foreground uppercase tracking-tight italic">
                                {title}
                            </h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-1">
                                {subtitle || 'Configuration & Management'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
                    {/* Tabs Navigation */}
                    <div className="border-b border-border overflow-x-auto custom-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 gap-8 min-w-max">
                            {visibleTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-14 px-0 text-muted-foreground data-[state=active]:text-foreground font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all gap-2.5"
                                >
                                    <span className="opacity-50 group-data-[state=active]:opacity-100">{tab.icon}</span>
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
