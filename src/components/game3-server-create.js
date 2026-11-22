import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export const SERVER_CREATE_COLORS = ['#5865f2', '#eb459e', '#57f287', '#f0b232', '#ed4245', '#1abc9c', '#c4602f', '#9b84ee'];

const ini = (nm) => (String(nm || '?').trim().split(/\s+/).map((w) => [...w][0]).join('').slice(0, 3).toUpperCase() || '?');

const pickColour = (e) => {
    const row = e.currentTarget.parentNode;
    row.querySelectorAll('span').forEach((x) => x.classList.remove('on'));
    e.currentTarget.classList.add('on');
};

export function Game3ServerCreate({ homeName = '', userName = 'You', colors = SERVER_CREATE_COLORS, onCreate, onClose, onDiscover } = {}) {
    const close = () => { if (onClose) onClose(); };
    const submit = (e) => {
        const form = e.currentTarget.closest('.ds-g3-sform');
        const input = form.querySelector('input');
        const on = form.querySelector('.ds-g3-icons .on');
        const name = input.value.trim() || input.placeholder;
        if (onCreate) onCreate({ name, color: on ? on.getAttribute('data-c') : colors[0] });
    };
    const placeholder = userName + "'s server";
    return h('div', {
        class: 'ds-g3-scrim',
        onclick: (e) => { if (e.target === e.currentTarget) close(); },
        onkeydown: (e) => { if (e.key === 'Escape') close(); },
    },
        h('div', { class: 'ds-g3-evm', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Create a server' },
            h('div', { class: 'ds-g3-evh' },
                h('b', null, 'Create a server'),
                h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close', onclick: close }, '✕')),
            h('div', { class: 'ds-g3-evl ds-g3-sform' },
                h('p', { class: 'ds-g3-sub' }, 'your server, your channels. everyone in ' + homeName + ' can find it under Discover and join.'),
                h('div', { class: 'ds-g3-lbl' }, 'Colour'),
                h('div', { class: 'ds-g3-icons' }, colors.map((c, i) => h('span', {
                    key: c,
                    class: i === 0 ? 'on' : '',
                    'data-c': c,
                    style: 'background:' + c,
                    role: 'button',
                    tabindex: '0',
                    onclick: pickColour,
                }, ini(userName + 's server')))),
                h('div', { class: 'ds-g3-lbl' }, 'Server Name'),
                h('input', {
                    id: 'ds-g3-sname',
                    maxlength: '32',
                    placeholder,
                    onkeydown: (e) => { if (e.key === 'Enter') submit(e); },
                }),
                h('div', { class: 'ds-g3-evb ds-g3-evb-on ds-g3-evb-big', role: 'button', tabindex: '0', onclick: submit }, 'Create'),
                h('div', { class: 'ds-g3-evb ds-g3-evb-big ds-g3-evb-link', role: 'button', tabindex: '0', onclick: onDiscover || null }, 'or join one: 🧭 Discover'))));
}
