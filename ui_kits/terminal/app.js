import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, Side, AppShell, Heading, Lede, Icon } from 'ds/components/shell.js';
import { Panel } from 'ds/components/content.js';
import { mountKit } from 'ds/bootstrap.js';
import { run as runCommand, complete as completeLine } from 'ds/shell.js';
import { copyToClipboardWithFeedback } from 'ds/components/chat-message-parts/inline.js';
import { hasSelectionInside } from 'ds/components/chat/thread-scroll.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const liveTranscript = [
    { kind: 'cmt', text: 'live shell. type `help` for commands.' },
];
const live = { input: '', cwd: '~/dev/design', phase: 'ready' };
function ScrollbackEmpty() {
    return h('div', { class: 'ds-empty-state' },
        h('div', { class: 'ds-empty-state-glyph' }, '$'),
        h('p', { class: 'ds-empty-state-msg' }, 'nothing run in this shell yet'),
        h('p', { class: 'ds-empty-state-hint' }, 'type a command below and press enter. output stays until you clear it.')
    );
}

const demoScript = [
    { d: 0,    kind: 'cmt', text: 'simulated build pipeline' },
    { d: 280,  kind: 'cmd', text: 'npm run build' },
    { d: 180,  kind: 'out', text: '> anentrypoint-design build' },
    { d: 220,  kind: 'out', text: 'running lint gates' },
    { d: 260,  kind: 'out', text: 'bundling css and sdk' },
    { d: 220,  kind: 'ok',  text: 'dist/247420.css and dist/247420.js written' },
    { d: 320,  kind: 'cmd', text: 'git push' },
    { d: 240,  kind: 'out', text: 'remote: deploying to gh-pages' },
    { d: 900,  kind: 'ok',  text: 'deployed' }
];
const reduced = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
const demo = { visible: reduced ? demoScript.slice() : [], looping: !reduced };

const history = [];
let historyIdx = -1;

let liveBodyEl = null;

function scrollLiveToBottom() {
    if (!liveBodyEl || hasSelectionInside(liveBodyEl)) return;
    liveBodyEl.scrollTop = liveBodyEl.scrollHeight;
}

const shellCwd = [];
const shellPath = () => '~/' + shellCwd.join('/');
const shellCtx = {
    cwd: shellCwd,
    clear: () => clearScrollback(),
    setTheme: (t) => document.documentElement.setAttribute('data-theme', t),
};

function seed(line) {
    liveTranscript.push({ kind: 'cmd', text: line });
    for (const out of runCommand(line, shellCtx)) liveTranscript.push(out);
}
seed('whoami');
seed('ls');

function clearScrollback() {
    liveTranscript.length = 0;
    live.phase = 'empty';
    historyIdx = -1;
    kit.render();
}

function recallHistory() {
    if (!history.length) {
        if (live.phase !== 'ready') live.phase = 'ready';
        liveTranscript.push({ kind: 'cmt', text: '# no history yet' });
        kit.render();
        scrollLiveToBottom();
        return;
    }
    historyIdx = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
    live.input = history[historyIdx];
    if (live.phase !== 'ready') live.phase = 'ready';
    kit.render();
}

function recallHistoryForward() {
    if (historyIdx < 0) return;
    if (historyIdx >= history.length - 1) {
        historyIdx = -1;
        live.input = '';
    } else {
        historyIdx += 1;
        live.input = history[historyIdx];
    }
    kit.render();
}

const LINE_PROMPTS = { cmt: '#', cmd: '$', out: '·', ok: '+', warn: '!', log: '·' };
function Line(l, i, opts = {}) {
    const prompt = LINE_PROMPTS[l.kind];
    if (!prompt) return null;
    const copyable = l.kind === 'cmd';
    return h('div', { key: 'l' + i, class: 'cli ds-cli-' + l.kind + (copyable ? ' ds-term-line-copyable' : '') },
        h('span', { class: 'prompt' }, prompt),
        h('span', { class: 'cmd' }, l.text),
        opts.cursor ? h('span', { class: 'cursor-blink' }, '') : null,
        copyable ? h('button', {
            type: 'button', class: 'ds-term-line-copy',
            'aria-label': 'copy command',
            onclick: (e) => { e.preventDefault(); copyToClipboardWithFeedback(l.text, e.currentTarget); }
        }, 'copy') : null
    );
}

