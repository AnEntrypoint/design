
import * as webjsx from '../../vendor/webjsx/index.js';
import { applyTheme, getTheme, resolvedTheme, onThemeChange } from '../theme.js';
import { Icon, iconMarkup } from './shell/icons.js';
import { attempt } from '../best-effort.js';

const h = webjsx.createElement;

const MODES = [
    ['auto',  'auto'],
    ['paper', 'light'],
    ['ink',   'dark'],
];

const ICON_FOR_MODE = { auto: 'contrast', paper: 'sun', ink: 'moon' };

function bindThemePaint(el, paint) {
    if (!el || el._dsThemeBound) return;
    el._dsThemeBound = true;
    paint();
    onThemeChange(paint);
}

export function ThemeToggle({ compact = false, onChange } = {}) {
    const current = getTheme();

    if (compact) {
        const wordFor = (t) => (t === 'auto' ? 'auto' : (t === 'ink' ? 'dark' : 'light'));
        const labelFor = (t) => 'theme: ' + wordFor(t);
        const titleFor = (t) => labelFor(t)
            + (t === 'auto' ? ' (currently ' + (resolvedTheme() === 'ink' ? 'dark' : 'light') + ')' : '')
            + ' — click to cycle';
        return h('button', {
            class: 'btn ds-theme-toggle',
            type: 'button',
            'aria-label': labelFor(current),
            title: titleFor(current),
            onclick: () => {
                const now = getTheme();
                const next = now === 'auto' ? 'paper' : (now === 'paper' ? 'ink' : 'auto');
                applyTheme(next);
                if (onChange) attempt(() => { onChange(next); });
            },
            ref: (el) => bindThemePaint(el, () => {
                const now = getTheme();
                el.setAttribute('aria-label', labelFor(now));
                el.setAttribute('title', titleFor(now));
                const lab = el.querySelector('.ds-theme-toggle-label');
                if (lab) lab.textContent = labelFor(now);
                const disc = el.querySelector('.ds-theme-disc');
                if (disc) disc.setAttribute('data-mode', now);
                const icon = el.querySelector('.ds-theme-toggle-icon');
                if (icon) icon.innerHTML = iconMarkup(ICON_FOR_MODE[now] || 'contrast', { size: 14 });
            })
        },
        h('span', { class: 'ds-theme-disc', 'data-mode': current, 'aria-hidden': 'true' }),
        h('span', { class: 'ds-theme-toggle-icon' }, Icon(ICON_FOR_MODE[current] || 'contrast', { size: 14 })),
        h('span', { class: 'ds-theme-toggle-label' }, labelFor(current)));
    }

    return h('div', {
        class: 'ds-theme-toggle ds-segmented',
        role: 'radiogroup',
        'aria-label': 'theme',
        ref: (el) => bindThemePaint(el, () => {
            const now = getTheme();
            for (const btn of el.querySelectorAll('.ds-seg-btn')) {
                const on = btn.dataset.mode === now;
                btn.classList.toggle('is-on', on);
                btn.setAttribute('aria-checked', on ? 'true' : 'false');
            }
        })
    }, ...MODES.map(([mode, label]) =>
        h('button', {
            key: mode,
            type: 'button',
            role: 'radio',
            'data-mode': mode,
            'aria-checked': current === mode ? 'true' : 'false',
            class: 'ds-seg-btn' + (current === mode ? ' is-on' : ''),
            onclick: () => {
                applyTheme(mode);
                if (onChange) attempt(() => { onChange(mode); });
            }
        }, label)
    ));
}
