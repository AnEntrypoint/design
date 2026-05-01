import * as webjsx from 'webjsx';
import { AICat, AICatPortrait, ChatComposer, Topbar, Crumb, Status, Side, AppShell, Panel, Heading, Lede, Chip } from '../../src/components.js';
const h = webjsx.createElement;

const FACES = {
    idle:    ` /\\_/\\\n( o.o )\n > ^ <`,
    happy:   ` /\\_/\\\n( ^.^ )\n > ~ <`,
    think:   ` /\\_/\\\n( -.- )\n > ? <`,
    pounce:  ` /\\_/\\\n( O.O )\n > ! <`
};

const PRESETS = [
    { q: 'show me a small react component',           k: 'code-react' },
    { q: 'explain prefers-reduced-motion in 2 lines', k: 'md-rm' },
    { q: 'send the v0.0.26 token sheet',              k: 'pdf' },
    { q: 'paste the mascot art',                       k: 'image' },
    { q: 'link the design repo',                      k: 'link' },
    { q: 'attach a config file',                      k: 'file' },
    { q: 'tell me a joke about garbage collection',   k: 'text' }
];

const REPLIES = {
    'code-react': () => ({
        parts: [
            { kind: 'text', text: 'sure — here\'s a tiny one:' },
            { kind: 'code', lang: 'jsx', filename: 'Greet.jsx',
              code: 'export function Greet({ name }) {\n  return <p>hi, {name} =^.^=</p>;\n}\n\nexport default Greet;' }
        ]
    }),
    'md-rm': () => ({
        parts: [{ kind: 'md', text: 'media query that signals the user wants less animation. honour it:\n\n- short-circuit fade-ins\n- drop big translates\n- keep opacity-only if anything\n\nuse `@media (prefers-reduced-motion: reduce)`.' }]
    }),
    pdf: () => ({
        parts: [
            { kind: 'text', text: 'here you go — `tokens-v0.0.26.pdf`:' },
            { kind: 'pdf', src: './sample.pdf', name: 'tokens-v0.0.26.pdf', size: 782 }
        ]
    }),
    image: () => ({
        parts: [
            { kind: 'text', text: 'mascot, fresh from the loom:' },
            { kind: 'image', src: './sample-svg.svg', alt: '247420 mascot', caption: 'mascot · svg · favicon-derived' }
        ]
    }),
    link: () => ({
        parts: [
            { kind: 'link', href: 'https://github.com/AnEntrypoint/design', host: 'github.com',
              title: 'AnEntrypoint/design',
              desc: 'design system for 247420 — layered surfaces, mono labels, pill radii.',
              thumb: './sample-square.png' }
        ]
    }),
    file: () => ({
        parts: [
            { kind: 'text', text: 'config attached — drop it in `~/.config/aicat/config.json`.' },
            { kind: 'file', src: './sample.pdf', name: 'aicat.config.json', size: 412, kindLabel: 'JSON' }
        ]
    }),
    text: () => ({
        parts: [{ kind: 'text', text: 'a generational gc walks into a bar. the bartender says, *you again?* gc says, **don\'t worry, I\'ll be young forever.**' }]
    })
};

function classifyAndReply(text) {
    const t = text.toLowerCase();
    const map = [
        [/code|react|component|function/, 'code-react'],
        [/reduced.motion|animat|motion/, 'md-rm'],
        [/pdf|token sheet|spec/, 'pdf'],
        [/image|mascot|picture|art/, 'image'],
        [/link|repo|github/, 'link'],
        [/file|config|attach/, 'file']
    ];
    for (const [re, k] of map) if (re.test(t)) return REPLIES[k]();
    return REPLIES.text();
}

const state = {
    draft: '',
    thinking: false,
    mood: 'idle',
    messages: [
        { who: 'them', name: 'aicat', text: 'hi. I am **aicat**. I read fast and I knock things off shelves.', time: '·' },
        { who: 'them', name: 'aicat', parts: [{ kind: 'md', text: 'try one of these:\n\n- ask for `code` (react/css/python — pick a flavour)\n- ask for the **token pdf** or the **mascot image**\n- ask me to attach a *config file*\n- or just chat — I\'ll respond in markdown-lite.' }], time: '·' }
    ]
};

