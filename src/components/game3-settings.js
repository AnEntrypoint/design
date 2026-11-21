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

const toggleRow = (t, onToggle) => h('div', { key: t.key, class: 'ds-g3-tgl' + (t.checked ? ' on' : ''), role: 'switch', tabindex: '0', 'aria-checked': t.checked ? 'true' : 'false', 'aria-label': t.label, onclick: () => onToggle && onToggle(t.key, !t.checked) },
    h('div', null,
        h('div', { class: 'ds-g3-tgl-label' }, t.label),
        t.hint ? h('div', { class: 'ds-g3-hint' }, t.hint) : null),
    h('div', { class: 'ds-g3-sw2', 'aria-hidden': 'true' }));

export function Game3SettingsPanel({ tab = 'appearance', onTab, compact = false, toggles = [], keywords = '', banner = '', onToggle, onCompact, onKeywords, onBanner, onReset, onClose } = {}) {
    const group = (g) => toggles.filter((t) => t.group === g).map((t) => toggleRow(t, onToggle));
    const pane = {
        appearance: () => [
            h('h2', { key: 'h' }, 'Appearance'),
            h('h6', { key: 'md' }, 'Message Display'),
            h('div', { key: 'cz', class: 'ds-g3-radio' + (!compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': !compact ? 'true' : 'false', onclick: () => onCompact && onCompact(false) },
                h('i', { 'aria-hidden': 'true' }), 'Cozy: modern, beautiful, and easy on your eyes.'),
            h('div', { key: 'cp', class: 'ds-g3-radio' + (compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': compact ? 'true' : 'false', onclick: () => onCompact && onCompact(true) },
                h('i', { 'aria-hidden': 'true' }), 'Compact: fit more messages on screen at one time.'),
            h('h6', { key: 'bc' }, 'Banner Colour'),
            h('div', { key: 'sw', class: 'ds-g3-swatches' }, ['', ...SWATCHES].map((c) => h('i', { key: 'c' + c, title: c || 'automatic', class: (banner || '') === c ? 'on' : '', style: 'background:' + (c || '#80848e'), role: 'button', tabindex: '0', onclick: () => onBanner && onBanner(c) }))),
        ],
        voice: () => [h('h2', { key: 'h' }, 'Voice & Audio'), ...group('voice')],
        notif: () => [
            h('h2', { key: 'h' }, 'Notifications'),
            ...group('notif'),
            h('h6', { key: 'ka' }, 'Keyword Alerts'),
            h('input', { key: 'kw', class: 'ds-g3-fi', maxlength: '200', placeholder: 'tournament, pizza, my nickname', value: keywords, onchange: (e) => onKeywords && onKeywords(e.target.value) }),
            h('p', { key: 'kh', class: 'ds-g3-hint' }, 'words that ping you, light up and land in your Inbox like an @mention, even in muted channels'),
        ],
        lang: () => [h('h2', { key: 'h' }, 'Language & Time'), h('h6', { key: 't' }, 'Time'), ...group('lang')],
        adv: () => [
            h('h2', { key: 'h' }, 'Advanced'),
            ...group('adv'),
            h('h6', { key: 'r' }, 'Reset'),
            h('div', { key: 'rb', class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: (e) => { const b = e.currentTarget; if (b.dataset.sure) { onReset && onReset(); b.dataset.sure = ''; b.textContent = 'Reset all settings'; } else { b.dataset.sure = '1'; b.textContent = 'press again to reset every setting'; } } }, 'Reset all settings'),
        ],
    };
    return h('div', { class: 'ds-g3-set', role: 'dialog', 'aria-label': 'settings' },
        h('div', { class: 'ds-g3-set-nav' },
            h('div', null,
                h('h5', null, 'App Settings'),
                TABS.map(([k, n]) => h('p', { key: k, class: k === tab ? 'on' : '', role: 'button', tabindex: '0', onclick: () => onTab && onTab(k) }, n)))),
        h('div', { class: 'ds-g3-set-pane' }, (pane[tab] || pane.appearance)()),
        h('div', { class: 'ds-g3-set-close', role: 'button', tabindex: '0', 'aria-label': 'close settings', onclick: () => onClose && onClose() }, '✕'));
}
