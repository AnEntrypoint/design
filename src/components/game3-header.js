import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
const h = webjsx.createElement;

export function GameHeader({ channelName = '', channelType = 'text', topic = '', memberListOpen = false, onMembers, pinsOpen = false, onPins, buttons = [], trailing = [], key } = {}) {
    return h('header', { key, class: 'ds-g3-header' },
        h('span', { key: 'g', class: 'ds-g3-header-glyph', 'aria-hidden': 'true' }, Icon(channelType === 'voice' ? 'speaker' : 'hash', { size: 24 })),
        h('h2', { key: 'n', class: 'ds-g3-header-name' }, channelName),
        topic ? h('span', { key: 't', class: 'ds-g3-header-topic' }, topic) : null,
        h('div', { key: 'a', class: 'ds-g3-header-actions' },
            ...buttons,
            onPins ? h('button', { key: 'p', type: 'button', class: 'ds-g3-ibtn' + (pinsOpen ? ' on' : ''), title: 'Pinned Messages', 'aria-label': 'Pinned Messages', 'aria-pressed': pinsOpen ? 'true' : 'false', onclick: onPins }, Icon('ref-pins', { size: 24 })) : null,
            onMembers ? h('button', { key: 'm', type: 'button', class: 'ds-g3-ibtn' + (memberListOpen ? ' on' : ''), title: 'Member List', 'aria-label': 'Member List', 'aria-pressed': memberListOpen ? 'true' : 'false', onclick: onMembers }, Icon('ref-members', { size: 24 })) : null,
            ...trailing
        )
    );
}
