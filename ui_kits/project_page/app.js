import * as webjsx from 'webjsx';
const h = webjsx.createElement;

const state = { copied: false };
const root = document.getElementById('root');

function Bar() {
    return h('header', { style: 'position:sticky;top:0;z-index:100;background:var(--panel-2);padding:10px 32px;display:flex;justify-content:space-between;gap:16px;align-items:center;font-family:var(--ff-mono);font-size:13px' },
        h('a', { href: '#', style: 'color:var(--panel-text);text-decoration:none;font-weight:600' }, '← 247420'),
        h('nav', { style: 'display:flex;gap:4px' },
            h('a', { href: '#', style: 'color:var(--panel-text-2);text-decoration:none;padding:6px 12px' }, 'readme'),
            h('a', { href: '#', style: 'color:var(--panel-text);background:var(--panel-1);padding:6px 12px;text-decoration:none' }, 'docs'),
            h('a', { href: '#', style: 'color:var(--panel-text-2);text-decoration:none;padding:6px 12px' }, 'source ↗')
        )
    );
}

function ProjectHero({ mark, tagline, version, status }) {
    return h('section', { style: 'padding:80px 48px' },
        h('div', { style: 'display:flex;gap:16px;align-items:center;margin-bottom:28px;font-family:var(--ff-mono);font-size:11px;letter-spacing:0.14em;text-transform:uppercase' },
            h('span', { style: 'color:var(--panel-text-2)' }, 'project'),
            h('span', { style: 'color:var(--green-2)' }, '● ' + status),
            h('span', { style: 'color:var(--panel-text-2)' }, version)
        ),
        h('div', { style: 'font-family:var(--ff-mono);font-size:clamp(96px,18vw,220px);line-height:0.95;letter-spacing:-0.04em;color:var(--panel-text);font-weight:500' }, mark),
        h('p', { style: 'font-family:var(--ff-display);font-size:36px;line-height:1.2;margin:24px 0 0 0;max-width:22ch;color:var(--panel-text-2);font-weight:500' }, tagline)
    );
}

function Receipt({ rows }) {
    return h('section', { style: 'padding:72px 48px' },
        h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:20px' }, 'receipt'),
        h('div', { style: 'background:var(--panel-1);max-width:640px' },
            ...rows.map(([k, v], i) => h('div', { key: i, style: `display:grid;grid-template-columns:160px 1fr;gap:16px;padding:10px 20px;font-family:var(--ff-mono);font-size:13px;background:${i%2?'var(--panel-2)':'transparent'};color:var(--panel-text)` },
                h('span', { style: 'color:var(--panel-text-2);text-transform:uppercase;letter-spacing:0.12em;font-size:11px;align-self:center' }, k),
                h('span', {}, v)
            ))
        )
    );
}

function Install({ cmd }) {
    return h('section', { style: 'padding:72px 48px' },
        h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:20px' }, 'install'),
        h('div', { style: 'display:flex;align-items:stretch;max-width:720px;background:var(--panel-1)' },
            h('span', { style: 'font-family:var(--ff-mono);padding:16px 18px;color:var(--green-2);font-size:14px' }, '$'),
            h('code', { style: 'flex:1;font-family:var(--ff-mono);font-size:14px;padding:16px 0;color:var(--panel-text);background:transparent' }, cmd),
            h('button', {
                onclick: () => { navigator.clipboard?.writeText(cmd); state.copied = true; render(); setTimeout(() => { state.copied = false; render(); }, 1200); },
                style: `font-family:var(--ff-mono);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:0 24px;background:${state.copied?'var(--green)':'var(--panel-3)'};color:${state.copied?'var(--green-fg)':'var(--panel-text)'};cursor:pointer`
            }, state.copied ? 'copied' : 'copy')
        )
    );
}

function Changelog({ entries }) {
    return h('section', { style: 'padding:72px 48px' },
        h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:20px' }, 'changelog'),
        h('div', { style: 'background:var(--panel-1);max-width:900px' }, ...entries.map((e, i) =>
            h('div', { key: i, style: `display:grid;grid-template-columns:110px 80px 1fr;gap:20px;padding:14px 24px;color:var(--panel-text);align-items:baseline;background:${i%2?'var(--panel-2)':'transparent'}` },
                h('span', { style: 'font-family:var(--ff-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--panel-text-2)' }, e.date),
                h('span', { style: 'font-family:var(--ff-mono);font-size:13px;color:var(--green-2)' }, e.ver),
                h('span', { style: 'font-family:var(--ff-body);font-size:15px;line-height:1.5' }, e.msg)
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
        h('footer', { style: 'padding:24px 48px;background:var(--panel-2);color:var(--panel-text-2);font-family:var(--ff-mono);font-size:11px;letter-spacing:0.08em;display:flex;justify-content:space-between;gap:16px' },
            h('span', {}, '247420 / mmxxvi · built in public'),
            h('span', {}, 'no cookies · no analytics · no gradients')
        )
    ];
}

function render() {
    webjsx.applyDiff(root, App());
}

render();
