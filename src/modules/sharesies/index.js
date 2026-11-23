import { registerModule } from '../registry.js';
import { seedFromContent, sessionIdFor } from './seed.js';
import { SharesiesCard, SharesiesPanel, SharesiesShare, SharesiesRail } from './views.js';

const state = (s) => s.sharesies || { sessions: [], activeId: '', share: null, targets: [] };

registerModule({
    id: 'sharesies-card', kind: 'messageKind',
    messageKind: {
        id: 'sharesies-card',
        match: (m) => !!seedFromContent(m.content),
        mount: ({ m, s, A, key }) => {
            const seed = seedFromContent(m.content);
            const id = sessionIdFor(seed);
            const sh = state(s);
            const name = (A.resolveProfile && A.resolveProfile(m.userId)) || m.username || 'User';
            const time = m.timestamp ? new Date(m.timestamp).toLocaleString([], { hour: 'numeric', minute: '2-digit' }) : '';
            return SharesiesCard({ key, seed: { id }, sessions: sh.sessions, name, time, avatarId: m.userId, onJoin: () => A.sharesiesJoin && A.sharesiesJoin(seed), onOpen: () => A.sharesiesOpen && A.sharesiesOpen(id), onLeave: () => A.sharesiesLeave && A.sharesiesLeave(id) });
        },
    },
});

registerModule({
    id: 'sharesies-panel', kind: 'popover',
    popover: {
        id: 'sharesies-panel',
        close: ({ s, A }) => { if (state(s).activeId) A.sharesiesClosePanel(); },
        mount: ({ s, A }) => {
            const sh = state(s);
            const session = sh.sessions.find((x) => x.id === sh.activeId);
            return session ? SharesiesPanel({ session, onClose: () => A.sharesiesClosePanel(), onLeave: () => A.sharesiesLeave(session.id) }) : null;
        },
    },
});

registerModule({
    id: 'sharesies-share', kind: 'popover',
    popover: {
        id: 'sharesies-share',
        close: ({ s, A }) => { if (state(s).share) A.sharesiesShareClose(); },
        mount: ({ s, A, render }) => {
            const sh = state(s);
            if (!sh.share) return null;
            const session = sh.share.watching ? sh.sessions.find((x) => x.id === sh.share.watching) : null;
            return SharesiesShare({ share: sh.share, targets: sh.targets, session, acts: {
                onClose: () => A.sharesiesShareClose(), onGenerate: (app) => A.sharesiesShareGenerate(app), onPost: (t) => A.sharesiesSharePost(t), onWatch: () => A.sharesiesShareWatch(),
                onCopy: (text) => A.accountCopyText && A.accountCopyText(text, 'Command copied'),
                onTarget: (t) => { sh.share.target = t; render(); },
            } });
        },
    },
});

registerModule({
    id: 'sharesies-rail', kind: 'railSection',
    railSection: {
        id: 'sharesies-rail', order: 50,
        mount: ({ s, A }) => SharesiesRail({ sessions: state(s).sessions, onShare: () => A.sharesiesShareOpen(), onOpen: (id) => A.sharesiesOpen(id), onLeave: (id) => A.sharesiesLeave(id) }),
    },
});
