// Unified 247420 single-page app. Replaces the separate homepage,
// project_page, writing, and manifesto entry points with one WebJSX page
// that uses the design-system components and hash routing.
import { h, mount, installStyles, components as C, motion } from './index.js';

const data = {
    nav: [['works', '#/works'], ['writing', '#/writing'], ['manifesto', '#/manifesto'], ['source ↗', 'https://github.com/AnEntrypoint']],
    works: [
        { code: '001', title: 'gm', sub: 'state machine for coding agents', meta: '2025 · 3k★', body: 'a tiny deterministic state machine that lets llms code without losing their minds. it thinks so you don\'t have to (as much).' },
        { code: '002', title: 'zellous', sub: 'production push-to-talk', meta: '2024 · live', body: 'hold the button. talk. someone on the other side hears you. opus codec, dynamic rooms, 50-message replay.' },
        { code: '003', title: 'spoint', sub: 'spawnpoint', meta: '2024 · live', body: 'the directory for "where should we start?" one url, one room, everyone lands in the same place.' },
        { code: '004', title: 'flatspace', sub: 'flat-file cms', meta: 'wip', body: 'still figuring out what to say about this one. come back tuesday.' },
        { code: '005', title: 'thebird', sub: '—', meta: 'wip', body: 'yes, the name is a reference. no, we won\'t tell you to what.' },
        { code: '006', title: 'mcp-repl', sub: 'repl for mcp', meta: '2024 · live', body: 'executenodejs, executedeno, executebash, astgrep_search.' },
        { code: '007', title: 'mutagen', sub: 'adaptogen server', meta: '2024 · live', body: 'everything to do with a dapp deg3n. read the source.' },
        { code: '008', title: 'techshaman', sub: 'member site', meta: 'ongoing', body: 'the official website for the techshaman.' }
    ],
    posts: [
        { date: '2026.04.14', title: 'we were here first', tag: 'lore' },
        { date: '2026.03.22', title: 'gm v0.4 postmortem, or: why state machines', tag: 'gm' },
        { date: '2026.02.09', title: 'push-to-talk is a protocol, not a feature', tag: 'zellous' },
        { date: '2025.12.11', title: 'against the vibe-coded interface', tag: 'manifesto' },
        { date: '2025.10.03', title: 'notes on shipping weird', tag: 'notes' }
    ],
    manifesto: [
        { text: 'we are the creative department of the internet. always open (24/7). always a little bit high on possibility (420).' },
        { text: 'move fast. break things. document honestly. ship the rough draft. humor is load-bearing.' },
        { text: 'we will not tolerate simpleton design patterns, trifectas, gradients, or anything silly. nothing lame. we\'re internet natives and not easily pleased.', dim: true }
    ],
    currentlyShipping: [
        { title: 'gm', sub: 'state machine v0.4.1', meta: 'live', live: true },
        { title: 'zellous', sub: 'push-to-talk', meta: 'live', live: true },
        { title: 'thebird', sub: '—', meta: 'wip', live: false }
    ],
    project: {
        name: 'gm', tagline: 'state machine for coding agents. it thinks, so you don\'t have to (as much).',
        install: 'npx -y @anentrypoint/mcp-gm',
        receipt: [['status', 'live · ships tuesdays'], ['stars', '3,124'], ['license', 'MIT'], ['lang', 'typescript · deno'], ['size', '2.1mb'], ['deps', '0 runtime'], ['authors', 'the collective'], ['first commit', '2024.09.03']],
        changelog: [
            { date: '2026.04.20', ver: 'v0.4.1', msg: 'ship it. fixed the thing everyone complained about.' },
            { date: '2026.03.22', ver: 'v0.4.0', msg: 'new state machine runtime. broke everything on purpose.' },
            { date: '2026.02.09', ver: 'v0.3.7', msg: 'astgrep_search is now astgrep_enhanced_search.' },
            { date: '2025.12.11', ver: 'v0.3.0', msg: 'first public release. gm, world.' }
        ]
    }
};

const state = {
    route: parseRoute(),
    opened: -1,
    copied: false
};

function parseRoute() {
    const m = (location.hash || '#/').slice(1).split('/').filter(Boolean);
    return { page: m[0] || 'works', id: m[1] || null };
}

window.addEventListener('hashchange', () => {
    state.route = parseRoute();
    render();
    requestAnimationFrame(() => {
        motion.animateSelector('.app-main', 'fadeIn', { duration: 'var(--motion-base)' });
    });
});

let render;

function navigate(name) {
    location.hash = '#/' + name;
}

function topbar() {
    return C.Topbar({
        brand: '247420', leaf: 'an entrypoint',
        items: data.nav,
        active: state.route.page,
        onNav: navigate
    });
}

function crumb() {
    if (state.route.page === 'project') {
        return C.Crumb({
            trail: ['247420', 'gm'], leaf: 'overview',
            right: [C.Chip({ tone: 'accent', children: '● live' }), C.Chip({ tone: 'dim', children: 'v0.4.1' })]
        });
    }
    return C.Crumb({ trail: ['247420'], leaf: state.route.page });
}

function status() {
    return C.Status({
        left: ['main', '• 8 works', '• 5 posts'],
        right: ['probably emerging', h('a', { href: 'https://github.com/AnEntrypoint' }, 'source ↗')]
    });
}

function pageMain() {
    const r = state.route.page;
    if (r === 'project') {
        return C.ProjectView({
            project: data.project,
            copied: state.copied,
            onCopy: (cmd) => {
                navigator.clipboard?.writeText(cmd);
                state.copied = true;
                render();
                requestAnimationFrame(() => {
                    motion.animateSelector('.cli .copy', 'pulse', { duration: 'var(--motion-fast)' });
                });
                setTimeout(() => {
                    state.copied = false;
                    render();
                }, 1200);
            }
        });
    }
    if (r === 'writing') {
        return [C.Section({ title: '// recent writing', children: C.WritingList({ posts: data.posts }) })];
    }
    if (r === 'manifesto') {
        return [C.Section({ title: '// manifesto · rough draft', children: C.Manifesto({ paragraphs: data.manifesto }) })];
    }
    return C.HomeView({
        state, onNav: navigate,
        onToggleWork: (i) => {
            state.opened = i;
            render();
            if (i >= 0) {
                requestAnimationFrame(() => {
                    motion.animateSelector(`[data-work-index="${i}"]`, 'fadeInUp', { duration: 'var(--motion-fast)' });
                });
            }
        },
        works: data.works, posts: data.posts, manifesto: data.manifesto,
        currentlyShipping: data.currentlyShipping
    });
}

function App() {
    return C.AppShell({
        topbar: topbar(),
        crumb: crumb(),
        main: pageMain(),
        status: status(),
        narrow: state.route.page === 'project'
    });
}

await installStyles();
const root = document.getElementById('root');
render = mount(root, App);
requestAnimationFrame(() => {
    motion.animateSelector('.app-main', 'fadeIn', { duration: 'var(--motion-base)' });
});
