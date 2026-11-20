import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3PrefsPanel({ compact = false, toggles = [], onToggle, onCompact } = {}) {
    return h('div', { class: 'ds-g3-prefs-list' },
        h('h2', { class: 'ds-g3-prefs-h' }, 'Message Display'),
        h('div', { class: 'ds-g3-radio' + (!compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': !compact ? 'true' : 'false', onclick: () => onCompact && onCompact(false) },
            h('i', { class: 'ds-g3-radio-dot', 'aria-hidden': 'true' }),
            'Cozy: modern, beautiful, and easy on your eyes.'),
        h('div', { class: 'ds-g3-radio' + (compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': compact ? 'true' : 'false', onclick: () => onCompact && onCompact(true) },
            h('i', { class: 'ds-g3-radio-dot', 'aria-hidden': 'true' }),
            'Compact: fit more messages on screen at one time.'),
        toggles.map((t) => h('div', { key: t.key, class: 'ds-g3-prow' },
            h('div', { class: 'ds-g3-prow-text' },
                h('div', { class: 'ds-g3-prow-label' }, t.label),
                h('div', { class: 'ds-g3-prow-hint' }, t.hint)),
            h('button', { type: 'button', role: 'switch', class: 'ds-g3-switch' + (t.checked ? ' on' : ''), 'aria-checked': t.checked ? 'true' : 'false', 'aria-label': t.label, onclick: () => onToggle && onToggle(t.key, !t.checked) }, h('i', { class: 'ds-g3-switch-knob', 'aria-hidden': 'true' })))));
}
