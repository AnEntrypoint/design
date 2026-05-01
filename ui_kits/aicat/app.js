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
    'why does my css selector lose specificity?',
    'how do I make a state machine for an llm?',
    'explain prefers-reduced-motion in 2 lines.',
    'tell me a joke about garbage collection.'
];

const CANNED = {
    'why does my css selector lose specificity?': 'specificity is (a,b,c): ids, classes/attrs/pseudos, elements. !important short-circuits unless the other side also uses it. inline beats stylesheets unless the rule is !important.',
    'how do I make a state machine for an llm?': 'enumerate phases. each phase has entry, body, exit, next-phase rules. unknowns regress to planning. the llm picks transitions, the machine refuses illegal ones. that is gm.',
    'explain prefers-reduced-motion in 2 lines.': 'media query that signals the user wants less animation. honour it: short-circuit your fade-ins, drop big translates, keep opacity-only if anything.',
    'tell me a joke about garbage collection.': 'a generational gc walks into a bar. the bartender says, you again? gc says, don\'t worry, I\'ll be young forever.'
};

const state = {
    draft: '',
    thinking: false,
    mood: 'idle',
    messages: [
        { who: 'them', text: 'hi. I am aicat. I read fast and I knock things off shelves.', time: '·' },
        { who: 'them', text: 'ask me about css, state machines, motion design, or feed me a string.', time: '·' }
    ]
};

const root = document.getElementById('root');

function timeNow() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function reply(forText) {
    const canned = CANNED[forText.trim()];
    if (canned) return canned;
    return 'mrrp. I heard "' + forText.slice(0, 60) + '". I would knock that off the shelf.';
}

function send(text) {
    state.messages = [...state.messages, { who: 'you', avatar: 'u', text, time: timeNow() }];
    state.draft = '';
    state.thinking = true;
    state.mood = 'think';
    render();
    setTimeout(() => {
        state.thinking = false;
        state.mood = 'happy';
        state.messages = [...state.messages, { who: 'them', text: reply(text), time: timeNow() }];
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
                    glyph: '·', label: p.length > 22 ? p.slice(0, 22) + '…' : p, key: 'p' + i,
                    onClick: (e) => { e.preventDefault(); send(p); }
                })) }
            ]
        }),
        main: [
            h('div', { style: 'padding:8px 4px 0 4px' },
                Heading({ level: 1, children: 'aicat' }),
                Lede({ children: 'an ai assistant with a cat persona. she purrs, thinks, and occasionally pounces on bad takes.' }),
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
                        h('p', { style: 'margin:0 0 8px 0' }, '· thinking-state appends a typing bubble to the thread, disables the composer, mutes pre-emptive multi-sends.'),
                        h('p', { style: 'margin:0' }, '· canned answers above are deterministic — wire ', h('code', {}, 'reply()'), ' to your model of choice. interface unchanged.')
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
