import { registerModule } from '../registry.js';
import { STICKERS, STICKER_RE } from '../../game3-data.js';

const stickerFor = (m) => {
    const hit = STICKER_RE.exec(m.content || '');
    return hit ? STICKERS.find((x) => x.id === hit[1]) || null : null;
};

registerModule({
    id: 'message-poll', kind: 'messageKind',
    messageKind: {
        id: 'poll',
        match: (m) => !!m.poll,
        props: ({ m, A }) => ({ poll: { ...m.poll, onVote: (i) => A.votePoll && A.votePoll(m.poll.id, i) } }),
    },
});

registerModule({
    id: 'message-invite', kind: 'messageKind',
    messageKind: {
        id: 'invite',
        match: (m) => !!m.invite,
        props: ({ m, A }) => ({ invite: { ...m.invite, onJoin: () => A.joinInvite && A.joinInvite(m.invite.serverId, m.invite.name, m.invite.color) } }),
    },
});

registerModule({
    id: 'message-sticker', kind: 'messageKind',
    messageKind: {
        id: 'sticker',
        match: (m) => !!stickerFor(m),
        props: ({ m, s }) => { const st = stickerFor(m); return { sticker: { url: (s.stickerBase || '') + st.id + '.webp', name: st.name } }; },
    },
});

registerModule({
    id: 'message-unfurl', kind: 'messageKind',
    messageKind: {
        id: 'unfurl',
        match: (m) => Array.isArray(m.previews) && m.previews.length > 0,
        props: ({ m }) => ({ unfurls: m.previews }),
    },
});
