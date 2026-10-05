import * as webjsx from 'webjsx';
import { mountKit } from 'ds/bootstrap.js';
import { AppShell, Topbar, Crumb, Side, Status, Chip, Heading, Lede, Icon } from 'ds/components/shell.js';
import { Section, Install, Receipt, Changelog } from 'ds/components/content.js';

const h = webjsx.createElement;
const root = document.getElementById('root');
const state = { copied: false };

const sideSections = [
    { group: 'project', items: [
        { glyph: Icon('download', { size: 14 }), label: 'install', anchor: 'install' },
        { glyph: Icon('clipboard', { size: 14 }), label: 'receipt', anchor: 'receipt' },
        { glyph: Icon('page', { size: 14 }), label: 'changelog', anchor: 'changelog' }
    ] },
    { group: 'links', items: [
        { glyph: Icon('link', { size: 14 }), label: 'source', href: 'https://github.com/AnEntrypoint' },
        { glyph: Icon('link', { size: 14 }), label: 'npm', href: 'https://www.npmjs.com/package/@anentrypoint/mcp-gm' },
        { glyph: Icon('link', { size: 14 }), label: 'releases', href: 'https://github.com/AnEntrypoint/releases' }
    ] }
];

const receiptRows = [
    ['status', 'live · ships tuesdays'],
    ['stars', '3,124'],
    ['license', 'MIT'],
    ['lang', 'typescript · deno'],
    ['size', '2.1mb'],
    ['deps', '0 runtime'],
    ['authors', 'the collective'],
    ['first commit', '2024.09.03']
];

const changelog = [
    { date: '2026.04.20', ver: 'v0.4.1', msg: 'ship it. fixed the thing everyone complained about.' },
    { date: '2026.03.22', ver: 'v0.4.0', msg: 'new state machine runtime. broke everything on purpose. read the postmortem.' },
    { date: '2026.02.09', ver: 'v0.3.7', msg: 'astgrep_search is now astgrep_enhanced_search. you will adapt.' },
    { date: '2025.12.11', ver: 'v0.3.0', msg: 'first public release. gm, world.' }
];

function copyInstall(cmd) {
    navigator.clipboard?.writeText(cmd);
    state.copied = true; kit.render();
    setTimeout(() => { state.copied = false; kit.render(); }, 1200);
}

const projectNavItems = sideSections[0].items.map((it) => [it.label, '#' + it.anchor]);

function App() {
    return AppShell({
        topbar: Topbar({
            brand: '247420', leaf: 'gm',
            items: [
                ['<- all projects', '../homepage/'],
                ...projectNavItems,
                ['source', 'https://github.com/AnEntrypoint']
            ]
        }),
        crumb: Crumb({ trail: ['247420', 'gm'], leaf: 'readme' }),
        side: Side({
            sections: [
                ...sideSections.map((sec) => ({
                    group: sec.group,
                    items: sec.items.map((it, i) => ({
                        key: sec.group + i, glyph: it.glyph, label: it.label,
                        href: it.href || '#' + it.anchor
                    }))
                }))
            ]
        }),
        main: [
            h('div', { class: 'ds-app-surface ds-section ds-section-pad' },
                Heading({ level: 1, children: 'gm' }),
                Lede({ children: 'state machine for coding agents. it thinks, so you don\'t have to (as much).' }),
                h('div', { class: 'ds-btn-row' }, Chip({ tone: 'accent', children: 'shipping' }), Chip({ tone: 'dim', children: 'v0.4.1' })),
                Section({ id: 'install', title: 'install',
                    children: Install({ cmd: 'npx -y @anentrypoint/mcp-gm', copied: state.copied, onCopy: copyInstall }) }),
                Section({ id: 'receipt', title: 'receipt', children: Receipt({ rows: receiptRows }) }),
                Section({ id: 'changelog', title: 'changelog', children: Changelog({ entries: changelog }) })
            )
        ],
        status: Status({
            left: ['gm', '- ' + changelog.length + ' releases'],
            right: ['v0.4.1', 'MIT', 'sample data']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '14 Project page' });
