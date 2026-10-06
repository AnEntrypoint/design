import * as webjsx from 'webjsx';
import { Topbar, Crumb, Side, AppShell, Status, Icon } from 'ds/components/shell.js';
import { Panel, Row } from 'ds/components/content.js';
import { AICat, flashComposerNote, ChatComposer } from 'ds/components/chat.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const FACES = {
    idle:    ` /\\_/\\\n( o.o )\n > ^ <`,
    happy:   ` /\\_/\\\n( ^.^ )\n > ~ <`,
    think:   ` /\\_/\\\n( -.- )\n > ? <`,
    pounce:  ` /\\_/\\\n( O.O )\n > ! <`
};

const HISTORY = [
    { t: 'welcome to aicat', k: 'h0' }
];

const WELCOME_MESSAGES = [
    { who: 'them', name: 'aicat', text: 'hi. I am **aicat**. I read fast and I knock things off shelves.', time: timeNow() },
    { who: 'them', name: 'aicat', parts: [{ kind: 'md', text: 'try one of these:\n\n- ask for `code` (react or python)\n- ask for the **token pdf** or the **logo image**\n- ask me to attach a *config file*\n- or send a message; replies are in markdown.' }], time: timeNow() }
];

const PRESETS = [
    { q: 'show me a small react component', k: 'code-react', kind: 'code' },
    { q: 'show python prime sieve', k: 'code-py', kind: 'code' },
    { q: 'explain prefers-reduced-motion', k: 'md-rm', kind: 'markdown' },
    { q: 'summarize the design tokens as a pdf', k: 'pdf', kind: 'pdf' },
    { q: 'show me the aicat picture', k: 'image', kind: 'image' },
    { q: 'link the design repo', k: 'link', kind: 'link card' },
    { q: 'attach a config file', k: 'file', kind: 'file' },
    { q: 'explain what a design token is', k: 'text', kind: 'text' }
];

const REPLIES = {
    'code-react': () => ({ parts: [
        { kind: 'text', text: 'sure, here\'s a small one:' },
        { kind: 'code', lang: 'jsx', filename: 'Greet.jsx',
          code: 'export function Greet({ name }) {\n  return <p>hi, {name} =^.^=</p>;\n}\n\nexport default Greet;' }
    ] }),
    'code-py': () => ({ parts: [
        { kind: 'text', text: 'classic sieve, no imports:' },
        { kind: 'code', lang: 'python', filename: 'sieve.py',
          code: 'def primes(n):\n    sieve = [True] * (n + 1)\n    sieve[0] = sieve[1] = False\n    for i in range(2, int(n ** 0.5) + 1):\n        if sieve[i]:\n            for j in range(i * i, n + 1, i):\n                sieve[j] = False\n    return [i for i, p in enumerate(sieve) if p]\n\nprint(primes(50))' }
    ] }),
    'md-rm': () => ({ parts: [{ kind: 'md', text: '## prefers-reduced-motion\n\nmedia query that signals the user wants less animation. honour it:\n\n- short-circuit fade-ins\n- drop big translates\n- keep opacity-only if anything\n\n```css\n@media (prefers-reduced-motion: reduce) {\n  * { animation-duration: 0ms !important; }\n}\n```\n\n> opt out of motion, not out of feedback.' }] }),
    pdf: () => ({ parts: [
        { kind: 'text', text: 'here you go: `tokens-v0.0.27.pdf`' },
        { kind: 'pdf', src: './sample.pdf', name: 'tokens-v0.0.27.pdf', size: 782 }
    ] }),
    image: () => ({ parts: [
        { kind: 'text', text: 'logo, fresh from the loom:' },
        { kind: 'image', src: './sample-svg.svg', alt: '247420 logo', caption: 'logo · svg · favicon-derived' }
    ] }),
    link: () => ({ parts: [
        { kind: 'link', href: 'https://github.com/AnEntrypoint/design', host: 'github.com',
          title: 'AnEntrypoint/design',
          desc: 'design system for 247420: layered surfaces, mono labels, pill radii.',
          thumb: './sample-square.png' }
    ] }),
    file: () => ({ parts: [
        { kind: 'text', text: 'config attached. Save it to `~/.config/aicat/config.json`.' },
        { kind: 'file', src: './sample.pdf', name: 'aicat.config.json', size: 412, kindLabel: 'JSON' }
    ] }),
    text: () => ({ parts: [{ kind: 'text', text: 'a generational gc walks into a bar. the bartender says, *you again?* gc says, **don\'t worry, I\'ll be young forever.**' }] })
};

function truncateAtWord(text, max) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut) + '…';
}

