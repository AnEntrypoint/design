import { mountCommunityApp } from 'ds/community-app.js';
import { attempt } from 'ds/best-effort.js';
import { applyTheme, getTheme } from 'ds/theme.js';


const THEME_ORDER = ['auto', 'paper', 'ink'];
const CAT = ['var(--cat-green)', 'var(--cat-purple)', 'var(--cat-mascot)', 'var(--cat-sun)', 'var(--cat-flame)', 'var(--cat-sky)'];
const color = (id) => CAT[Math.abs([...String(id || '')].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7)) % CAT.length];

const channels = [
    { id: 'general', name: 'general', type: 'text', position: 0 },
    { id: 'announcements', name: 'announcements', type: 'announcement', position: 1 },
    { id: 'lounge', name: 'lounge', type: 'voice', position: 2 },
];
const servers = [
    { id: 'zellous', name: 'zellous' },
    { id: 'spoint', name: 'spoint' },
    { id: 'flatspace', name: 'flatspace' },
    { id: 'mutagen', name: 'mutagen' },
];

const VOICE_PEERS = [
    { identity: 'sample-user-1', color: color('sample-user-1'), speaking: true },
    { identity: 'sample-user-2', color: color('sample-user-2'), muted: true },
];

const SAMPLE_MESSAGES = [
    { id: 'm1', userId: 'sample-user-1', username: 'sample-user-1', content: 'shipped the community adapter contract. mock lives in the kit, real one lives in the consumer.', timestamp: Date.now() - 900000, delivered: true, reactions: [{ emoji: 'yay', count: 3, you: true }, { emoji: 'eyes', count: 1 }] },
    { id: 'm1b', userId: 'sample-user-1', username: 'sample-user-1', content: 'no backend anywhere in this kit -- state.js + a Set of subscribers is the whole store.', timestamp: Date.now() - 890000, delivered: true },
    { id: 'm2', userId: 'sample-user-2', username: 'sample-user-2', content: 'so the kit never talks to a backend at all?', timestamp: Date.now() - 780000, delivered: true },
    { id: 'm3', userId: 'you', username: 'you', content: 'right -- it only has to satisfy get/subscribe/actions.', timestamp: Date.now() - 700000, delivered: true, read: true },
    { id: 'm4', userId: 'you', username: 'you', type: 'code', lang: 'css', content: 'html { visibility: hidden; }\nhtml.ready { visibility: visible; }\n\n@media (prefers-reduced-motion: reduce) {\n  * { animation-duration: 0ms !important; }\n}', timestamp: Date.now() - 650000, delivered: true, read: true },
    { id: 'm5', userId: 'sample-user-1', username: 'sample-user-1', content: '## review notes\n\nlooks solid. couple things:\n\n- short timeout fallback in case fonts hang\n- announce the `ready` class via `requestIdleCallback`\n- keep no-js fallback to `visibility: visible`\n\n> "ship the rough draft" -- but not the broken one.\n\nwill review the rest tonight.', timestamp: Date.now() - 600000, delivered: true, reactions: [{ emoji: 'done', count: 2, you: true }] },
    { id: 'm6', userId: 'sample-user-2', username: 'sample-user-2', type: 'image', url: './sample-svg.svg', alt: 'design system mascot', caption: 'spot the new mascot -- final', timestamp: Date.now() - 480000, delivered: true },
    { id: 'm7', userId: 'you', username: 'you', content: 'attaching the token sheet for review:', attachments: [{ type: 'file', src: './sample.pdf', name: 'token-sheet.pdf', size: 782 }], timestamp: Date.now() - 420000, delivered: true, read: true },
    { id: 'm8', userId: 'sample-user-1', username: 'sample-user-1', content: '', linkPreview: { href: 'https://github.com/AnEntrypoint/design', host: 'github.com', title: 'AnEntrypoint/design: design system for 247420', desc: 'a coherent visual paradigm: layered surfaces, monospace labels, loud content inside quiet chrome.' }, timestamp: Date.now() - 360000, delivered: true },
    { id: 'm9', userId: 'sample-user-2', username: 'sample-user-2', type: 'file', url: './sample.pdf', name: 'review-notes.pdf', size: 782, timestamp: Date.now() - 300000, delivered: true, reactions: [{ emoji: 'pin', count: 1 }] },
];

