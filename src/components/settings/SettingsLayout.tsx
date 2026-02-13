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
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-4">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        to={crumb.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-sm text-white font-medium">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                            <Settings className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tight slice-text">
                                {title}
                            </h1>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-black mt-0.5">
                                {subtitle || 'Configuration & Management'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
                    {/* Tabs Navigation */}
                    <div className="border-b border-white/10">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                            {visibleTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent rounded-none h-12 px-0 text-slate-500 data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all gap-2"
                                >
                                    {tab.icon}
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Tab Content */}
                    {children}
                </Tabs>
            </div>
        </div>
    );
};
