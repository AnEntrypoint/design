import * as webjsx from 'webjsx';
const h = webjsx.createElement;

const state = { route: 'works', opened: 0 };
const root = document.getElementById('root');

const nav = [['works','/'],['writing','/writing'],['manifesto','/manifesto'],['source','https://github.com/AnEntrypoint']];

function Header() {
    return h('header', { style: 'position:sticky;top:0;z-index:100;background:var(--panel-2);padding:10px 32px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:var(--ff-mono);font-size:13px' },
        h('div', { style: 'color:var(--panel-text);font-weight:600;letter-spacing:0.02em' }, '247420 / an entrypoint'),
        h('nav', { style: 'display:flex;gap:4px' },
            ...nav.map(([label, href]) =>
                h('a', {
                    key: label,
                    href,
                    onclick: (e) => { if (!href.startsWith('http')) { e.preventDefault(); state.route = label; render(); } },
                    style: `color:${state.route===label?'var(--panel-text)':'var(--panel-text-2)'};background:${state.route===label?'var(--panel-1)':'transparent'};text-decoration:none;padding:6px 12px;font-size:13px`
                }, label + (href.startsWith('http') ? ' ↗' : ''))
            )
        )
    );
}

function Hero() {
    return h('section', { style: 'padding:96px 48px 64px 48px' },
        h('div', { style: 'display:flex;justify-content:space-between;align-items:flex-end;gap:48px;flex-wrap:wrap;max-width:1200px' },
            h('div', {},
                h('div', { style: 'font-family:var(--ff-mono);font-size:12px;color:var(--panel-text-2);letter-spacing:0.08em;margin-bottom:28px' }, '// est. some time ago · still here · still weird'),
                h('h1', { style: 'font-family:var(--ff-display);font-size:clamp(56px, 11vw, 148px);line-height:0.98;letter-spacing:-0.03em;margin:0;color:var(--panel-text);font-weight:700' },
                    'we fart in its', h('br'), 'general direction.'
                ),
                h('p', { style: 'font-family:var(--ff-body);font-size:18px;line-height:1.55;color:var(--panel-text-2);margin-top:32px;max-width:46ch' },
                    '247420 is a creative collective. we ship fast, break things on purpose, and tow the front line of what the internet can be. ',
                    h('span', { style: 'color:var(--green-2);font-weight:500' }, 'always open.')
                )
            ),
            h('div', { style: 'display:flex;flex-direction:column;gap:14px;align-items:flex-end;min-width:220px;background:var(--panel-1);padding:20px 24px' },
                h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase' }, 'currently shipping'),
                h('div', { style: 'font-family:var(--ff-mono);font-size:15px;line-height:1.8;text-align:right;color:var(--panel-text)' },
                    h('div', {}, h('span', { style: 'color:var(--green-2)' }, '● '), 'gm v0.4.1'),
                    h('div', {}, h('span', { style: 'color:var(--green-2)' }, '● '), 'zellous'),
                    h('div', { style: 'color:var(--panel-text-3)' }, h('span', {}, '○ '), 'thebird (soon)')
                )
            )
        )
    );
}

const works = [
    { code:'001', title:'gm', sub:'state machine for coding agents', meta:'2025 · live · 3k★', body:'a tiny deterministic state machine that lets llms code without losing their minds. it thinks so you don\'t have to (as much).' },
    { code:'002', title:'zellous', sub:'production push-to-talk', meta:'2024 · live', body:'hold the button. talk. someone on the other side hears you. opus codec, dynamic rooms, 50-message replay. that\'s the whole pitch.' },
    { code:'003', title:'spoint', sub:'spawnpoint', meta:'2024 · live', body:'the directory for "where should we start?" one url, one room, everyone lands in the same place.' },
    { code:'004', title:'flatspace', sub:'—', meta:'wip', body:'still figuring out what to say about this one. come back tuesday.' },
    { code:'005', title:'thebird', sub:'—', meta:'wip', body:'yes, the name is a reference. no, we won\'t tell you to what.' },
    { code:'006', title:'mcp-repl', sub:'repl for mcp', meta:'2024 · live', body:'executenodejs, executedeno, executebash, astgrep_search. if you don\'t know what those are, this one isn\'t for you.' },
    { code:'007', title:'mutagen', sub:'adaptogen server', meta:'2024 · live', body:'everything to do with a dapp deg3n. read the source.' },
    { code:'008', title:'techshaman', sub:'member site', meta:'ongoing', body:'the official website for the techshaman. an entrypoint probably emerging.' }
];

