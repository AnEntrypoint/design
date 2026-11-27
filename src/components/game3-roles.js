import * as webjsx from '../../vendor/webjsx/index.js';

import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3RolesPanel({ roles = [], onToggle, onDone, key } = {}) {
    return h('div', { key, class: 'ds-g3-rolepick' },
        h('div', { class: 'ds-g3-rhero' },
            h('div', { class: 'ds-g3-ric', 'aria-hidden': 'true', style: 'background:#5865f2' }, Icon('ref-roles', { size: 24 })),
            h('div', null,
                h('h1', null, 'Pick your roles'),
                h('p', null, 'press to add or take one off. your first role colours your name for everyone.'))),
        h('div', { class: 'ds-g3-rgrid' },
            roles.map((r) => h('div', { key: r.id, class: 'ds-g3-rcard' + (r.on ? ' on' : ''), role: 'button', tabindex: '0', 'aria-pressed': r.on ? 'true' : 'false', style: '--rc:' + r.color, onclick: () => onToggle && onToggle(r.id) },
                h('div', { class: 'ds-g3-re', style: 'color:' + r.color, 'aria-hidden': 'true' }, Icon('ref-roles', { size: 24 })),
                h('div', { class: 'ds-g3-rtxt' },
                    h('b', { style: 'color:' + r.color }, r.name),
                    h('p', null, r.d + ' · ' + (r.online || 0) + ' online')),
                h('div', { class: 'ds-g3-chk', 'aria-hidden': 'true' }, r.on ? '✓' : '')))),
        h('div', { class: 'ds-g3-cta', role: 'button', tabindex: '0', onclick: () => onDone && onDone() }, 'Done, take me to #general →'));
}
