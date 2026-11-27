import * as webjsx from '../../vendor/webjsx/index.js';
import { Chat } from '../components/chat.js';
import { ReplyBar } from '../components/community.js';
import { channelType } from '../modules/index.js';
import { game3AvatarBg } from '../components/game3-hue.js';
import { Game3Welcome, Game3DmWelcome } from '../components/game3-welcome.js';
import { stickerText } from '../game3-data.js';
import { Game3Composer } from '../components/game3-composer.js';

const h = webjsx.createElement;

export function createChatView(app, { messages, rail }) {
    const { root, get, A, initial, formatTime, st } = app;
    const render = () => app.render();
    const { mapMessages, withDividers, game3Rows, game3NewBar, mentionNames } = messages;
    const { railOrder } = rail;

    const composerKey = (e, ta, s, ch) => {
        if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            const order = railOrder(s);
            const idx = order.findIndex(c => c.id === ch.id);
            const next = order[(idx + (e.key === 'ArrowUp' ? -1 : 1) + order.length) % order.length];
            if (next && A.switchChannel) { e.preventDefault(); A.switchChannel(next); }
            return;
        }
        if (e.key === 'ArrowUp' && !ta.value && A.setInput) {
            const mine = (s.messages || []).filter(m => String(m.userId) === String(s.userId));
            const last = mine[mine.length - 1];
            if (last) { e.preventDefault(); A.setInput(last.content || ''); }
        }
    };

    const dropStage = () => { if (st.stage && st.stage.url) URL.revokeObjectURL(st.stage.url); st.stage = null; };
    const stageFiles = (files) => {
        const f = files && files[0];
        if (!f) return;
        dropStage();
        const kb = Math.max(1, Math.round(f.size / 1024));
        st.stage = { file: f, name: f.name, size: kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB', url: f.type.indexOf('image/') === 0 ? URL.createObjectURL(f) : '', busy: false };
        render();
    };
    st.stageFiles = stageFiles;
    st.stageCancel = () => { dropStage(); render(); };
    const sendStage = () => {
        const g = st.stage;
        if (!g || g.busy || !A.attachFiles) return;
        g.busy = true;
        render();
        Promise.resolve(A.attachFiles([g.file])).then(() => { if (st.stage === g) dropStage(); render(); }, () => { if (st.stage === g) { g.busy = false; render(); } });
    };

    const chatView = (s) => {
        const ch = s.currentChannel || {};
        const sub = s.homeMode ? 'encrypted' : channelType(ch.type).headerSub;
        const rt = s.replyTarget;
        const replyPreview = rt ? ReplyBar({
            quotedAuthor: rt.username || 'User', quotedMessage: rt.content || '',
            onCancel: (e) => { e && e.preventDefault && e.preventDefault(); A.cancelReply && A.cancelReply(); },
        }) : null;
        const locked = !!s.composerLockedReason;
        const emptySub = s.homeMode
            ? 'Pick a conversation on the left, or start one with +.'
            : 'Be the first to post in #' + (ch.name || 'general') + '.';
        const typingUsers = s.typingUsers || [];
        const typingText = typingUsers.length === 0 ? '' : typingUsers.length === 1 ? typingUsers[0] + ' is typing\u2026' : typingUsers.length === 2 ? typingUsers[0] + ' and ' + typingUsers[1] + ' are typing\u2026' : 'Several people are typing\u2026';
        return Chat({
            title: ch.name || 'general', sub, locked, emptySub, messages: mapMessages(s), rows: [game3NewBar(s)].filter(Boolean).concat((s.homeMode && s.activeDmPeer ? [Game3DmWelcome({ key: 'dmwelcome', name: ch.name || '', initial: initial(ch.name || ''), color: game3AvatarBg(ch.name || '') })] : s.homeMode || s.chatSearch ? [] : [Game3Welcome({ key: 'welcome', name: ch.name || 'general', glyph: channelType(ch.type).welcomeGlyph || 'hash', hint: ch.name === 'general' })]).concat(withDividers(s, game3Rows(s)))), header: null,
            composer: h('div', { class: 'cm-composer-wrap' }, Game3Composer({ nope: s.composerLockedNope ? 'You do not have permission to send messages in this channel.' : '', mentions: mentionNames(s), stickersAvailable: !!s.stickerBase && !s.composerLockedReason, stickerPop: st.stickersOpen && !!s.stickerBase, stickerBase: s.stickerBase || '', stickerTitle: (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || 'Zellous'), onStickers: s.homeMode ? null : () => { st.stickersOpen = !st.stickersOpen; st.emojisOpen = false; render(); }, onStickerPick: (id) => { st.stickersOpen = false; if (A.send) A.send(stickerText(id)); render(); }, typing: typingText,
                value: s.chatInputValue || '',
                placeholder: s.composerLockedReason ? s.composerLockedReason : (s.homeMode ? 'Message @' + (ch.name || 'someone') : 'Message #' + (ch.name || 'general')),
                replyTo: rt ? { username: rt.username || 'User' } : null,
                onCancelReply: () => A.startReply && A.startReply(null),
                onInput: (v) => A.setInput && A.setInput(v),
                onSend: (v) => { const t = (v || '').trim(); if (t) A.send && A.send(t, rt ? { replyTo: rt } : undefined); },
                maxLength: 190,
                onKeyDown: (e, ta) => composerKey(e, ta, s, ch),
                onAttach: (!s.homeMode && !s.composerLockedReason && A.attachFiles) ? stageFiles : null,
                onPasteFiles: (!s.homeMode && !s.composerLockedReason && A.attachFiles) ? stageFiles : null,
                stage: st.stage || null,
                onStageSend: sendStage,
                onStageCancel: () => { dropStage(); render(); },
                onEmoji: () => { st.emojisOpen = !st.emojisOpen; st.stickersOpen = false; render(); },
                emojiPop: st.emojisOpen,
                onEmojiPick: (em) => { if (A.setInput) A.setInput((s.chatInputValue || '') + em); },
                disabled: !!s.composerLockedReason, disabledReason: s.composerLockedReason || undefined,
            })),
        });
    };

    return { chatView };
}
