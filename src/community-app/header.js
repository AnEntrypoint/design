import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from '../components/shell.js';
import { GameHeader } from '../components/game3-header.js';
import { channelIcon } from './rail.js';
import { Game3SplitSelect } from '../components/game3-split.js';

const h = webjsx.createElement;

export function createHeader(app) {
    const { A } = app;

    const headerView = (s, ch) => {
        return GameHeader({
            dm: !!(s.homeMode && s.activeDmPeer),
            onBurger: () => (s.mobileMenuOpen ? A.closeMobileMenu && A.closeMobileMenu() : A.openMobileMenu && A.openMobileMenu()),
            channelName: ch.name || 'general',
            channelIcon: channelIcon(ch),
            topic: ch.topic || '',
            memberListOpen: !!s.memberListOpen,
            onMembers: A.toggleMembers ? () => A.toggleMembers() : null,
            pinsOpen: s.gameSurface === 'pins',
            onPins: A.openSurface ? () => A.openSurface('pins') : null,
            trailing: [
                h('label', { key: 'srch', class: 'ds-g3-srch' }, h('input', { type: 'text', placeholder: 'Search', value: s.chatSearch || '', onkeydown: (e) => { if (e.key === 'Enter' && A.setChatSearch) A.setChatSearch(e.currentTarget.value); } }), Icon('ref-search', { size: 16 })),
                h('button', { key: 'inbox', type: 'button', class: 'ds-g3-ibtn' + (s.gameSurface === 'inbox' ? ' on' : ''), title: 'Inbox', 'aria-label': 'Inbox', onclick: () => A.openSurface && A.openSurface('inbox') }, Icon('ref-inbox', { size: 24 })),
            ],
            buttons: [
                s.splitOptions && s.splitOptions.length ? Game3SplitSelect({ key: 'split', options: s.splitOptions, current: s.splitChannel ? s.splitChannel.id : null, onChange: (id) => A.splitTo && A.splitTo(id) }) : null,
                h('button', { key: 'mute', type: 'button', class: 'ds-g3-ibtn' + (s.mutedChannel ? ' on' : ''), title: 'Mute Channel', 'aria-label': 'Mute Channel', 'aria-pressed': s.mutedChannel ? 'true' : 'false', onclick: () => A.toggleMuteChannel && A.toggleMuteChannel() }, Icon(s.mutedChannel ? 'ref-belloff' : 'ref-bell', { size: 24 })),
            ].filter(Boolean),
        });
    };

    return { headerView };
}
