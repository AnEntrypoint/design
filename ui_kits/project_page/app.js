import * as webjsx from 'webjsx';
const h = webjsx.createElement;

const state = { copied: false };
const root = document.getElementById('root');

function Bar() {
    return h('header', { style: 'padding:14px 32px;border-bottom:1px solid var(--paper);display:flex;justify-content:space-between;gap:16px;align-items:baseline' },
        h('a', { href: '#', class: 't-label', style: 'color:var(--paper);text-decoration:none' }, '← 247420'),
        h('span', { class: 't-micro', style: 'flex:1;border-bottom:1px dotted var(--paper);align-self:center;margin:0 16px' }),
        h('nav', { style: 'display:flex;gap:20px', class: 't-label' },
            h('a', { href: '#', style: 'color:var(--paper);text-decoration:none' }, 'readme'),
            h('a', { href: '#', style: 'color:var(--acid-ink);background:var(--acid);padding:2px 4px;text-decoration:none' }, 'docs'),
            h('a', { href: '#', style: 'color:var(--paper);text-decoration:none' }, 'source ↗')
        )
    );
}

function ProjectHero({ mark, tagline, version, status }) {
    return h('section', { style: 'padding:64px 32px;border-bottom:1px solid var(--rule-inv)' },
        h('div', { class: 't-label', style: 'color:var(--paper);margin-bottom:24px' }, `// PROJECT · ${status} · ${version}`),
        h('div', { style: 'font-family:var(--ff-mono);font-size:clamp(96px,18vw,220px);line-height:0.95;letter-spacing:-0.04em;color:var(--paper);font-weight:500' }, mark),
        h('p', { style: 'font-family:var(--ff-display);font-size:36px;line-height:1.2;margin:24px 0 0 0;max-width:22ch;color:var(--paper)' }, tagline)
    );
}

function Receipt({ rows }) {
    return h('section', { style: 'padding:32px;border-bottom:1px solid var(--rule-inv)' },
        h('div', { class: 't-label', style: 'color:var(--paper);margin-bottom:16px' }, '// RECEIPT'),
        h('div', { style: 'font-family:var(--ff-mono);font-size:14px;max-width:560px' },
            ...rows.map(([k, v], i) => h('div', { key: i, style: 'display:flex;gap:12px;padding:6px 0;color:var(--paper)' },
                h('span', { style: 'color:#A9A396;text-transform:uppercase;letter-spacing:0.14em;font-size:11px;width:140px;flex-shrink:0' }, k),
                h('span', { style: 'flex:1;border-bottom:1px dotted #5A564B;align-self:center' }),
                h('span', {}, v)
            ))
        )
    );
}

function Install({ cmd }) {
    return h('section', { style: 'padding:32px;border-bottom:1px solid var(--rule-inv)' },
        h('div', { class: 't-label', style: 'color:var(--paper);margin-bottom:16px' }, '// INSTALL'),
        h('div', { style: 'display:flex;align-items:stretch;max-width:720px;border:1px solid var(--paper)' },
            h('span', { style: 'font-family:var(--ff-mono);padding:14px 16px;color:#A9A396;border-right:1px solid var(--paper)' }, '$'),
            h('code', { style: 'flex:1;font-family:var(--ff-mono);font-size:16px;padding:14px 16px;color:var(--paper);background:transparent;border:0' }, cmd),
            h('button', {
                onclick: () => { navigator.clipboard?.writeText(cmd); state.copied = true; render(); setTimeout(() => { state.copied = false; render(); }, 1200); },
                style: `font-family:var(--ff-mono);font-size:12px;letter-spacing:0.14em;text-transform:uppercase;padding:0 20px;background:${state.copied?'var(--acid)':'transparent'};color:${state.copied?'var(--acid-ink)':'var(--paper)'};border:0;border-left:1px solid var(--paper);cursor:pointer`
            }, state.copied ? 'copied' : 'copy')
        )
    );
}

function Changelog({ entries }) {
    return h('section', { style: 'padding:32px' },
        h('div', { class: 't-label', style: 'color:var(--paper);margin-bottom:16px' }, '// CHANGELOG'),
        h('div', {}, ...entries.map((e, i) =>
            h('div', { key: i, style: 'display:grid;grid-template-columns:100px 80px 1fr;gap:24px;padding:12px 0;border-top:1px solid var(--paper);color:var(--paper);align-items:baseline' },
                h('span', { style: 'font-family:var(--ff-mono);font-size:12px;letter-spacing:0.14em;text-transform:uppercase' }, e.date),
                h('span', { style: 'font-family:var(--ff-mono);font-size:14px;color:var(--acid)' }, e.ver),
                h('span', { style: 'font-family:var(--ff-serif);font-size:18px;line-height:1.5' }, e.msg)
            )
        ))
    );
}

function App() {
    return [
        Bar(),
        ProjectHero({ mark: 'gm', tagline: "state machine for coding agents. it thinks, so you don't have to (as much).", version: 'v0.4.1', status: 'LIVE' }),
        Receipt({ rows: [
            ['STATUS','live · ships tuesdays'],
            ['STARS','3,124'],
            ['LICENSE','MIT'],
            ['LANG','typescript · deno'],
            ['SIZE','2.1mb'],
            ['DEPS','0 runtime'],
            ['AUTHORS','the collective'],
            ['FIRST COMMIT','2024.09.03']
        ] }),
        Install({ cmd: 'npx -y @anentrypoint/mcp-gm' }),
        Changelog({ entries: [
            { date:'2026.04.20', ver:'v0.4.1', msg:'ship it. fixed the thing everyone complained about.' },
            { date:'2026.03.22', ver:'v0.4.0', msg:'new state machine runtime. broke everything on purpose. read the postmortem.' },
            { date:'2026.02.09', ver:'v0.3.7', msg:'astgrep_search is now astgrep_enhanced_search. you will adapt.' },
            { date:'2025.12.11', ver:'v0.3.0', msg:'first public release. gm, world.' }
        ] }),
        h('footer', { style: 'padding:32px;border-top:1px solid var(--paper);display:flex;justify-content:space-between;gap:16px', class: 't-micro' },
            h('span', {}, '247420 / MMXXVI · BUILT IN PUBLIC'),
            h('span', {}, 'NO COOKIES · NO ANALYTICS · NO GRADIENTS')
        )
    ];
}

function render() {
    webjsx.applyDiff(root, App());
}

render();
