import * as webjsx from '../../vendor/webjsx/index.js';
import { CatchUpButton } from './game3-room.js';
const h = webjsx.createElement;

export function GameHeader({ brand = '', serverName = '', channelName = '', channelType = 'text', topic = '', unread = 0, memberListOpen = false, onCatchUp, onMembers, buttons = [], key } = {}) {
    return h('header', { key, class: 'ds-g3-header' },
        h('div', { key: 'c', class: 'ds-g3-header-channel' },
            brand ? h('span', { key: 'b', class: 'ds-g3-header-brand' }, brand) : null,
            serverName ? h('span', { key: 's', class: 'ds-g3-header-server' }, serverName) : null,
            h('span', { key: 'g', class: 'ds-g3-header-glyph', 'aria-hidden': 'true' }, channelType === 'voice' ? 'voice' : '#'),
            h('h2', { key: 'n', class: 'ds-g3-header-name' }, channelName),
            topic ? h('span', { key: 't', class: 'ds-g3-header-topic' }, topic) : null
        ),
        h('div', { key: 'a', class: 'ds-g3-header-actions' },
            unread > 0 && onCatchUp ? CatchUpButton({ key: 'cu', count: unread, onClick: onCatchUp }) : null,
            ...buttons,
            onMembers ? h('button', { key: 'm', type: 'button', class: 'ds-g3-btn' + (memberListOpen ? ' is-on' : ''), 'aria-pressed': memberListOpen ? 'true' : 'false', onclick: onMembers }, 'members') : null
        )
    );
}