function Works() {
    return h('section', { style: 'padding:80px 48px' },
        h('div', { style: 'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:28px;max-width:1200px' },
            h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase' }, 'the works · 08 of ~61'),
            h('a', { href: 'https://github.com/AnEntrypoint', style: 'font-family:var(--ff-mono);font-size:11px;color:var(--green-2);letter-spacing:0.14em;text-transform:uppercase;text-decoration:none' }, 'all repos ↗')
        ),
        h('div', { style: 'background:var(--panel-1);max-width:1200px' }, ...works.map((w, i) => {
            const isOpen = state.opened === i;
            return h('div', { key: i },
                h('button', {
                    onclick: () => { state.opened = isOpen ? null : i; render(); },
                    style: `width:100%;text-align:left;background:${isOpen?'var(--panel-3)':'transparent'};color:var(--panel-text);cursor:pointer;display:grid;grid-template-columns:80px 1fr auto;gap:24px;padding:18px 24px;align-items:baseline;font-family:inherit`,
                    onmouseenter: (e) => { if (!isOpen) e.currentTarget.style.background = 'var(--panel-hover)'; },
                    onmouseleave: (e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }
                },
                    h('span', { style: `font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em` }, w.code),
                    h('span', { style: 'display:flex;gap:16px;align-items:baseline;flex-wrap:wrap' },
                        h('span', { style: 'font-family:var(--ff-display);font-size:32px;line-height:1;color:var(--panel-text);font-weight:600' }, w.title),
                        h('span', { style: `font-family:var(--ff-mono);font-size:12px;color:var(--panel-text-2)` }, w.sub)
                    ),
                    h('span', { style: `font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.12em` }, w.meta + '  ' + (isOpen?'−':'+'))
                ),
                isOpen ? h('div', { style: 'background:var(--panel-2);color:var(--panel-text);padding:24px 24px 28px 104px' },
                    h('p', { style: 'font-family:var(--ff-body);font-size:16px;line-height:1.6;max-width:64ch;margin:0 0 20px 0;color:var(--panel-text)' }, w.body),
                    h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
                        h('a', { style: 'font-family:var(--ff-mono);font-size:12px;padding:8px 14px;background:var(--green);color:var(--green-fg);text-decoration:none;letter-spacing:0.08em', href: '#' }, 'open ↗'),
                        h('a', { style: 'font-family:var(--ff-mono);font-size:12px;padding:8px 14px;background:var(--panel-3);color:var(--panel-text);text-decoration:none;letter-spacing:0.08em', href: '#' }, 'source')
                    )
                ) : null
            );
        }))
    );
}

function Writing() {
    const posts = [
        { date:'2026.04.14', title:'we were here first', tag:'lore' },
        { date:'2026.03.22', title:'gm v0.4 postmortem, or: why state machines', tag:'gm' },
        { date:'2026.02.09', title:'push-to-talk is a protocol, not a feature', tag:'zellous' },
        { date:'2025.12.11', title:'against the vibe-coded interface', tag:'manifesto' },
        { date:'2025.10.03', title:'notes on shipping weird', tag:'notes' }
    ];
    return h('section', { style: 'padding:80px 48px' },
        h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:20px' }, 'recent writing'),
        h('div', { style: 'background:var(--panel-1);max-width:1200px' },
            ...posts.map((p, i) =>
                h('a', {
                    key: i,
                    href: '#',
                    style: `display:grid;grid-template-columns:110px 1fr 100px;gap:24px;padding:14px 24px;align-items:baseline;color:var(--panel-text);text-decoration:none`,
                    onmouseenter: (e) => { e.currentTarget.style.background = 'var(--panel-hover)'; },
                    onmouseleave: (e) => { e.currentTarget.style.background = 'transparent'; }
                },
                    h('span', { style: 'font-family:var(--ff-mono);font-size:12px;color:var(--panel-text-2)' }, p.date),
                    h('span', { style: 'font-family:var(--ff-body);font-size:17px;line-height:1.4;color:var(--panel-text)' }, p.title),
                    h('span', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--green-2);text-align:right;letter-spacing:0.08em' }, '§ ' + p.tag)
                )
            )
        )
    );
}

function Manifesto() {
    return h('section', { style: 'padding:96px 48px' },
        h('div', { style: 'font-family:var(--ff-mono);font-size:11px;color:var(--panel-text-2);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:36px' }, 'manifesto · rough draft · do not circulate'),
        h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:56px;max-width:1100px' },
            h('p', { style: 'font-family:var(--ff-display);font-size:clamp(36px,5vw,60px);line-height:1.05;letter-spacing:-0.02em;margin:0;color:var(--panel-text);font-weight:700' },
                'we make things.', h('br'), 'some of them work.', h('br'), 'a few become', h('br'), h('em', { style: 'color:var(--green-2)' }, 'the future.')
            ),
            h('div', { style: 'font-family:var(--ff-body);font-size:16px;line-height:1.7;color:var(--panel-text-2);max-width:48ch' },
                h('p', { style: 'margin:0 0 16px 0' }, 'we are the creative department of the internet. always open (24/7). always a little bit high on possibility (420).'),
                h('p', { style: 'margin:0 0 16px 0' }, 'move fast. break things. document honestly. ship the rough draft. ', h('strong', { style: 'color:var(--panel-text)' }, 'humor is load-bearing.')),
                h('p', { style: 'margin:0' }, 'we will not tolerate simpleton design patterns, trifectas, gradients, or anything silly. nothing lame. we\'re internet natives and not easily pleased.')
            )
        )
    );
}

function Footer() {
    return h('footer', { style: 'padding:24px 48px;background:var(--panel-2);color:var(--panel-text-2);font-family:var(--ff-mono);font-size:11px;letter-spacing:0.08em;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px' },
        h('span', {}, '247420 / mmxxvi · built in public'),
        h('span', {}, 'no cookies · no analytics · no gradients'),
        h('a', { href: 'https://github.com/AnEntrypoint', style: 'color:var(--green-2);text-decoration:none' }, 'source ↗')
    );
}

function App() {
    return [Header(), Hero(), Works(), Writing(), Manifesto(), Footer()];
}

function render() {
    webjsx.applyDiff(root, App());
}

render();
