
import * as webjsx from '../../../vendor/webjsx/index.js';
import { ServerRail, ChannelSidebar } from './navigation.js';
import { MemberList, VoiceStrip } from './presence.js';
const h = webjsx.createElement;

export function CommunityShell({ serverRailProps, sidebarProps, children, memberListProps, voiceStripProps } = {}) {
    return h('div', { class: 'cm-shell' },
        h('a', { href: '#app-main', class: 'skip-link' }, 'skip to main content'),
        serverRailProps ? ServerRail(serverRailProps) : null,
        sidebarProps ? ChannelSidebar(sidebarProps) : null,
        h('main', { class: 'cm-main', id: 'app-main', tabindex: '0' }, ...(Array.isArray(children) ? children : [children])),
        memberListProps ? MemberList(memberListProps) : null,
        voiceStripProps ? VoiceStrip(voiceStripProps) : null
    );
}
