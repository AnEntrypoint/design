import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3SplitColumn({ name = '', messages = [], onMain, onClose, onSend, key } = {}) {
    return h('div', { key, class: 'ds-g3-splitc' },
        h('div', { class: 'ds-g3-sph' },
            h('span', null, '# ' + name),
            h('span', null,
                h('b', { role: 'button', tabindex: '0', title: 'make this the main channel', onclick: () => onMain && onMain() }, '\u21f1'),
                h('b', { role: 'button', tabindex: '0', title: 'close split', onclick: () => onClose && onClose() }, '\u2715'))),
        h('div', { class: 'ds-g3-spl' },
            messages.length
                ? messages.slice().reverse().map((m) => h('div', { key: m.id, class: 'ds-g3-sl' },
                    h('span', { class: 'ds-g3-sl-when' }, m.time || ''),
                    ' ',
                    h('b', null, m.name || ''),
                    ' ',
                    m.content))
                : h('div', { class: 'ds-g3-empty' }, 'nothing here yet')),
        onSend ? h('input', { class: 'ds-g3-spin', maxlength: '200', placeholder: 'Message #' + name, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter' && e.currentTarget.value.trim()) { onSend(e.currentTarget.value); e.currentTarget.value = ''; } } }) : null);
}

export function Game3SplitSelect({ options = [], current = null, onChange, key } = {}) {
    return h('select', { key, class: 'ds-g3-splitsel', title: 'Split view: open a second channel beside this one', onchange: (e) => onChange && onChange(e.target.value || null) },
        h('option', { value: '' }, '⧉ Split'),
        options.map((c) => h('option', { key: c.id, value: c.id, selected: current === c.id }, '#' + c.name)));
}