function App() {
    return AppShell({
        topbar: Topbar({
            brand: '247420',
            leaf: 'terminal',
            items: [['index', '../../'], ['dashboard', '../dashboard/']]
        }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'terminal' }),
        side: Side({
            sections: [
                { group: 'sessions', items: [
                    { glyph: Icon('activity', { size: 14 }), label: 'live', count: live.phase === 'ready' ? liveTranscript.length : 0, key: 'l', href: '#p-live' },
                    { glyph: Icon('refresh', { size: 14 }), label: 'demo loop', count: demo.looping ? 'play' : 'still', key: 'd',
                      href: '#p-demo',
                      onClick: (e) => {
                          e.preventDefault();
                          demo.looping = !demo.looping;
                          if (demo.looping) tick();
                          kit.render();
                      } }
                ] },
                { group: 'shortcuts', items: [
                    { glyph: Icon('trash', { size: 14 }), label: 'clear (ctrl/cmd k)', key: 'c',
                      onClick: (e) => { e.preventDefault(); clearScrollback(); } },
                    { glyph: Icon('arrow-up', { size: 14 }), label: 'history (up)', key: 'h',
                      onClick: (e) => { e.preventDefault(); recallHistory(); } }
                ] }
            ]
        }),
        main: [
            h('div', { class: 'ds-app-surface ds-section-pad-sm' },
                Heading({ level: 1, children: 'terminal' }),
                Lede({ children: 'in-memory shell with tab completion and history. try help, ls, cd, cat, echo or theme.' }),

                Panel({
                    id: 'p-live',
                    title: 'live · ' + live.cwd,
                    count: live.phase === 'ready' ? liveTranscript.length : 0,
                    class: 'ds-panel-gap',
                    children:                     h('div', { class: 'ds-term-body', role: 'log', 'aria-live': 'polite', ref: (el) => { liveBodyEl = el; } },
                        live.phase === 'empty' ? ScrollbackEmpty() : liveTranscript.map((l, i) => Line(l, i)),
                        h('div', { class: 'cli ds-term-input-row' },
                            h('span', { class: 'prompt' }, '$'),
                            h('input', {
                                type: 'text',
                                value: live.input,
                                placeholder: 'try help, ls or cat readme.md',
                                'aria-label': 'shell command input',
                                class: 'ds-term-input',
                                oninput: (e) => { live.input = e.target.value; },
                                onkeydown: (e) => {
                                    if (e.key === 'Enter' && live.input.trim()) {
                                        const line = live.input;
                                        liveTranscript.push({ kind: 'cmd', text: line });
                                        for (const out of runCommand(line, shellCtx)) liveTranscript.push(out);
                                        live.cwd = shellPath();
                                        history.push(line);
                                        historyIdx = -1;
                                        live.input = '';
                                        if (live.phase !== 'ready' && liveTranscript.length > 0) live.phase = 'ready';
                                        kit.render();
                                        scrollLiveToBottom();
                                    } else if (e.key === 'Tab') {
                                        e.preventDefault();
                                        live.input = completeLine(live.input, shellCwd);
                                        kit.render();
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        recallHistory();
                                    } else if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        recallHistoryForward();
                                    }
                                }
                            })
                        )
                    )
                }),

                Panel({
                    id: 'p-demo',
                    title: 'last build · main',
                    count: demo.visible.length + '/' + demoScript.length,
                    class: 'ds-panel-gap',
                    children: h('div', { class: 'ds-term-body ds-term-body--tall' },
                        ...demo.visible.map((l, i) => Line(l, i, { cursor: i === demo.visible.length - 1 && demo.looping }))
                    )
                }),

            )
        ],
        status: Status({
            left: ['terminal', 'live ' + (live.phase === 'ready' ? liveTranscript.length : 0) + ' lines', demo.looping ? 'demo playing' : 'demo still'],
            right: ['simulated output']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '09 Terminal' });

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        clearScrollback();
    }
});

let demoIdx = 0;
let demoPending = false;
function tick() {
    if (!demo.looping || demoPending) return;
    if (demoIdx >= demoScript.length) {
        demoPending = true;
        setTimeout(() => {
            demoPending = false;
            if (!demo.looping) return;
            demo.visible = []; demoIdx = 0; kit.render(); tick();
        }, 2500);
        return;
    }
    const step = demoScript[demoIdx++];
    demoPending = true;
    setTimeout(() => {
        demoPending = false;
        if (!demo.looping) return;
        demo.visible.push(step); kit.render(); tick();
    }, step.d);
}
tick();
