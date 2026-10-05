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
    { code: '001', title: 'gm', sub: 'state machine for coding agents', meta: '2025 · live', body: 'a small deterministic state machine that keeps an llm coding agent on a plan: it records state, gates each step and resumes after interruptions.', href: GH + 'gm', source: GH + 'gm' },
    { code: '002', title: 'zellous', sub: 'production push-to-talk', meta: '2024 · shipped', body: 'hold the button. talk. someone on the other side hears you. opus codec, dynamic rooms, 50-message replay.', href: GH + 'zellous', source: GH + 'zellous' },
    { code: '003', title: 'spoint', sub: 'spawnpoint', meta: '2024 · shipped', body: 'a spawn-point directory: one url opens one room and everyone who follows it lands in the same place.', href: GH + 'spoint', source: GH + 'spoint' },
    { code: '004', title: 'flatspace', sub: 'flat-file cms', meta: 'wip', body: 'a cms where every page is a yaml file in the repo. flatspace build renders them to static html and ships the result to gh-pages.', href: GH + 'flatspace', source: GH + 'flatspace' },
    { code: '005', title: 'thebird', sub: 'browser OS shell and agent runtime', meta: 'wip', body: 'a desktop-style shell that runs inside a browser tab, with an agent runtime next to the windows. no server to install.', href: GH + 'thebird', source: GH + 'thebird' },
    { code: '006', title: 'mcp-repl', sub: 'repl for mcp', meta: '2024 · live', body: 'an mcp server that exposes code execution (node, deno, bash) and ast search to an agent as tools.', href: GH + 'mcp-repl', source: GH + 'mcp-repl' },
    { code: '007', title: 'mutagen', sub: 'adaptogen server', meta: '2024 · live', body: 'a server for dapp and adaptogen experiments; the source is the documentation.', href: GH + 'mutagen', source: GH + 'mutagen' },
    { code: '008', title: 'techshaman', sub: 'member site', meta: 'ongoing', body: 'the member site for techshaman, maintained alongside the other projects.', href: GH + 'techshaman', source: GH + 'techshaman' }
];

const POST_HREF = '../blog/';
const posts = [
    { date: '2026.04.14', title: 'a short history of 247420', tag: 'lore', href: POST_HREF },
    { date: '2026.03.22', title: 'gm v0.4 postmortem, or: why state machines', tag: 'gm', href: POST_HREF },
    { date: '2026.02.09', title: 'push-to-talk over a shared voice channel', tag: 'zellous', href: POST_HREF },
    { date: '2025.12.11', title: 'why interfaces should state what they do', tag: 'manifesto', href: POST_HREF },
    { date: '2025.10.03', title: 'notes on shipping unusual projects', tag: 'notes', href: POST_HREF }
];

const manifesto = [
    { text: 'we are a small group that builds open-source tools and keeps them online every day.' },
    { text: 'ship early, say plainly what is unfinished, and write down what changed.' },
    { text: 'tokens define every color, radius and layer; every section states what the product does.', dim: true }
];

const state = { route: 'works', opened: 0 };

function ShippingBody() {
    return h('div', {}, ...shipping.map((s) => Row({
        key: s.name, cols: 'auto minmax(0, 1fr) auto', leading: Dot({ tone: s.live ? 'on' : 'off' }),
        title: s.name, sub: s.sub, meta: s.live ? 'live' : 'wip'
    })));
}

function App() {
    return AppShell({
        topbar: Topbar({
            brand: '247420', leaf: 'AnEntrypoint',
            items: navItems,
            active: state.route,
            onNav: (label) => { state.route = label; render(); }
        }),
        crumb: Crumb({ trail: ['247420'], leaf: state.route }),
        main: [
            Hero({
                title: 'tools for agents and live rooms.',
                body: '247420 builds a state machine for coding agents, push-to-talk rooms, a flat-file cms and a browser os shell. every project is open source on github.',
                actions: [
                    h('a', { key: 'works', class: 'btn btn-primary', href: '#works' }, 'browse the works')
                ],
                side: Panel({
                    title: 'currently shipping',
                    right: shipping.length + ' in flight',
                    children: ShippingBody()
                })
            }),
            Section({ id: 'works', title: 'works', children: WorksList({ works, openedIndex: state.opened, onToggle: (i) => { state.opened = i; render(); } }) }),
            Section({ id: 'writing', title: 'recent writing',
                children: WritingList({ posts }) }),
            Section({ id: 'manifesto', title: 'principles',
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
