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
        { glyph: Icon('link', { size: 14 }), label: 'source', href: 'https://github.com/AnEntrypoint/design' },
        { glyph: Icon('link', { size: 14 }), label: 'npm', href: 'https://www.npmjs.com/package/anentrypoint-design' },
        { glyph: Icon('link', { size: 14 }), label: 'full changelog', href: 'https://github.com/AnEntrypoint/design/blob/main/CHANGELOG.md' }
    ] }
];

const receiptRows = [
    ['status', 'published on npm'],
    ['version', '1.0.34'],
    ['license', 'MIT'],
    ['language', 'javascript (esm) + css'],
    ['components', '230 (84 helpers)'],
    ['kits', '22'],
    ['runtime deps', 'none declared'],
    ['first commit', '2026.09.03']
];

const changelog = [
    { date: 'unreleased', ver: 'feat', msg: 'token system restyled to a neutral grayscale palette; the hero is now a centered stack.' },
    { date: 'unreleased', ver: 'refactor', msg: 'chat kit merged into community-app, one kit for chat and community.' },
    { date: 'unreleased', ver: 'ci', msg: 'github pages workflow added: lint gates, build, deploy of the full static tree.' },
    { date: 'unreleased', ver: 'fix', msg: 'tooltip releases aria-describedby when the bubble hides.' },
    { date: 'unreleased', ver: 'fix', msg: 'appshell renders one banner landmark instead of two stacked headers.' }
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
            brand: '247420', leaf: 'design',
            items: [
                ['<- all projects', '../homepage/'],
                ...projectNavItems,
                ['source', 'https://github.com/AnEntrypoint/design']
            ]
        }),
        crumb: Crumb({ trail: ['247420', 'design'], leaf: 'readme' }),
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
                Heading({ level: 1, children: 'design' }),
                Lede({ children: 'tokens, components and kits for dense, tonal ui.' }),
                h('div', { class: 'ds-btn-row' }, Chip({ tone: 'accent', children: 'published' }), Chip({ tone: 'dim', children: 'v1.0.34' })),
                Section({ id: 'install', title: 'install',
                    children: Install({ cmd: 'npm install anentrypoint-design', copied: state.copied, onCopy: copyInstall }) }),
                Section({ id: 'receipt', title: 'receipt', children: Receipt({ rows: receiptRows }) }),
                Section({ id: 'changelog', title: 'changelog', children: Changelog({ entries: changelog }) })
            )
        ],
        status: Status({
            left: ['design', changelog.length + ' changes'],
            right: ['v1.0.34', 'MIT', 'sample data']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '14 Project page' });
