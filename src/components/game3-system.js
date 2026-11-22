import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3SystemLine({ name = '', text = '', time = '', fullTime = '', onWave, key } = {}) {
    return h('div', { key, class: 'ds-g3-msg ds-g3-ln ds-g3-sys' },
        h('div', { class: 'ds-g3-sysav', 'aria-hidden': 'true' }, '→'),
        h('div', { class: 'ds-g3-sysbody' },
            h('div', { class: 'ds-g3-systx' }, h('b', {}, name), ' ' + text + ' ', h('span', { class: 'ds-g3-syswhen', title: fullTime }, time)),
            onWave ? h('span', { class: 'ds-g3-wave', role: 'button', tabindex: '0', onclick: () => onWave() }, '👋 Wave to say hi!') : null));
}
