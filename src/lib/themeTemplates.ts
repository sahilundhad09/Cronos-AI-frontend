export type ThemeMode = 'dark' | 'light';

export interface ThemeTokenSet {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
}

export interface ThemeTemplate {
    id: string;
    name: string;
    description: string;
    /** Four hex colors shown as a swatch preview strip */
    swatches: [string, string, string, string];
    tokens: Record<ThemeMode, ThemeTokenSet>;
}

export const THEME_TEMPLATES: ThemeTemplate[] = [

    // ── 1. Cronos Default ────────────────────────────────────────────────────
    {
        id: 'cronos-default',
        name: 'Cronos Default',
        description: 'Cyan-focused dark command center with clean light counterpart.',
        swatches: ['#06b6d4', '#0e7490', '#164e63', '#030c18'],
        tokens: {
            dark: {
                background:           '222 47% 4%',
                foreground:           '210 40% 98%',
                card:                 '222 47% 6%',
                cardForeground:       '210 40% 98%',
                popover:              '222 47% 4%',
                popoverForeground:    '210 40% 98%',
                primary:              '187 92% 43%',
                primaryForeground:    '222 47% 4%',
                secondary:            '217 33% 17%',
                secondaryForeground:  '210 40% 98%',
                muted:                '217 33% 17%',
                mutedForeground:      '0 0% 100%',
                accent:               '217 33% 17%',
                accentForeground:     '210 40% 98%',
                destructive:          '0 84% 60%',
                destructiveForeground:'210 40% 98%',
                border:               '217 33% 17%',
                input:                '217 33% 17%',
                ring:                 '187 92% 43%',
            },
            light: {
                background:           '210 20% 98%',
                foreground:           '222 47% 11%',
                card:                 '0 0% 100%',
                cardForeground:       '222 47% 11%',
                popover:              '0 0% 100%',
                popoverForeground:    '222 47% 11%',
                primary:              '190 92% 35%',
                primaryForeground:    '210 40% 98%',
                secondary:            '210 20% 93%',
                secondaryForeground:  '222 47% 11%',
                muted:                '210 20% 93%',
                mutedForeground:      '0 0% 0%',
                accent:               '210 20% 93%',
                accentForeground:     '222 47% 11%',
                destructive:          '0 72% 50%',
                destructiveForeground:'210 40% 98%',
                border:               '214 20% 86%',
                input:                '214 20% 86%',
                ring:                 '190 92% 35%',
            },
        },
    },

    // ── 2. Midnight Blue ─────────────────────────────────────────────────────
    {
        id: 'midnight-blue',
        name: 'Midnight Blue',
        description: 'Deep navy surfaces with electric blue highlights.',
        swatches: ['#38bdf8', '#0284c7', '#1e3a5f', '#040c1a'],
        tokens: {
            dark: {
                background:           '222 55% 6%',
                foreground:           '210 35% 97%',
                card:                 '221 50% 9%',
                cardForeground:       '210 35% 97%',
                popover:              '222 55% 6%',
                popoverForeground:    '210 35% 97%',
                primary:              '201 92% 55%',
                primaryForeground:    '222 55% 6%',
                secondary:            '220 30% 16%',
                secondaryForeground:  '210 35% 97%',
                muted:                '220 30% 16%',
                mutedForeground:      '0 0% 100%',
                accent:               '220 30% 16%',
                accentForeground:     '210 35% 97%',
                destructive:          '0 78% 58%',
                destructiveForeground:'210 35% 97%',
                border:               '220 30% 21%',
                input:                '220 30% 21%',
                ring:                 '201 92% 55%',
            },
            light: {
                background:           '210 35% 98%',
                foreground:           '222 45% 12%',
                card:                 '0 0% 100%',
                cardForeground:       '222 45% 12%',
                popover:              '0 0% 100%',
                popoverForeground:    '222 45% 12%',
                primary:              '203 89% 43%',
                primaryForeground:    '0 0% 100%',
                secondary:            '211 24% 93%',
                secondaryForeground:  '222 45% 12%',
                muted:                '211 24% 93%',
                mutedForeground:      '0 0% 0%',
                accent:               '211 24% 93%',
                accentForeground:     '222 45% 12%',
                destructive:          '0 72% 50%',
                destructiveForeground:'0 0% 100%',
                border:               '214 20% 86%',
                input:                '214 20% 86%',
                ring:                 '203 89% 43%',
            },
        },
    },

    // ── 3. Arctic Cyan ───────────────────────────────────────────────────────
    {
        id: 'arctic-cyan',
        name: 'Arctic Cyan',
        description: 'Cool cyan palette with high-clarity contrast.',
        swatches: ['#67e8f9', '#0891b2', '#155e75', '#030e14'],
        tokens: {
            dark: {
                background:           '208 48% 6%',
                foreground:           '195 28% 96%',
                card:                 '208 42% 9%',
                cardForeground:       '195 28% 96%',
                popover:              '208 48% 6%',
                popoverForeground:    '195 28% 96%',
                primary:              '186 90% 44%',
                primaryForeground:    '208 48% 6%',
                secondary:            '210 28% 17%',
                secondaryForeground:  '195 28% 96%',
                muted:                '210 28% 17%',
                mutedForeground:      '0 0% 100%',
                accent:               '210 28% 17%',
                accentForeground:     '195 28% 96%',
                destructive:          '0 78% 58%',
                destructiveForeground:'195 28% 96%',
                border:               '210 28% 21%',
                input:                '210 28% 21%',
                ring:                 '186 90% 44%',
            },
            light: {
                background:           '198 35% 98%',
                foreground:           '210 42% 12%',
                card:                 '0 0% 100%',
                cardForeground:       '210 42% 12%',
                popover:              '0 0% 100%',
                popoverForeground:    '210 42% 12%',
                primary:              '188 88% 36%',
                primaryForeground:    '0 0% 100%',
                secondary:            '199 24% 93%',
                secondaryForeground:  '210 42% 12%',
                muted:                '199 24% 93%',
                mutedForeground:      '0 0% 0%',
                accent:               '199 24% 93%',
                accentForeground:     '210 42% 12%',
                destructive:          '0 72% 50%',
                destructiveForeground:'0 0% 100%',
                border:               '201 18% 86%',
                input:                '201 18% 86%',
                ring:                 '188 88% 36%',
            },
        },
    },

    // ── 4. Oceanic Azure ─────────────────────────────────────────────────────
    {
        id: 'oceanic-azure',
        name: 'Oceanic Azure',
        description: 'Balanced marine blue palette with strong readability.',
        swatches: ['#60a5fa', '#2563eb', '#1e40af', '#030b1c'],
        tokens: {
            dark: {
                background:           '216 45% 7%',
                foreground:           '214 26% 96%',
                card:                 '216 42% 10%',
                cardForeground:       '214 26% 96%',
                popover:              '216 45% 7%',
                popoverForeground:    '214 26% 96%',
                primary:              '197 92% 49%',
                primaryForeground:    '216 45% 7%',
                secondary:            '216 24% 18%',
                secondaryForeground:  '214 26% 96%',
                muted:                '216 24% 18%',
                mutedForeground:      '0 0% 100%',
                accent:               '216 24% 18%',
                accentForeground:     '214 26% 96%',
                destructive:          '0 78% 58%',
                destructiveForeground:'214 26% 96%',
                border:               '216 24% 22%',
                input:                '216 24% 22%',
                ring:                 '197 92% 49%',
            },
            light: {
                background:           '212 32% 98%',
                foreground:           '216 46% 13%',
                card:                 '0 0% 100%',
                cardForeground:       '216 46% 13%',
                popover:              '0 0% 100%',
                popoverForeground:    '216 46% 13%',
                primary:              '200 90% 40%',
                primaryForeground:    '0 0% 100%',
                secondary:            '212 20% 93%',
                secondaryForeground:  '216 46% 13%',
                muted:                '212 20% 93%',
                mutedForeground:      '0 0% 0%',
                accent:               '212 20% 93%',
                accentForeground:     '216 46% 13%',
                destructive:          '0 72% 50%',
                destructiveForeground:'0 0% 100%',
                border:               '213 17% 86%',
                input:                '213 17% 86%',
                ring:                 '200 90% 40%',
            },
        },
    },

    // ── 5. Obsidian ──────────────────────────────────────────────────────────
    {
        id: 'obsidian',
        name: 'Obsidian',
        description: 'True-black brutalism. Contrast accents, zero decoration.',
        swatches: ['#f1f5f9', '#94a3b8', '#475569', '#000000'],
        tokens: {
            dark: {
                background:           '0 0% 2%',
                foreground:           '0 0% 96%',
                card:                 '0 0% 4%',
                cardForeground:       '0 0% 96%',
                popover:              '0 0% 2%',
                popoverForeground:    '0 0% 96%',
                primary:              '0 0% 88%',
                primaryForeground:    '0 0% 4%',
                secondary:            '0 0% 10%',
                secondaryForeground:  '0 0% 96%',
                muted:                '0 0% 10%',
                mutedForeground:      '0 0% 100%',
                accent:               '0 0% 10%',
                accentForeground:     '0 0% 96%',
                destructive:          '0 78% 56%',
                destructiveForeground:'0 0% 96%',
                border:               '0 0% 13%',
                input:                '0 0% 13%',
                ring:                 '0 0% 72%',
            },
            light: {
                background:           '0 0% 98%',
                foreground:           '0 0% 5%',
                card:                 '0 0% 100%',
                cardForeground:       '0 0% 5%',
                popover:              '0 0% 100%',
                popoverForeground:    '0 0% 5%',
                primary:              '0 0% 9%',
                primaryForeground:    '0 0% 98%',
                secondary:            '0 0% 93%',
                secondaryForeground:  '0 0% 5%',
                muted:                '0 0% 93%',
                mutedForeground:      '0 0% 0%',
                accent:               '0 0% 93%',
                accentForeground:     '0 0% 5%',
                destructive:          '0 72% 50%',
                destructiveForeground:'0 0% 100%',
                border:               '0 0% 86%',
                input:                '0 0% 86%',
                ring:                 '0 0% 18%',
            },
        },
    },

];

export const DEFAULT_THEME_TEMPLATE_ID = 'cronos-default';

export const getThemeTemplateById = (id: string): ThemeTemplate => {
    return THEME_TEMPLATES.find((t) => t.id === id) ?? THEME_TEMPLATES[0];
};