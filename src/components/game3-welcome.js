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
