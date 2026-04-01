import {
    DEFAULT_THEME_TEMPLATE_ID,
    type ThemeMode,
    type ThemeTokenSet,
    getThemeTemplateById
} from '@/lib/themeTemplates';

const THEME_STYLE_TAG_ID = 'cronos-theme-template-overrides';

const toCssVariables = (tokens: ThemeTokenSet) => {
    return [
        `--background: ${tokens.background};`,
        `--foreground: ${tokens.foreground};`,
        `--card: ${tokens.card};`,
        `--card-foreground: ${tokens.cardForeground};`,
        `--popover: ${tokens.popover};`,
        `--popover-foreground: ${tokens.popoverForeground};`,
        `--primary: ${tokens.primary};`,
        `--primary-foreground: ${tokens.primaryForeground};`,
        `--secondary: ${tokens.secondary};`,
        `--secondary-foreground: ${tokens.secondaryForeground};`,
        `--muted: ${tokens.muted};`,
        `--muted-foreground: ${tokens.mutedForeground};`,
        `--accent: ${tokens.accent};`,
        `--accent-foreground: ${tokens.accentForeground};`,
        `--destructive: ${tokens.destructive};`,
        `--destructive-foreground: ${tokens.destructiveForeground};`,
        `--border: ${tokens.border};`,
        `--input: ${tokens.input};`,
        `--ring: ${tokens.ring};`,
        `--app-shell-bg: ${tokens.background};`,
        `--app-sidebar-bg: ${tokens.card};`,
        `--app-header-bg: ${tokens.card};`,
        `--body-gradient-one: hsl(${tokens.primary} / 0.12);`,
        `--body-gradient-two: hsl(${tokens.ring} / 0.08);`
    ].join(' ');
};

const ensureThemeStyleTag = () => {
    let tag = document.getElementById(THEME_STYLE_TAG_ID) as HTMLStyleElement | null;
    if (!tag) {
        tag = document.createElement('style');
        tag.id = THEME_STYLE_TAG_ID;
        document.head.appendChild(tag);
    }
    return tag;
};

export const applyThemeTemplate = (templateId: string = DEFAULT_THEME_TEMPLATE_ID) => {
    if (typeof document === 'undefined') return;

    const template = getThemeTemplateById(templateId);
    const darkCss = toCssVariables(template.tokens.dark);
    const lightCss = toCssVariables(template.tokens.light);

    const styleTag = ensureThemeStyleTag();
    styleTag.textContent = `:root { ${darkCss} } .light { ${lightCss} }`;
};

export const applyThemeMode = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'light') {
        root.classList.add('light');
        return;
    }
    root.classList.remove('light');
};
