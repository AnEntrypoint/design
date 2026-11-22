import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3Welcome({ name = '', glyph = 'hash', hint = false, key } = {}) {
    return h('div', { key, class: 'ds-g3-welcome' },
        h('div', { class: 'ds-g3-welcome-big' }, Icon(glyph, { size: 42 })),
        h('h1', {}, 'Welcome to #' + name + '!'),
        h('p', {}, 'This is the start of the #' + name + ' channel.',
            ...(hint ? [' Try ', h('b', {}, '/help'), ' or say hi to ', h('b', {}, '@MustardBot'), '.'] : [])));
}

export function Game3DmWelcome({ name = '', initial = '?', color = 'var(--accent)', key } = {}) {
    return h('div', { key, class: 'ds-g3-welcome' },
        h('div', { class: 'ds-g3-dmav ds-g3-dmav-big', style: '--ds-g3-av-color:' + color }, initial),
        h('h1', {}, name),
        h('p', {}, 'This is the beginning of your direct message history with ', h('b', {}, name), '. Direct messages are end-to-end encrypted.'));
}
