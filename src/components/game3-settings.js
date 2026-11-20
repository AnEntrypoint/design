import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

const TABS = [
    ['appearance', 'Appearance'],
    ['voice', 'Voice & Audio'],
    ['notif', 'Notifications'],
    ['lang', 'Language & Time'],
    ['adv', 'Advanced'],
];

const SWATCHES = ['#5865f2', '#eb459e', '#9b84ee', '#1abc9c', '#f1c40f', '#57f287', '#2b2d31'];

const toggleRow = (t, onToggle) => h('div', { key: t.key, class: 'ds-g3-prow' },
    h('div', { class: 'ds-g3-prow-text' },
        h('div', { class: 'ds-g3-prow-label' }, t.label),
        h('div', { class: 'ds-g3-prow-hint' }, t.hint)),
    h('button', { type: 'button', role: 'switch', class: 'ds-g3-switch' + (t.checked ? ' on' : ''), 'aria-checked': t.checked ? 'true' : 'false', 'aria-label': t.label, onclick: () => onToggle && onToggle(t.key, !t.checked) }, h('i')));

export function Game3SettingsPanel({ tab = 'appearance', onTab, compact = false, toggles = [], keywords = '', banner = '', onToggle, onCompact, onKeywords, onBanner, onReset } = {}) {
    const group = (g) => toggles.filter((t) => t.group === g).map((t) => toggleRow(t, onToggle));
    const pane = {
        appearance: () => [
            h('h2', { key: 'h' }, 'Appearance'),
            h('h6', { key: 'md' }, 'Message Display'),
            h('div', { key: 'cz', class: 'ds-g3-radio' + (!compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': !compact ? 'true' : 'false', onclick: () => onCompact && onCompact(false) },
                h('i', { class: 'ds-g3-radio-dot', 'aria-hidden': 'true' }), 'Cozy: modern, beautiful, and easy on your eyes.'),
            h('div', { key: 'cp', class: 'ds-g3-radio' + (compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': compact ? 'true' : 'false', onclick: () => onCompact && onCompact(true) },
                h('i', { class: 'ds-g3-radio-dot', 'aria-hidden': 'true' }), 'Compact: fit more messages on screen at one time.'),
            h('h6', { key: 'bc' }, 'Banner Colour'),
            h('div', { key: 'sw', class: 'ds-g3-swatches' }, ['', ...SWATCHES].map((c) => h('i', { key: 'c' + c, title: c || 'automatic', class: 'ds-g3-swatch' + ((banner || '') === c ? ' on' : ''), style: 'background:' + (c || '#80848e'), role: 'button', tabindex: '0', onclick: () => onBanner && onBanner(c) }))),
        ],
        voice: () => [h('h2', { key: 'h' }, 'Voice & Audio'), ...group('voice')],
        notif: () => [
            h('h2', { key: 'h' }, 'Notifications'),
            ...group('notif'),
            h('h6', { key: 'ka' }, 'Keyword Alerts'),
            h('input', { key: 'kw', class: 'ds-g3-input', maxlength: '200', placeholder: 'tournament, pizza, my nickname', value: keywords, onchange: (e) => onKeywords && onKeywords(e.target.value) }),
            h('p', { key: 'kh', class: 'ds-g3-empty' }, 'words that ping you, light up and land in your Inbox like an @mention, even in muted channels'),
        ],
        lang: () => [h('h2', { key: 'h' }, 'Language & Time'), h('h6', { key: 't' }, 'Time'), ...group('lang')],
        adv: () => [
            h('h2', { key: 'h' }, 'Advanced'),
            ...group('adv'),
            h('h6', { key: 'r' }, 'Reset'),
            h('button', { key: 'rb', type: 'button', class: 'ds-g3-btn', onclick: (e) => { const b = e.currentTarget; if (b.dataset.sure) { onReset && onReset(); b.dataset.sure = ''; b.textContent = 'Reset all settings'; } else { b.dataset.sure = '1'; b.textContent = 'press again to reset every setting'; } } }, 'Reset all settings'),
        ],
    };
    return h('div', { class: 'ds-g3-settings' },
        h('nav', { class: 'ds-g3-settings-nav' },
            h('h5', null, 'App Settings'),
            TABS.map(([k, n]) => h('p', { key: k, class: 'ds-g3-settings-tab' + (k === tab ? ' on' : ''), role: 'button', tabindex: '0', onclick: () => onTab && onTab(k) }, n))),
        h('div', { class: 'ds-g3-settings-pane' }, (pane[tab] || pane.appearance)()));
}
