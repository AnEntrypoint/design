import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, Side, AppShell, Heading } from 'ds/components/shell.js';
import { Panel, Row } from 'ds/components/content.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const corpus = [
    { code: 'kit', title: 'aicat',         sub: 'ai assistant with cat persona: ascii portrait and mood face', kind: 'kit',     href: '../aicat/' },
    { code: 'kit', title: 'community-app', sub: 'chat + community app: threads, composer, servers, voice',     kind: 'kit',     href: '../community-app/' },
    { code: 'kit', title: 'dashboard',     sub: 'kpis, tables, receipts, changelog, panels',                  kind: 'kit',     href: '../dashboard/' },
    { code: 'kit', title: 'file_browser',  sub: 'rails by file type, drop, preview',                          kind: 'kit',     href: '../file_browser/' },
    { code: 'kit', title: 'homepage',      sub: 'marquee + works grid editorial banner',                      kind: 'kit',     href: '../homepage/' },
    { code: 'kit', title: 'settings',      sub: 'sectioned forms, toggles, inputs, save bar',                 kind: 'kit',     href: '../settings/' },
    { code: 'kit', title: 'signin',        sub: 'auth panel, providers, magic link',                          kind: 'kit',     href: '../signin/' },
    { code: 'kit', title: 'terminal',      sub: 'cli prompt, command lines, log viewer',                      kind: 'kit',     href: '../terminal/' },
    { code: 'pre', title: 'buttons',       sub: 'primary · secondary · ghost',                   kind: 'preview', href: '../../preview/buttons.html' },
    { code: 'pre', title: 'colors-core',   sub: 'paper, ink, panel-N tonal stack',                            kind: 'preview', href: '../../preview/colors-core.html' },
    { code: 'pre', title: 'dropzone',      sub: 'tonal upload target',                                        kind: 'preview', href: '../../preview/dropzone.html' },
    { code: 'pre', title: 'file-viewer',   sub: 'modal preview · keyed head + body',                          kind: 'preview', href: '../../preview/file-viewer.html' },
    { code: 'pre', title: 'manifesto',     sub: 'long-form prose with editorial caps',                        kind: 'preview', href: '../../preview/manifesto.html' },
    { code: 'pre', title: 'type-display',  sub: 'display type ramp at the largest sizes',                     kind: 'preview', href: '../../preview/type-display.html' },
    { code: 'doc', title: 'README',        sub: 'overview, manifesto, conventions',                           kind: 'doc',     href: 'https://github.com/AnEntrypoint/design/blob/main/README.md' },
    { code: 'doc', title: 'SKILL',         sub: 'authoring rules for the agent',                              kind: 'doc',     href: 'https://github.com/AnEntrypoint/design/blob/main/SKILL.md' },
    { code: 'api', title: 'h / applyDiff', sub: 'webjsx createElement + diff',                                kind: 'api',     href: 'https://github.com/AnEntrypoint/design/blob/main/src/index.js' },
    { code: 'api', title: 'mountKit',      sub: 'ds shell + ui_kit bootstrap',                                kind: 'api',     href: 'https://github.com/AnEntrypoint/design/blob/main/src/bootstrap.js' },
    { code: 'api', title: 'renderMarkdown',sub: 'marked v15 + dompurify lazy stack',                          kind: 'api',     href: 'https://github.com/AnEntrypoint/design/blob/main/src/markdown.js' }
];

const kinds = ['all', 'kit', 'preview', 'doc', 'api'];

const state = { q: 'panel', kind: 'all' };

function score(item, q) {
    const t = (item.title + ' ' + item.sub).toLowerCase();
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return 1;
    let s = 0;
    for (const tok of tokens) {
        if (item.title.toLowerCase().includes(tok)) s += 3;
        if (t.includes(tok)) s += 1;
    }
    return s;
}

function results() {
    const filtered = corpus.filter((c) => state.kind === 'all' || c.kind === state.kind);
    return filtered.map((c) => ({ ...c, _s: score(c, state.q) }))
        .filter((c) => c._s > 0)
        .sort((a, b) => b._s - a._s);
}

function App() {
    const rows = results();
    return AppShell({
        topbar: Topbar({
            brand: '247420', leaf: 'search',
            items: [['index', '../../'], ['source', 'https://github.com/AnEntrypoint/design']],
            search: h('input', {
                class: 'input ds-topbar-search', value: state.q, placeholder: 'search kits, previews, docs, api…',
                oninput: (e) => { state.q = e.target.value; kit.render(); }
            })
        }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'search' }),
        side: Side({
            sections: [
                { group: 'kind', items: kinds.map((k) => ({
                    glyph: h('span', { class: state.kind === k ? 'ds-dot ds-dot-on' : 'ds-dot ds-dot-off' }), label: k,
                    count: k === 'all' ? corpus.length : corpus.filter((c) => c.kind === k).length,
                    href: '#' + k, active: state.kind === k, key: k,
                    onClick: (e) => { e.preventDefault(); state.kind = k; kit.render(); }
                })) },
                { group: 'recent', items: [
                    { glyph: '·', label: 'panel', key: 'q1', onClick: (e) => { e.preventDefault(); state.q = 'panel'; kit.render(); } },
                    { glyph: '·', label: 'rail',  key: 'q2', onClick: (e) => { e.preventDefault(); state.q = 'rail';  kit.render(); } },
                    { glyph: '·', label: 'chat',  key: 'q3', onClick: (e) => { e.preventDefault(); state.q = 'chat';  kit.render(); } },
                    { glyph: '·', label: 'auth',  key: 'q4', onClick: (e) => { e.preventDefault(); state.q = 'auth';  kit.render(); } }
                ] }
            ]
        }),
        main: [
            h('div', { class: 'ds-app-surface ds-section-pad' },
                Heading({ level: 1, children: rows.length + (rows.length === 1 ? ' result' : ' results') + (state.q.trim() ? ' for "' + state.q.trim() + '"' : '') }),
                rows.length ? Panel({ title: 'results', count: rows.length, class: 'ds-panel-gap', children:
                    rows.map((r, i) => Row({ key: 'r' + r.code + i, title: r.title, sub: r.sub, meta: r.kind, href: r.href, kind: 'link', highlight: state.q.trim() }))
                }) : Panel({ title: 'no results', class: 'ds-panel-gap', children: h('div', { class: 'ds-empty-state' },
                    h('div', { class: 'ds-empty-state-glyph' }, '( )'),
                    h('p', { class: 'ds-empty-state-msg' }, 'no matches for ', h('code', {}, '"' + state.q + '"')),
                    h('p', { class: 'ds-empty-state-hint' }, 'try a shorter query, or pick a different kind.')
                ) })
            )
        ],
        status: Status({
            left: ['search', '- kind=' + state.kind, '- ' + rows.length + ' rows'],
            right: ['sample index']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '12 Search' });
