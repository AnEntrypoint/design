import * as webjsx from 'webjsx';
import { Chat, ChatComposer, Topbar, Crumb, Status, Side, AppShell, Panel } from '../../src/components.js';
const h = webjsx.createElement;

const state = {
    draft: '',
    room: 'general',
    messages: [
        { who: 'them', avatar: 'jr', text: 'pushed v0.0.24, theme cleanup looks clean now.', time: '14:02' },
        { who: 'them', avatar: 'mk', text: 'nice. body-hide trick on first paint?', time: '14:03' },
        { who: 'you',  avatar: 'me', text: 'yeah, hide until styles+fonts+first paint ready. no flash.', time: '14:04' },
        { who: 'them', avatar: 'jr', text: 'do we need a fallback for prefers-reduced-motion?', time: '14:06' },
        { who: 'you',  avatar: 'me', text: 'reduced-motion already short-circuits the intro. covered.', time: '14:07' }
    ]
};

const rooms = [
    { glyph: '#', label: 'general', count: 12, key: 'general' },
    { glyph: '#', label: 'design', count: 4, key: 'design' },
    { glyph: '#', label: 'releases', count: 1, key: 'releases' },
    { glyph: '#', label: 'lore', count: 0, key: 'lore' }
];

const dms = [
    { glyph: '·', label: 'jr', key: 'jr' },
    { glyph: '·', label: 'mk', key: 'mk' },
    { glyph: '·', label: 'aicat', key: 'aicat' }
];

const root = document.getElementById('root');

function timeNow() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function send(text) {
    state.messages = [...state.messages, { who: 'you', avatar: 'me', text, time: timeNow() }];
    state.draft = '';
    render();
    setTimeout(() => {
        state.messages = [...state.messages, { who: 'them', avatar: 'jr', text: 'noted. ' + text.split(' ').slice(0, 4).join(' ') + '…', time: timeNow() }];
        render();
    }, 900);
}

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'chat', items: [['index', '../../'], ['source ↗', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'chat' }),
        side: Side({
            sections: [
                { group: 'rooms', items: rooms.map(r => ({ ...r, active: state.room === r.key, onClick: (e) => { e.preventDefault(); state.room = r.key; render(); } })) },
                { group: 'direct', items: dms.map(r => ({ ...r, active: state.room === r.key, onClick: (e) => { e.preventDefault(); state.room = r.key; render(); } })) }
            ]
        }),
        main: [
            h('div', { style: 'padding:8px 4px 0 4px' },
                h('h1', {}, '# ' + state.room),
                h('p', { class: 'lede' }, 'thread of messages, composer below. Enter sends, Shift+Enter inserts a newline.'),
                Chat({
                    title: state.room,
                    sub: 'public',
                    messages: state.messages,
                    composer: ChatComposer({
                        value: state.draft,
                        placeholder: 'message #' + state.room + '…',
                        onInput: (v) => { state.draft = v; render(); },
                        onSend: send
                    })
                }),
                Panel({
                    title: 'pattern notes',
                    children: h('div', { style: 'padding:14px 20px;font-size:13px;line-height:1.6;color:var(--panel-text-2)' },
                        h('p', { style: 'margin:0 0 8px 0' }, '· bubble corner-cut on the originating side (4px) gives directional read without arrows.'),
                        h('p', { style: 'margin:0 0 8px 0' }, '· own messages take the accent fill so the eye lands on what you said last.'),
                        h('p', { style: 'margin:0' }, '· monospace timestamps disambiguate text density without competing.')
                    )
                })
            )
        ],
        status: Status({ left: ['main', '• ' + state.messages.length + ' messages', '• ' + rooms.length + ' rooms'], right: ['247420 / mmxxvi'] })
    });
}

function render() {
    webjsx.applyDiff(root, App());
}
render();
window.__chat = { state, render };
