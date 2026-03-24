import { create } from 'zustand';
import { applyThemeMode, applyThemeTemplate } from '@/lib/themeEngine';
import { DEFAULT_THEME_TEMPLATE_ID, type ThemeMode } from '@/lib/themeTemplates';

const THEME_TEMPLATE_STORAGE_KEY = 'cronos_theme_template_id';
const THEME_MODE_STORAGE_KEY = 'cronos_theme_mode';

interface ThemeState {
    selectedTemplateId: string;
    mode: ThemeMode;
    setTemplate: (templateId: string) => void;
    setMode: (mode: ThemeMode) => void;
    initializeTheme: () => void;
}

const getStoredTemplateId = () => {
    if (typeof window === 'undefined') return DEFAULT_THEME_TEMPLATE_ID;
    return localStorage.getItem(THEME_TEMPLATE_STORAGE_KEY) || DEFAULT_THEME_TEMPLATE_ID;
};

const getStoredMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'dark';
    const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    // Explicitly default to dark if no valid stored mode exists
    if (!storedMode || (storedMode !== 'light' && storedMode !== 'dark')) {
        return 'dark';
    }
    return storedMode as ThemeMode;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    selectedTemplateId: getStoredTemplateId(),
    mode: getStoredMode(),

    setTemplate: (templateId: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_TEMPLATE_STORAGE_KEY, templateId);
        }
        set({ selectedTemplateId: templateId });
        applyThemeTemplate(templateId);
        applyThemeMode(get().mode);
    },

    setMode: (mode: ThemeMode) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
        }
        set({ mode });
        applyThemeMode(mode);
    },

    initializeTheme: () => {
        const selectedTemplateId = getStoredTemplateId();
        const mode = getStoredMode();

        set({ selectedTemplateId, mode });
        applyThemeTemplate(selectedTemplateId);
        applyThemeMode(mode);
    }
}));
