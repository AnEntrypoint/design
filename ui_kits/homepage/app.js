import * as webjsx from 'webjsx';
import { mountKit } from 'ds/bootstrap.js';
import { AppShell, Topbar, Crumb, Status, Dot } from 'ds/components/shell.js';
import { Hero, Panel, Row, Section, WorksList, WritingList, Manifesto } from 'ds/components/content.js';

const h = webjsx.createElement;
const root = document.getElementById('root');

const navItems = [
    ['works', '#works'],
    ['writing', '#writing'],
    ['manifesto', '#manifesto'],
    ['source', 'https://github.com/AnEntrypoint']
];

const shipping = [
    { name: 'gm', sub: 'state machine v0.4.1', live: true },
    { name: 'zellous', sub: 'push-to-talk', live: true },
    { name: 'thebird', sub: 'browser OS shell and agent runtime', live: false }
];

const GH = 'https://github.com/AnEntrypoint/';
const works = [
    { code: '001', title: 'gm', sub: 'state machine for coding agents', meta: '2025 · live', body: 'a tiny deterministic state machine that lets llms code without losing their minds. it thinks so you don\'t have to (as much).', href: GH + 'gm', source: GH + 'gm' },
    { code: '002', title: 'zellous', sub: 'production push-to-talk', meta: '2024 · shipped', body: 'hold the button. talk. someone on the other side hears you. opus codec, dynamic rooms, 50-message replay.', href: GH + 'zellous', source: GH + 'zellous' },
    { code: '003', title: 'spoint', sub: 'spawnpoint', meta: '2024 · shipped', body: 'the directory for "where should we start?" one url, one room, everyone lands in the same place.', href: GH + 'spoint', source: GH + 'spoint' },
    { code: '004', title: 'flatspace', sub: 'flat-file cms', meta: 'wip', body: 'a cms where every page is a yaml file in the repo. flatspace build renders them to static html and ships the result to gh-pages.', href: GH + 'flatspace', source: GH + 'flatspace' },
    { code: '005', title: 'thebird', sub: 'browser OS shell and agent runtime', meta: 'wip', body: 'a desktop-style shell that runs inside a browser tab, with an agent runtime next to the windows. no server to install.', href: GH + 'thebird', source: GH + 'thebird' },
    { code: '006', title: 'mcp-repl', sub: 'repl for mcp', meta: '2024 · live', body: 'executenodejs, executedeno, executebash, astgrep_search. if you don\'t know what those are, this one isn\'t for you.', href: GH + 'mcp-repl', source: GH + 'mcp-repl' },
    { code: '007', title: 'mutagen', sub: 'adaptogen server', meta: '2024 · live', body: 'everything to do with a dapp deg3n. read the source.', href: GH + 'mutagen', source: GH + 'mutagen' },
    { code: '008', title: 'techshaman', sub: 'member site', meta: 'ongoing', body: 'the official website for the techshaman. an entrypoint probably emerging.', href: GH + 'techshaman', source: GH + 'techshaman' }
];

const POST_HREF = '../blog/';
const posts = [
    { date: '2026.04.14', title: 'we were here first', tag: 'lore', href: POST_HREF },
    { date: '2026.03.22', title: 'gm v0.4 postmortem, or: why state machines', tag: 'gm', href: POST_HREF },
    { date: '2026.02.09', title: 'push-to-talk is a protocol, not a feature', tag: 'zellous', href: POST_HREF },
    { date: '2025.12.11', title: 'against the vibe-coded interface', tag: 'manifesto', href: POST_HREF },
    { date: '2025.10.03', title: 'notes on shipping weird', tag: 'notes', href: POST_HREF }
];

const manifesto = [
    { text: 'we are the creative department of the internet. always open (24/7). always a little bit high on possibility (420).' },
    { text: 'move fast. break things. document honestly. ship the rough draft. humor is load-bearing.' },
    { text: 'we will not tolerate simpleton design patterns, trifectas, gradients, or anything silly. nothing lame. we\'re internet natives and not easily pleased.', dim: true }
];

const state = { route: 'works', opened: 0 };

function ShippingBody() {
    return h('div', {}, ...shipping.map((s) => Row({
        key: s.name, leading: Dot({ tone: s.live ? 'on' : 'off' }),
        title: s.name, sub: s.sub, meta: s.live ? 'live' : 'wip'
    })));
}

function App() {
    return AppShell({
        topbar: Topbar({
            brand: '247420', leaf: 'an entrypoint',
            items: navItems,
            active: state.route,
            onNav: (label) => { state.route = label; render(); }
        }),
        crumb: Crumb({ trail: ['247420'], leaf: state.route }),
        main: [
            Hero({
                title: 'the creative department of the internet.',
                body: '247420 is a collective of mercurials. we ship fast, break things on purpose, and document honestly.',
                accent: 'humor is load-bearing.'
            }),
            Panel({
                title: 'currently shipping',
                right: shipping.length + ' in flight',
                children: ShippingBody()
            }),
            Section({ id: 'works', title: 'works', children: WorksList({ works, openedIndex: state.opened, onToggle: (i) => { state.opened = i; render(); } }) }),
            Section({ id: 'writing', title: 'recent writing',
                children: WritingList({ posts }) }),
            Section({ id: 'manifesto', title: 'manifesto · rough draft',
                children: Manifesto({ paragraphs: manifesto }) })
        ],
        status: Status({
            left: ['main', works.length + ' works', posts.length + ' posts'],
            right: []
        })
    });
}

const kit = mountKit({ root, view: App, screen: '01 Homepage' });
function render() { kit.schedule(); }
