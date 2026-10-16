import * as webjsx from '../../../vendor/webjsx/index.js';
import { trapTab } from '../overlay-primitives.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

export function toggleWs(which, fromEl) {
    const shell = (fromEl && fromEl.closest && fromEl.closest('.ws-shell')) || document.querySelector('.ws-shell');
    if (!shell) return;
    const cls = which === 'pane' ? 'ws-pane-collapsed'
        : which === 'sessions' ? 'ws-sessions-collapsed'
        : 'ws-rail-collapsed';
    const nowCollapsed = shell.classList.toggle(cls);
    if (nowCollapsed) shell.style.removeProperty('--ws-' + which + '-w');
    shell.querySelectorAll('.ws-' + which + '-toggle').forEach((btn) => {
        btn.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
        const nextLabel = nowCollapsed ? 'expand ' + which : 'collapse ' + which;
        btn.setAttribute('aria-label', nextLabel);
        btn.setAttribute('title', nextLabel);
    });
    attempt(() => { localStorage.setItem('ds.ws.' + which, nowCollapsed ? 'collapsed' : 'open'); });
    if (!nowCollapsed) seedWsWidths(shell);
}

const WS_RESIZE_CLAMP = { rail: [200, 320], sessions: [248, 520], pane: [288, 640] };
function wsResize(col, dx, persist = true, fromEl) {
    const shell = (fromEl && fromEl.closest && fromEl.closest('.ws-shell')) || document.querySelector('.ws-shell');
    if (!shell) return;
    const track = shell.querySelector('.ws-' + col);
    const cur = track ? track.getBoundingClientRect().width : 0;
    const [lo, hi] = WS_RESIZE_CLAMP[col] || [120, 600];
    const next = Math.max(lo, Math.min(hi, Math.round(cur + dx)));
    shell.style.setProperty('--ws-' + col + '-w', next + 'px');
    const handle = shell.querySelector('.ws-resizer-' + col);
    if (handle) { handle.setAttribute('aria-valuenow', String(next)); handle.setAttribute('aria-valuetext', next + ' pixels'); }
    if (persist) { attempt(() => { localStorage.setItem('ds.ws.w.' + col, String(next)); }); }
}
const WS_VW_CAP = { rail: '20vw', sessions: '30vw', pane: '32vw' };
export function seedWsWidths(el) {
    if (!el) return;
    ['rail', 'sessions', 'pane'].forEach((col) => {
        attempt(() => { if (wsCollapsed(col, false)) return; const v = localStorage.getItem('ds.ws.w.' + col); if (v && /^\d+$/.test(v)) el.style.setProperty('--ws-' + col + '-w', `min(${v}px, ${WS_VW_CAP[col]})`); });
    });
}
export function WsResizer(col) {
    const onKey = (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); wsResize(col, -16, true, e.currentTarget); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); wsResize(col, 16, true, e.currentTarget); }
    };
    const onDown = (e) => {
        e.preventDefault();
        const handleEl = e.currentTarget;
        handleEl.classList.add('ws-resizer-active');
        let lastX = e.clientX;
        const move = (ev) => { const dx = ev.clientX - lastX; lastX = ev.clientX; wsResize(col, dx, false, handleEl); };
        const up = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            document.body.style.cursor = '';
            handleEl.classList.remove('ws-resizer-active');
            wsResize(col, 0, true, handleEl);
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
        document.body.style.cursor = 'col-resize';
    };
    const [lo, hi] = WS_RESIZE_CLAMP[col] || [120, 600];
    const seedNow = (el) => {
        if (!el) return;
        const measure = () => {
            const shell = el.closest('.ws-shell');
            const track = shell && shell.querySelector('.ws-' + col);
            if (!track) return;
            const w = Math.round(track.getBoundingClientRect().width);
            if (!w) return;
            el.setAttribute('aria-valuenow', String(w));
            el.setAttribute('aria-valuetext', w + ' pixels');
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(measure);
        else measure();
    };
    return h('div', {
        class: 'ws-resizer ws-resizer-' + col, role: 'separator', tabindex: '0',
        'aria-orientation': 'vertical', 'aria-label': 'resize ' + col + ' column (arrow keys)',
        'aria-valuemin': String(lo), 'aria-valuemax': String(hi),
        'aria-valuenow': String(lo), 'aria-valuetext': String(lo) + ' pixels',
        onpointerdown: onDown, onkeydown: onKey, ref: seedNow,
    });
}

export function toggleWsDrawer(which, open, fromEl) {
    const shell = (fromEl && fromEl.closest && fromEl.closest('.ws-shell')) || document.querySelector('.ws-shell');
    if (!shell) return;
    const cls = which === 'pane' ? 'ws-pane-open' : 'ws-sessions-open';
    const other = which === 'pane' ? 'ws-sessions-open' : 'ws-pane-open';
    const next = open != null ? open : !shell.classList.contains(cls);
    shell.classList.toggle(cls, next);
    if (next) shell.classList.remove(other);
    const btn = shell.querySelector('.ws-' + which + '-drawer-toggle');
    if (btn) btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    if (!next) { removeWsDrawerHandlers(shell); return; }
    const drawer = shell.querySelector(which === 'pane' ? '.ws-pane' : '.ws-sessions');
    const focusable = drawer && drawer.querySelector('button, a, input, [tabindex]');
    if (focusable) attempt(() => { focusable.focus(); });
    removeWsDrawerHandlers(shell);
    const onKey = (e) => {
        if (e.key === 'Escape') { toggleWsDrawer(which, false, shell); if (btn) attempt(() => { btn.focus(); }); return; }
        if (drawer) trapTab(drawer, e);
    };
    shell._wsEscHandler = onKey;
    document.addEventListener('keydown', onKey);
    const mq = window.matchMedia('(max-width: 1480px)');
    const onMq = () => { if (!mq.matches) closeWsDrawers(shell); };
    shell._wsDrawerMq = { mq, onMq };
    mq.addEventListener('change', onMq);
}
function removeWsDrawerHandlers(shell) {
    if (shell._wsEscHandler) { document.removeEventListener('keydown', shell._wsEscHandler); shell._wsEscHandler = null; }
    if (shell._wsDrawerMq) { shell._wsDrawerMq.mq.removeEventListener('change', shell._wsDrawerMq.onMq); shell._wsDrawerMq = null; }
}
export function closeWsDrawers(fromEl) {
    const shell = (fromEl && fromEl.closest && fromEl.closest('.ws-shell')) || document.querySelector('.ws-shell');
    if (!shell) return;
    shell.classList.remove('ws-sessions-open', 'ws-pane-open');
    shell.querySelectorAll('.ws-sessions-drawer-toggle, .ws-pane-drawer-toggle').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    removeWsDrawerHandlers(shell);
}

export function wsCollapsed(which, fallback) {
    const stored = attempt(() => localStorage.getItem('ds.ws.' + which), null);
    if (stored === 'collapsed') return true;
    if (stored === 'open') return false;
    return !!fallback;
}