const root = document.getElementById('root');

function timeNow() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function send(text) {
    state.messages = [...state.messages, {
        who: 'you', avatar: 'u', time: timeNow(), receipt: 'delivered',
        parts: [{ kind: 'text', text }]
    }];
    state.draft = '';
    state.thinking = true;
    state.mood = 'think';
    render();
    setTimeout(() => {
        state.thinking = false;
        state.mood = 'happy';
        const reply = classifyAndReply(text);
        state.messages = state.messages.map((m) => m.who === 'you' ? { ...m, receipt: 'read' } : m);
        state.messages = [...state.messages, { who: 'them', name: 'aicat', time: timeNow(), ...reply }];
        render();
        setTimeout(() => { state.mood = 'idle'; render(); }, 1400);
    }, 1100);
}

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'aicat', items: [['index', '../../'], ['chat', '../chat/'], ['source ↗', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'aicat' }),
        side: Side({
            sections: [
                { group: 'session', items: [
                    { glyph: '◆', label: 'new chat', key: 'new', onClick: (e) => { e.preventDefault(); state.messages = state.messages.slice(0, 2); render(); } },
                    { glyph: '◇', label: 'history', count: 7, key: 'h' }
                ] },
                { group: 'try', items: PRESETS.map((p, i) => ({
                    glyph: '·', label: p.q.length > 22 ? p.q.slice(0, 22) + '…' : p.q, key: 'p' + i,
                    onClick: (e) => { e.preventDefault(); send(p.q); }
                })) }
            ]
        }),
        main: [
            h('div', { style: 'padding:8px 4px 0 4px' },
                Heading({ level: 1, children: 'aicat' }),
                Lede({ children: 'an ai assistant with a cat persona. she replies in text, code, markdown, images, pdfs, file attachments, or link cards — depending on what you ask.' }),
                AICatPortrait({
                    name: 'aicat',
                    status: state.thinking ? 'thinking…' : (state.mood === 'happy' ? 'online · purring' : 'online · idle'),
                    face: FACES[state.mood] || FACES.idle
                }),
                AICat({
                    name: 'aicat',
                    status: state.thinking ? 'thinking…' : 'online · purring',
                    messages: state.messages,
                    thinking: state.thinking,
                    composer: ChatComposer({
                        value: state.draft,
                        placeholder: 'ask aicat anything…',
                        disabled: state.thinking,
                        onInput: (v) => { state.draft = v; render(); },
                        onSend: send
                    })
                }),
                Panel({
                    title: 'about this kit',
                    children: h('div', { style: 'padding:14px 20px;font-size:13px;line-height:1.65;color:var(--panel-text-2)' },
                        h('p', { style: 'margin:0 0 8px 0' }, '· portrait surface uses an ascii face that swaps with mood — ', Chip({ tone: 'dim', children: 'idle' }), ' ', Chip({ tone: 'dim', children: 'think' }), ' ', Chip({ tone: 'accent', children: 'happy' }), '.'),
                        h('p', { style: 'margin:0 0 8px 0' }, '· thinking-state appends a typing bubble, disables the composer, blocks pre-emptive multi-sends.'),
                        h('p', { style: 'margin:0' }, '· classifier in ', h('code', {}, 'classifyAndReply()'), ' is deterministic — wire to your model, replies stay shaped as ', h('code', {}, '{parts:[…]}'), '.')
                    )
                })
            )
        ],
        status: Status({
            left: ['aicat', '• ' + state.messages.length + ' turns', state.thinking ? '• thinking' : '• idle'],
            right: ['247420 / mmxxvi']
        })
    });
}

function render() {
    webjsx.applyDiff(root, App());
}
render();
window.__aicat = { state, render, send };
