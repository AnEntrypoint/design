import * as webjsx from 'webjsx';
const h = webjsx.createElement;

const state = { route: 'works', opened: 0 };
const root = document.getElementById('root');

const nav = [['works','/'],['writing','/writing'],['manifesto','/manifesto'],['source','https://github.com/AnEntrypoint']];

function Header() {
    return h('header', { style: 'position:sticky;top:0;z-index:100;background:rgba(239,233,221,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid var(--ink);padding:14px 32px;display:flex;justify-content:space-between;align-items:baseline;gap:16px' },
        h('div', { class: 't-label' }, '247420 // AN ENTRYPOINT'),
        h('div', { class: 't-micro', style: 'flex:1;border-bottom:1px dotted var(--ink);align-self:center;margin:0 16px' }),
        h('nav', { style: 'display:flex;gap:24px', class: 't-label' },
            ...nav.map(([label, href]) =>
                h('a', {
                    key: label,
                    href,
                    onclick: (e) => { if (!href.startsWith('http')) { e.preventDefault(); state.route = label; render(); } },
                    style: `color:${state.route===label?'var(--acid-ink)':'var(--ink)'};background:${state.route===label?'var(--acid)':'transparent'};text-decoration:none;padding:2px 4px`
                }, label + (href.startsWith('http') ? ' ↗' : ''))
            )
        )
    );
}

function Hero() {
    return h('section', { style: 'padding:96px 32px 48px 32px;border-bottom:1px solid var(--ink)' },
        h('div', { style: 'display:flex;justify-content:space-between;align-items:flex-end;gap:48px;flex-wrap:wrap' },
            h('div', {},
                h('div', { class: 't-label', style: 'margin-bottom:24px' }, '// est. some time ago · still here · still weird'),
                h('h1', { class: 't-hero', style: 'font-size:clamp(56px, 11vw, 148px)' },
                    'we fart in its', h('br'), 'general direction.'
                ),
                h('div', { class: 't-meta', style: 'margin-top:24px;max-width:40ch' },
                    '247420 is a creative collective. we ship fast, break things on purpose, and tow the front line of what the internet can be. ',
                    h('span', { class: 'stamp acid', style: 'margin-left:8px' }, 'always open')
                )
            ),
            h('div', { style: 'display:flex;flex-direction:column;gap:12px;align-items:flex-end;min-width:200px' },
                h('div', { class: 't-micro' }, 'CURRENTLY SHIPPING'),
                h('div', { style: 'font-family:var(--ff-mono);font-size:22px;line-height:1.2;text-align:right' },
                    h('span', { style: 'color:var(--live)' }, '●'), ' gm v0.4.1', h('br'),
                    h('span', { style: 'color:var(--live)' }, '●'), ' zellous', h('br'),
                    h('span', { style: 'color:var(--fg-3)' }, '○'), ' thebird (soon)'
                )
            )
        )
    );
}

const works = [
    { code:'// 001', title:'gm', sub:'state machine for coding agents', meta:'2025 · live · 3k★', body:'a tiny deterministic state machine that lets llms code without losing their minds. it thinks so you don\'t have to (as much).' },
    { code:'// 002', title:'zellous', sub:'production push-to-talk', meta:'2024 · live', body:'hold the button. talk. someone on the other side hears you. opus codec, dynamic rooms, 50-message replay. that\'s the whole pitch.' },
    { code:'// 003', title:'spoint', sub:'spawnpoint', meta:'2024 · live', body:'the directory for "where should we start?" one url, one room, everyone lands in the same place.' },
    { code:'// 004', title:'flatspace', sub:'—', meta:'wip', body:'still figuring out what to say about this one. come back tuesday.' },
    { code:'// 005', title:'thebird', sub:'—', meta:'wip', body:'yes, the name is a reference. no, we won\'t tell you to what.' },
    { code:'// 006', title:'mcp-repl', sub:'repl for mcp', meta:'2024 · live', body:'executenodejs, executedeno, executebash, astgrep_search. if you don\'t know what those are, this one isn\'t for you.' },
    { code:'// 007', title:'mutagen', sub:'adaptogen server', meta:'2024 · live', body:'everything to do with a dapp deg3n. read the source.' },
    { code:'// 008', title:'techshaman', sub:'member site', meta:'ongoing', body:'the official website for the techshaman. an entrypoint probably emerging.' }
];

