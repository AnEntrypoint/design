import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, Side, AppShell, Heading, Lede, Icon, Badge } from 'ds/components/shell.js';
import { Panel, Sparkline, BarChart, Table, Receipt, Changelog, Row } from 'ds/components/content.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const kpis = [
    ['24,891', 'requests · 24h', { delta: '+12.4%', tone: 'up',   spark: [8, 11, 9, 14, 16, 15, 19, 22, 20, 24] }],
    ['184ms',  'avg latency · p50', { delta: '-6.1%', tone: 'down', invert: true, spark: [210, 204, 199, 201, 196, 192, 190, 188, 186, 184] }],
    ['0.42%',  'error rate · 5xx+4xx', { delta: '+0.08%', tone: 'up', invert: true, spark: [34, 41, 36, 33, 38, 45, 39, 35, 40, 42] }],
    ['94.7%',  'cache hit · edge', { delta: '+1.2%', tone: 'up', spark: [941, 947, 939, 944, 937, 946, 942, 945, 940, 947] }]
];

function Delta({ delta, tone, invert }) {
    const rising = tone !== 'down';
    const better = invert ? !rising : rising;
    return h('span', { class: 'kpi-delta kpi-delta-' + (better ? 'up' : 'down') },
        Icon(rising ? 'arrow-up' : 'arrow-down', { size: 12 }),
        delta,
        h('span', { class: 'sr-only' }, better ? ' (better)' : ' (worse)'));
}

function Metrics() {
    return h('div', { class: 'ds-metric-list' }, ...kpis.map(([value, label, meta], i) =>
        h('div', { key: 'm' + i, class: 'ds-metric-item' },
            h('span', { class: 'ds-metric-item-lbl' }, label),
            h('span', { class: 'ds-metric-item-num' }, value),
            Delta(meta),
            h('span', { class: 'ds-metric-item-spark' },
                meta.spark ? Sparkline({ values: meta.spark, width: 96, height: 28, tone: 'up' }) : null))));
}

const channelBreakdown = [
    { label: 'edge cache', value: 412, display: '412 rps' },
    { label: 'origin fetch', value: 187, display: '187 rps' },
    { label: 'feed api', value: 1200, display: '1.2k rps' },
    { label: 'upload api', value: 24, display: '24 rps' }
];

const tableHeaders = ['endpoint', 'p95', 'status'];
const ok = () => Badge({ tone: 'success', size: 'sm', children: 'ok' });
const tableRows = [
    ['GET /api/users',     '92ms',  ok()],
    ['POST /api/sessions', '218ms', Badge({ tone: 'sun', size: 'sm', children: '2 errors' })],
    ['GET /api/feed',      '144ms', ok()],
    ['POST /api/upload',   '1.4s',  Badge({ tone: 'flame', size: 'sm', children: '11 errors' })],
    ['DELETE /api/cache',  '38ms',  ok()]
];

function fallbackCopy(text) {
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select();
    document.execCommand('copy'); document.body.removeChild(t);
}
function copyCommit(e) {
    const btn = e.currentTarget;
    const text = btn.dataset.commit;
    const done = () => {
        btn.textContent = 'copied';
        setTimeout(() => { btn.textContent = text; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => { attempt(() => { fallbackCopy(text); done(); }); });
    } else {
        attempt(() => { fallbackCopy(text); done(); });
    }
}
const COMMIT_HASH = 'b9a2e83';
const receipt = [
    ['environment', 'github pages'],
    ['build',       'v1.0.34'],
    ['deployed',    '2026-10-05'],
    ['commit',      h('button', { type: 'button', class: 'btn-link', 'data-commit': COMMIT_HASH, 'aria-label': 'copy commit hash ' + COMMIT_HASH, onclick: copyCommit },
        Icon('copy', { size: 12 }), COMMIT_HASH)],
    ['by',          'lanmower']
];

const changelog = [
    { date: '2026-10-05', ver: 'b9a2e83', msg: 'layout polish · token-only css · plain copy' },
    { date: '2026-10-05', ver: '464ef30', msg: 'plain copy · restrained heroes · truthful docs' },
    { date: '2026-10-05', ver: '5a2bb35', msg: 'polish pass · contrast gate' }
];

const events = [
    { title: 'deploy succeeded',  sub: 'v1.0.34 · pages',  meta: '2m',  rail: 'green' },
    { title: 'cache flushed',     sub: 'edge cache · pages', meta: '14m' },
    { title: 'p95 spike',         sub: '/api/upload · 1.4s',     meta: '38m', rail: 'flame' },
    { title: 'cron ran',          sub: 'reindex-search · ok',    meta: '1h',  rail: 'green' },
    { title: 'config reloaded',   sub: 'feature flags',          meta: '3h' }
];

function EventsPanel() {
    return h('div', {}, ...events.map((e, i) => Row({ key: 'ev' + i, title: e.title, sub: e.sub, meta: e.meta, rail: e.rail })));
}

function App() {
        return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'dashboard', items: [['index', '../../'], ['docs', '../docs/'], ['source', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'dashboard' }),
        side: Side({
            sections: [
                { group: 'views', items: [
                    { glyph: Icon('activity', { size: 14 }), label: 'overview',      key: 'o', href: '#p-metrics' },
                    { glyph: Icon('rows', { size: 14 }), label: 'endpoints',     key: 'r', href: '#p-endpoints' },
                    { glyph: Icon('info', { size: 14 }), label: 'events',        key: 'e', href: '#p-events' },
                    { glyph: Icon('page', { size: 14 }), label: 'changelog',     key: 'c', href: '#p-changelog' }
                ] },
                { group: 'env', items: [
                    { glyph: h('span', { class: 'ds-dot ds-dot-on' }), label: 'production', count: 'eu', key: 'p', color: 'var(--panel-accent)', href: '#p-environment' },
                    { glyph: h('span', { class: 'ds-dot ds-dot-off' }), label: 'staging',   count: 'us', key: 's', color: 'var(--alt)', href: '#p-environment' }
                ] }
            ]
        }),
        main: [
            h('div', { class: 'ds-app-surface ds-section-pad', 'data-density': 'comfortable' },
                Heading({ level: 1, children: 'production overview' }),
                Lede({ children: 'traffic, endpoint latency and recent deploys for the last 24 hours.' }),
                Panel({ id: 'p-metrics', title: 'live metrics', class: 'ds-panel-gap', children: Metrics() }),
                h('div', { class: 'ds-panel-duo' },
                    Panel({ title: 'traffic by channel', class: 'ds-panel-flush', children: BarChart({ items: channelBreakdown }) }),
                    Panel({ id: 'p-endpoints', title: 'top endpoints', class: 'ds-panel-flush', children: Table({ headers: tableHeaders, rows: tableRows, striped: true }) })
                ),
                h('div', { class: 'ds-panel-trio' },
                    Panel({ id: 'p-environment', title: 'environment', class: 'ds-panel-flush', children: Receipt({ rows: receipt }) }),
                    Panel({ id: 'p-events', title: 'recent events', class: 'ds-panel-flush', children: EventsPanel() }),
                    Panel({ id: 'p-changelog', title: 'changelog', class: 'ds-panel-flush', children: Changelog({ entries: changelog }) })
                )
            )
        ],
        status: Status({
            left: ['dashboard', kpis.length + ' kpis', tableRows.length + ' endpoints'],
            right: ['sample data']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '08 Dashboard' });
