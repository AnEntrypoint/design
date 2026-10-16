import * as webjsx from '../../../vendor/webjsx/index.js';
import { trapTab } from '../overlay-primitives.js';
import { Brand, Glyph } from './atoms.js';
import { Icon } from './icons.js';
import { ThemeToggle } from '../theme-toggle.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

export function Topbar({ brand = '247420', leaf = '', items = [], active = '', onNav, search, themeToggle = true } = {}) {
    const isElement = search && typeof search === 'object' && 'type' in search;
    return h('header', { class: 'app-topbar', role: 'banner' },
        Brand({ name: brand, leaf }),
        isElement ? search : (search ? h('label', { class: 'app-search' },
            h('span', { class: 'icon', 'aria-hidden': 'true' }, Icon('search', { size: 15 })),
            h('input', { type: 'search', name: 'q', placeholder: search, 'aria-label': `search ${search}` })
        ) : null),
        h('nav', { 'aria-label': 'main navigation' }, ...items.map(([label, href]) => {
            const cleanLabel = String(label).replace(' ->', '');
            return h('a', {
                key: label,
                href,
                class: active === cleanLabel ? 'active' : '',
                'aria-current': active === cleanLabel ? 'page' : null,
                'aria-label': cleanLabel !== String(label) ? cleanLabel : null,
                onclick: (e) => {
                    if (!String(href).startsWith('http') && onNav) {
                        e.preventDefault();
                        onNav(cleanLabel);
                        if (String(href).startsWith('#')) {
                            const target = document.getElementById(href.slice(1));
                            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }
            }, label);
        })),
        themeToggle ? h('div', { class: 'app-topbar-theme' }, ThemeToggle({ compact: true })) : null
    );
}

export function Crumb({ trail = [], leaf = '', right } = {}) {
    const parts = [];
    trail.forEach((t, i) => {
        parts.push(h('span', { key: 't' + i }, t));
        parts.push(h('span', { key: 's' + i, class: 'sep' }, '/'));
    });
    parts.push(h('span', { key: 'leaf', class: 'leaf' }, leaf));
    if (right) parts.push(h('span', { key: 'r', class: 'crumb-right' }, ...(Array.isArray(right) ? right : [right])));
    return h('div', { class: 'app-crumb' }, ...parts);
}

function onSideLinkKeyDown(e) {
    let dir = 0;
    if (e.key === 'ArrowDown') dir = 1;
    else if (e.key === 'ArrowUp') dir = -1;
    else if (e.key === 'Home' || e.key === 'End') dir = e.key === 'Home' ? 'first' : 'last';
    else return;
    const side = e.currentTarget.closest('.app-side');
    if (!side) return;
    const links = Array.from(side.querySelectorAll('a'));
    const curIdx = links.indexOf(e.currentTarget);
    if (curIdx === -1) return;
    e.preventDefault();
    let nextIdx;
    if (dir === 'first') nextIdx = 0;
    else if (dir === 'last') nextIdx = links.length - 1;
    else nextIdx = (curIdx + dir + links.length) % links.length;
    const next = links[nextIdx];
    if (next) next.focus();
}

export function Side({ sections = [] } = {}) {
    return h('aside', { class: 'app-side', role: 'navigation', 'aria-label': 'sidebar navigation' }, ...sections.map(sec => {
        const groupId = 'side-group-' + String(sec.group).replace(/\W+/g, '-').toLowerCase();
        return h('div', { class: 'app-side-group', key: sec.group, role: 'group', 'aria-labelledby': groupId },
            h('div', { class: 'group', id: groupId }, sec.group),
            ...sec.items.map((item, i) => {
                const { glyph, label, href, active, count, color, onClick, ariaLabel, indent } = item;
                const countLabel = (count != null && count !== 0 && count !== '0') ? ` (${count})` : '';
                const isControl = href != null || onClick != null;
                return h('a', {
                    key: sec.group + i,
                    ...(isControl ? { href: href != null ? href : '#' } : {}),
                    class: (active ? 'active' : '') + (indent ? ' indent' : ''),
                    'aria-current': active ? 'page' : null,
                    'aria-label': (ariaLabel != null ? ariaLabel : label) + countLabel,
                    onclick: onClick,
                    onkeydown: isControl ? onSideLinkKeyDown : null
                },
                    glyph != null ? Glyph({ children: glyph, color }) : h('span', { class: 'glyph', 'aria-hidden': 'true' }),
                    h('span', {}, label),
                    (count != null && count !== 0 && count !== '0') ? h('span', { class: 'count', 'aria-hidden': 'true' }, String(count)) : null
                );
            })
        );
    }));
}

const STATUS_COLLAPSE_KEY = 'ds-status-collapsed';
function isStatusCollapsed() {
    try { return localStorage.getItem(STATUS_COLLAPSE_KEY) === '1'; } catch (_) { return false; }
}
function toggleStatusCollapsed(fromEl) {
    const app = fromEl && fromEl.closest && fromEl.closest('.app, .ws-shell');
    const bar = app && app.querySelector('.app-status');
    if (!bar) return;
    const next = !bar.classList.contains('is-collapsed');
    bar.classList.toggle('is-collapsed', next);
    const btn = bar.querySelector('.app-status-toggle');
    if (btn) btn.setAttribute('aria-expanded', next ? 'false' : 'true');
    if (app) app.style.setProperty('--app-status-h-live', next ? 'var(--space-4)' : 'var(--app-status-h)');
    attempt(() => { localStorage.setItem(STATUS_COLLAPSE_KEY, next ? '1' : '0'); });
}

export function Status({ left = [], right = [], ariaLabel } = {}) {
    const collapsed = isStatusCollapsed();
    const syncLiveVar = (el) => {
        if (!el) return;
        const app = el.closest('.app, .ws-shell');
        if (app) app.style.setProperty('--app-status-h-live', collapsed ? 'var(--space-4)' : 'var(--app-status-h)');
    };
    return h('footer', { class: 'app-status' + (collapsed ? ' is-collapsed' : ''), role: 'contentinfo', 'aria-label': ariaLabel || null, ref: syncLiveVar },
        h('button', {
            class: 'app-status-toggle', type: 'button',
            'aria-label': 'toggle status bar', 'aria-expanded': collapsed ? 'false' : 'true',
            onclick: (e) => toggleStatusCollapsed(e.currentTarget),
        }, Icon(collapsed ? 'chevron-up' : 'chevron-down', { size: 12 })),
        ...left.map((t, i) => h('span', { key: 'l' + i, class: 'item' }, t)),
        h('span', { key: 'spread', class: 'spread', 'aria-hidden': 'true' }),
        ...right.map((t, i) => h('span', { key: 'r' + i, class: 'item' }, t))
    );
}

function toggleSide(open, fromEl) {
    const shell = (fromEl && fromEl.closest && fromEl.closest('.app')) || document;
    const body = shell.querySelector('.app-body');
    if (!body) return;
    const next = open != null ? open : !body.classList.contains('side-open');
    body.classList.toggle('side-open', next);
    const btn = shell.querySelector('.app-side-toggle');
    if (btn) btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    if (body._dsSideKey) { document.removeEventListener('keydown', body._dsSideKey); body._dsSideKey = null; }
    if (next) {
        const drawer = shell.querySelector('.app-side-shell');
        const focusable = drawer && drawer.querySelector('button, a, input, [tabindex]');
        if (focusable) attempt(() => { focusable.focus(); });
        const onKey = (e) => {
            if (e.key === 'Escape') { toggleSide(false, btn || body); if (btn) attempt(() => { btn.focus(); }); return; }
            if (drawer) trapTab(drawer, e);
        };
        body._dsSideKey = onKey;
        document.addEventListener('keydown', onKey);
    }
}

function syncAppSide(el) {
    if (!el) return;
    const body = el.querySelector('.app-body');
    const btn = el.querySelector('.app-side-toggle');
    if (btn && body) btn.setAttribute('aria-expanded', body.classList.contains('side-open') ? 'true' : 'false');
    if (!el._dsSideRO && typeof ResizeObserver !== 'undefined') {
        el._dsSideRO = new ResizeObserver((entries) => {
            const w = entries[0] && entries[0].contentRect.width;
            const b = el.querySelector('.app-body');
            if (w > 900 && b && b.classList.contains('side-open')) toggleSide(false, el);
        });
        el._dsSideRO.observe(el);
    }
}

export function AppShell({ topbar, crumb, side, main, status, narrow, fullBleed, bannerLabel, mainLabel, mainLabelledby } = {}) {
    const hasSide = Boolean(side);
    const sideNode = hasSide ? side : h('aside', { class: 'app-side', 'aria-hidden': 'true' });
    const topbarIsSelfWrappedHeader = topbar && topbar.type === 'header' && topbar.props && topbar.props.class === 'app-topbar';
    const topbarContent = (crumb && topbarIsSelfWrappedHeader)
        ? h('div', { class: 'app-topbar' }, ...(topbar.props.children || []))
        : topbar;
    const chrome = (topbar && crumb)
        ? h('header', { class: 'app-chrome', role: 'banner', 'aria-label': bannerLabel || null }, topbarContent, crumb)
        : (topbar || crumb) ? h('header', { class: 'app-chrome', role: 'banner', 'aria-label': bannerLabel || null }, topbar || crumb) : null;
    return h('div', { class: 'app', ref: syncAppSide },
        h('a', { href: '#app-main', class: 'skip-link' }, 'skip to main content'),
        hasSide ? h('button', {
            class: 'app-side-toggle', type: 'button',
            'aria-label': 'toggle navigation', 'aria-expanded': 'false', 'aria-controls': 'app-side-shell',
            onclick: (e) => toggleSide(null, e.currentTarget),
        }, Icon('menu')) : null,
        chrome,
        h('div', { class: 'app-body' + (hasSide ? '' : ' no-side') },
            h('div', { class: 'app-side-scrim', 'aria-hidden': 'true', onclick: (e) => toggleSide(false, e.currentTarget) }),
            h('div', { class: 'app-side-shell', id: 'app-side-shell', onclick: (e) => { if (e.target.closest('a')) toggleSide(false, e.currentTarget); } }, sideNode),
            h('main', { class: 'app-main' + (narrow ? ' narrow' : '') + (fullBleed ? ' full-bleed' : ''), id: 'app-main', tabindex: '0', 'aria-label': mainLabel || null, 'aria-labelledby': mainLabelledby || null }, ...(Array.isArray(main) ? main : [main]))
        ),
        status || null
    );
}