function classifyAndReply(text) {
    const t = text.toLowerCase();
    const map = [
        [/python|sieve|prime/, 'code-py'],
        [/code|react|component|function|jsx/, 'code-react'],
        [/reduced.motion|animat|motion/, 'md-rm'],
        [/pdf|token sheet|spec/, 'pdf'],
        [/image|logo|picture|art/, 'image'],
        [/link|repo|github/, 'link'],
        [/file|config|attach/, 'file']
    ];
    for (const [re, k] of map) if (re.test(t)) return REPLIES[k]();
    return REPLIES.text();
}

function liveStatus(s) {
    if (s.thinking) return 'thinking…';
    return s.mood === 'happy' ? 'online · purring' : 'online · idle';
}

function AICatPortraitHead({ mood, status }) {
    return h('div', { class: 'chat-head aicat-portrait-head', role: 'banner' },
        h('pre', { class: 'aicat-face aicat-face-inline', role: 'img', 'aria-label': 'aicat portrait' }, FACES[mood] || FACES.idle),
        h('h2', { class: 'ds-chat-title' }, 'aicat'),
        h('span', { class: 'sub', 'aria-label': `status: ${status}` }, ' · ' + status),
        h('span', { class: 'spread' })
    );
}

function timeNow() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

function RequestList() {
    return Panel({
        title: 'example requests', count: PRESETS.length, class: 'aicat-examples',
        children: h('div', {}, ...PRESETS.map((p) => Row({ key: 'pr-' + p.k, title: p.q, meta: p.kind, onClick: () => { if (!state.thinking) send(p.q); } })))
    });
}

const state = {
    draft: '', thinking: false, mood: 'idle',
    messages: []
};

const root = document.getElementById('root');

function send(text) {
    if (state.thinking) return;
    const sentIdx = state.messages.length;
    state.messages = [...state.messages, { who: 'you', avatar: 'u', time: timeNow(), receipt: 'delivered', parts: [{ kind: 'text', text }] }];
    state.draft = '';
    state.thinking = true;
    state.mood = 'think';
    kit.render();
    setTimeout(() => {
        state.thinking = false;
        state.mood = 'happy';
        const reply = classifyAndReply(text);
        state.messages = state.messages.map((m, i) => (m.who === 'you' && i === sentIdx) ? { ...m, receipt: 'read' } : m);
        state.messages = [...state.messages, { who: 'them', name: 'aicat', time: timeNow(), ...reply }];
        kit.render();
        setTimeout(() => { state.mood = 'idle'; kit.render(); }, 1400);
    }, 1100);
}

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'aicat', items: [['index', '../../'], ['community', '../community-app/'], ['source', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'aicat' }),
        side: Side({
            sections: [
                { group: 'chats', items: [
                    { glyph: Icon('plus', { size: 14 }), label: 'new chat', key: 'new', onClick: (e) => {
                        e.preventDefault();
                        state.messages = [];
                        kit.render();
                        const composerEl = root.querySelector('.chat-composer');
                        if (composerEl) flashComposerNote(composerEl, 'chat cleared');
                    } },
                    ...HISTORY.map((item) => ({ glyph: Icon('forum', { size: 14 }), label: truncateAtWord(item.t, 26), key: item.k, onClick: (e) => {
                        e.preventDefault();
                        if (state.thinking) return;
                        state.messages = WELCOME_MESSAGES.map((m) => ({ ...m, time: timeNow() }));
                        kit.render();
                    } }))
                ] }
            ]
        }),
        main: [
            h('h1', { class: 'sr-only' }, 'aicat'),
            state.messages.length === 0 ? (
                h('div', { key: 'main-empty', class: 'ds-app-surface ds-section-pad aicat-focus-col aicat-empty-canvas' },
                    h('div', { class: 'aicat-start' },
                        h('h2', { class: 'aicat-start-title' }, 'aicat'),
                        h('p', { class: 'aicat-start-lede' }, 'replies in markdown, with code blocks, pdfs, images, link cards and file attachments.')
                    ),
                    ChatComposer({
                        value: state.draft,
                        placeholder: 'ask aicat anything…',
                        disabled: state.thinking,
                        onInput: (v) => { state.draft = v; kit.render(); },
                        onSend: send
                    }),
                    RequestList()
                )
            ) : h('div', { key: 'main-populated', class: 'ds-app-surface ds-section-pad aicat-focus-col' },
                AICat({
                    name: 'aicat',
                    status: liveStatus(state),
                    header: AICatPortraitHead({ mood: state.mood, status: liveStatus(state) }),
                    messages: state.messages, thinking: state.thinking,
                    composer: ChatComposer({
                        value: state.draft,
                        placeholder: 'ask aicat anything…',
                        disabled: state.thinking,
                        onInput: (v) => { state.draft = v; kit.render(); },
                        onSend: send
                    })
                })
            )
        ],
        status: Status({
            left: ['aicat', state.messages.length + ' turns', state.thinking ? 'thinking' : 'idle'],
            right: ['sample data']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '07 AICat' });
window.__aicat = { state, render: kit.render, send };