function Works() {
    return h('section', { style: 'padding:64px 32px' },
        h('div', { style: 'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px' },
            h('div', { class: 't-label' }, 'THE WORKS · 08 OF ~61'),
            h('a', { href: 'https://github.com/AnEntrypoint', class: 't-label', style: 'color:var(--ink)' }, 'all repos ↗')
        ),
        h('div', {}, ...works.map((w, i) => {
            const isOpen = state.opened === i;
            const btnStyle = `width:100%;text-align:left;background:${isOpen?'var(--ink)':'transparent'};color:${isOpen?'var(--paper)':'var(--ink)'};cursor:pointer;border:0;border-top:1px solid var(--ink);${i===works.length-1?'border-bottom:1px solid var(--ink);':''}display:grid;grid-template-columns:80px 1fr auto;gap:24px;padding:20px 0;align-items:baseline`;
            return h('div', { key: i },
                h('button', {
                    onclick: () => { state.opened = isOpen ? null : i; render(); },
                    class: 'row',
                    style: btnStyle
                },
                    h('span', { class: 'row-code', style: `color:${isOpen?'var(--paper)':'var(--fg-3)'}` }, w.code),
                    h('span', { style: 'display:flex;gap:16px;align-items:baseline;flex-wrap:wrap' },
                        h('span', { style: 'font-family:var(--ff-display);font-size:44px;line-height:1' }, w.title),
                        h('span', { class: 't-meta', style: `color:${isOpen?'#A9A396':'var(--fg-3)'}` }, w.sub)
                    ),
                    h('span', { class: 'row-meta', style: `color:${isOpen?'#A9A396':'var(--fg-3)'}` }, w.meta + ' ' + (isOpen?'—':'+'))
                ),
                isOpen ? h('div', { style: 'background:var(--ink);color:var(--paper);padding:0 32px 32px 112px;border-bottom:1px solid var(--ink)' },
                    h('p', { class: 't-prose', style: 'font-family:var(--ff-serif);font-size:22px;line-height:1.5;max-width:60ch;margin:0;padding-bottom:24px;color:var(--paper)' }, w.body),
                    h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap' },
                        h('a', { class: 'btn-stamp acid', style: 'text-decoration:none', href: '#' }, 'open ↗'),
                        h('a', { class: 'btn', style: 'color:var(--paper);border-color:var(--paper);text-decoration:none', href: '#' }, 'source')
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
    return h('section', { style: 'padding:0 32px 64px 32px' },
        h('div', { class: 't-label', style: 'margin-bottom:16px' }, 'RECENT WRITING'),
        ...posts.map((p, i) =>
            h('a', {
                key: i,
                href: '#',
                style: `display:grid;grid-template-columns:110px 1fr 80px;gap:24px;padding:14px 0;border-top:1px solid var(--ink);${i===posts.length-1?'border-bottom:1px solid var(--ink);':''}align-items:baseline;color:var(--ink);text-decoration:none`,
                onmouseenter: (e) => { e.currentTarget.style.background = 'var(--acid)'; },
                onmouseleave: (e) => { e.currentTarget.style.background = 'transparent'; }
            },
                h('span', { class: 't-meta' }, p.date),
                h('span', { style: 'font-family:var(--ff-serif);font-size:22px;font-style:italic' }, p.title),
                h('span', { class: 't-meta', style: 'text-align:right' }, '§ ' + p.tag)
            )
        )
    );
}

function Manifesto() {
    return h('section', { style: 'padding:64px 32px;background:var(--ink);color:var(--paper)' },
        h('div', { class: 't-label', style: 'color:var(--paper);margin-bottom:32px' }, 'MANIFESTO · ROUGH DRAFT · DO NOT CIRCULATE'),
        h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:1100px' },
            h('p', { style: 'font-family:var(--ff-display);font-size:56px;line-height:1.05;letter-spacing:-0.02em;margin:0;color:var(--paper)' },
                'we make things.', h('br'), 'some of them work.', h('br'), 'a few become', h('br'), h('em', {}, 'the future.')
            ),
            h('div', { style: 'font-family:var(--ff-serif);font-size:18px;line-height:1.65;color:#A9A396;max-width:48ch' },
                h('p', {}, 'we are the creative department of the internet. always open (24/7). always a little bit high on possibility (420).'),
                h('p', {}, 'move fast. break things. document honestly. ship the rough draft. ', h('strong', { style: 'color:var(--paper)' }, 'humor is load-bearing.')),
                h('p', {}, 'we will not tolerate simpleton design patterns, trifectas, gradients, or anything silly. nothing lame. we\'re internet natives and not easily pleased.')
            )
        )
    );
}

function Footer() {
    return h('footer', { style: 'padding:32px;border-top:1px solid var(--ink)' },
        h('div', { class: 'dateline' },
            h('span', {}, '247420 / MMXXVI'),
            h('span', {}, 'BUILT IN PUBLIC'),
            h('span', { class: 'spread' }),
            h('span', {}, 'NO COOKIES · NO ANALYTICS · NO GRADIENTS'),
            h('span', { class: 'spread' }),
            h('span', {}, h('a', { href: 'https://github.com/AnEntrypoint', style: 'color:var(--ink);text-decoration:underline' }, 'SOURCE ↗'))
        )
    );
}

function App() {
    return [Header(), Hero(), Works(), Writing(), Manifesto(), Footer()];
}

function render() {
    webjsx.applyDiff(root, App());
}

render();
