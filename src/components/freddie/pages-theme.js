import { makePage } from './runtime.js';
import { PageHeader, Select } from '../content.js';
import { ThemeToggle } from '../theme-toggle.js';
import { applyAccent, getAccent, applyDensity, getDensity, onThemeChange } from '../../theme.js';
import { section } from './shared.js';

const ACCENTS = ['default', 'green', 'purple', 'mascot'];
const DENSITIES = ['compact', 'comfortable', 'spacious'];

export const themePage = makePage((ctx) => {
    const unsubscribe = onThemeChange(() => ctx.rerender());
    ctx.onCleanup(unsubscribe);
    return () => {
        const accent = getAccent() || 'default';
        const density = getDensity() || 'compact';
        return [
            PageHeader({ title: 'theme', lede: 'appearance preferences' }),
            section('theme', ThemeToggle()),
            section('accent', Select({
                label: 'accent', value: accent, options: ACCENTS,
                onChange: (v) => applyAccent(v === 'default' ? null : v),
            })),
            section('density', Select({
                label: 'density', value: density, options: DENSITIES,
                onChange: (v) => applyDensity(v),
            })),
        ];
    };
});