const TYPING_PEERS = [{ id: 'sample-user-1', name: 'sample-user-1', avatar: 'S', color: color('sample-user-1') }];

const state = {
    channels, categories: [], servers,
    currentChannel: channels[0], currentServerId: 'zellous', homeMode: false,
    messages: SAMPLE_MESSAGES.map((m) => ({ ...m })), typingUsers: TYPING_PEERS, chatInputValue: '', replyTarget: null,
    currentUser: { username: 'you' }, userId: 'you',
    isConnected: true,
    voiceConnected: false, voiceChannelName: '', voiceConnectionState: 'connected',
    loungeConnected: true,
    voiceParticipants: [], micMuted: false, voiceDeafened: false,
    memberCategories: [{ label: 'online (1)', members: [{ identity: 'you', name: 'you', status: 'online', color: color('you') }] }],
    memberListOpen: false,
    mobileMenuOpen: false,
};

function toggleReaction(message, emoji) {
    const reactions = (message.reactions || []).map((r) => ({ ...r }));
    const mine = reactions.find((r) => r.emoji === emoji);
    if (!mine) reactions.push({ emoji, count: 1, you: true });
    else if (mine.you) { mine.count -= 1; mine.you = false; }
    else { mine.count += 1; mine.you = true; }
    return reactions.filter((r) => r.count > 0);
}

const subs = new Set();
const notify = () => subs.forEach(cb => { attempt(() => { cb(); }); });

const adapter = {
    get: () => {
        const inVoice = !!(state.currentChannel && state.currentChannel.type === 'voice' && state.loungeConnected);
        if (!inVoice) return state;
        return { ...state, voiceParticipants: [...VOICE_PEERS, { identity: 'you', color: color('you'), muted: state.micMuted }] };
    },
    subscribe: (cb) => { subs.add(cb); return () => subs.delete(cb); },
    helpers: { avatarColor: color, initial: (n) => String(n || '?').slice(0, 1).toUpperCase(), formatTime: (t) => new Date(t || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) },
    actions: {
        switchChannel: (ch) => {
            state.currentChannel = ch; state.mobileMenuOpen = false;
            if (ch && ch.type === 'voice') state.loungeConnected = true;
            notify();
        },
        setInput: (v) => { state.chatInputValue = v; },
        send: (text) => {
            state.messages = [...state.messages, { id: 'm' + Date.now(), userId: 'you', username: 'you', content: text, timestamp: Date.now(), delivered: true }];
            state.chatInputValue = '';
            notify();
        },
        toggleMic: () => { state.micMuted = !state.micMuted; notify(); },
        toggleDeafen: () => { state.voiceDeafened = !state.voiceDeafened; notify(); },
        leaveVoice: () => { state.loungeConnected = false; state.voiceParticipants = []; notify(); },
        toggleMembers: () => { state.memberListOpen = !state.memberListOpen; notify(); },
        openMobileMenu: () => { state.mobileMenuOpen = true; notify(); },
        closeMobileMenu: () => { state.mobileMenuOpen = false; notify(); },
        openSettings: () => { applyTheme(THEME_ORDER[(THEME_ORDER.indexOf(getTheme()) + 1) % THEME_ORDER.length]); }, openVoiceSettings: () => {},
        goHome: () => {}, openServers: () => {},
        switchServer: (id) => {
            state.currentServerId = id; notify();
        },
        channelContext: () => {}, serverContext: () => {}, memberMenu: () => {},
        resolveProfile: (id) => (id === 'you' ? 'you' : id),
        reactToMessage: (id, _authorId, emoji) => {
            const message = state.messages.find((m) => m.id === id);
            if (!message) return;
            message.reactions = toggleReaction(message, emoji || 'yay');
            notify();
        },
        startReply: (msg) => { state.replyTarget = msg; notify(); },
        cancelReply: () => { state.replyTarget = null; notify(); },
    },
};

const app = mountCommunityApp(document.getElementById('root'), adapter);
window.__communityApp = { state, adapter, app, notify };
