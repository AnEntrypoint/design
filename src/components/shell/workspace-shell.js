import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from './icons.js';
import { toggleWs, toggleWsDrawer, closeWsDrawers, wsCollapsed, seedWsWidths, WsResizer } from './workspace-columns.js';
const h = webjsx.createElement;

/**
 * A Claude-Desktop / cowork three-(or four-)column app shell.
 *
 * Pure stateless chrome (props in, vnode out). Collapse is DOM-class + a
 * persisted flag, so the host does not have to thread collapse state through
 * its own store. Visual styling lives in app-shell.css (.ws-*).
 *
 * @param {Object} props
 * @param {*} props.rail - the persistent left workspace nav (icon+label items, collapsible to icon-only). Pass the result of WorkspaceRail() or any vnode.
 * @param {*} props.sessions - an OPTIONAL second column (a conversation/session list) shown between the rail and the main content. Null hides it.
 * @param {*} props.main - the primary content column (chat thread, files view, dashboard...).
 * @param {*} props.pane - an OPTIONAL right context pane (per-conversation context, file preview...). Null hides it; collapsible when present.
 * @param {*} props.crumb - an optional thin top chrome bar (breadcrumb + status), spanning the content area only (the rail has its own header).
 * @param {*} props.status - an optional footer.
 * @param {boolean} props.narrow - caller's isNarrow(), drives the mobile single-column collapse.
 * @param {boolean} props.railCollapsed - initial rail collapse (persisted state wins).
 * @param {boolean} props.paneCollapsed - initial pane collapse (persisted state wins).
 * @returns {*} webjsx vnode
 */
export function WorkspaceShell({ rail, sessions, main, pane, crumb, status, narrow,
                                 railCollapsed = false, paneCollapsed = false,
                                 railLabel = 'workspace navigation',
                                 paneLabel = 'context', stableFrame = false, mainFlush = false } = {}) {
    const hasSessions = Boolean(sessions);
    const hasPane = Boolean(pane);
    const keepPaneTrack = stableFrame && !hasPane;
    const keepSessionsTrack = stableFrame && !hasSessions;
    const railIsCollapsed = wsCollapsed('rail', railCollapsed);
    const paneIsCollapsed = hasPane ? wsCollapsed('pane', paneCollapsed) : true;
    const sessionsIsCollapsed = hasSessions ? wsCollapsed('sessions', false) : true;
    const shellCls = 'ws-shell'
        + (railIsCollapsed ? ' ws-rail-collapsed' : '')
        + ((hasPane || keepPaneTrack) ? '' : ' ws-no-pane')
        + (((hasPane && paneIsCollapsed) || keepPaneTrack) ? ' ws-pane-collapsed' : '')
        + ((hasSessions || keepSessionsTrack) ? '' : ' ws-no-sessions')
        + (((hasSessions && sessionsIsCollapsed) || keepSessionsTrack) ? ' ws-sessions-collapsed' : '')
        + (narrow ? ' narrow' : '');
    return h('div', { class: shellCls, ref: seedWsWidths },
        h('a', { href: '#ws-main', class: 'skip-link' }, 'skip to main content'),
        h('nav', { class: 'ws-rail', role: 'navigation', 'aria-label': railLabel },
            h('button', {
                class: 'ws-rail-toggle', type: 'button',
                'aria-label': railIsCollapsed ? 'expand navigation' : 'collapse navigation',
                title: railIsCollapsed ? 'expand navigation' : 'collapse navigation',
                'aria-expanded': railIsCollapsed ? 'false' : 'true',
                onclick: (e) => toggleWs('rail', e.currentTarget),
            }, Icon('menu')),
            rail || null),
        h('div', { class: 'ws-scrim', 'aria-hidden': 'true', onclick: (e) => closeWsDrawers(e.currentTarget) }),
        hasSessions
            ? h('div', { id: 'ws-sessions-col', class: 'ws-sessions', role: 'complementary', 'aria-label': 'conversations',
                onclick: (e) => {
                    const col = e.currentTarget;
                    if (getComputedStyle(col).position === 'fixed' && e.target.closest('button, a, [role="button"]')) closeWsDrawers(col);
                } }, sessions)
            : null,
        h('div', { class: 'ws-content' },
            crumb
                ? h('div', { class: 'ws-crumb' },
                    hasSessions ? h('button', {
                        class: 'ws-drawer-toggle ws-sessions-drawer-toggle', type: 'button',
                        'aria-label': 'toggle conversations', 'aria-expanded': 'false',
                        'aria-controls': 'ws-sessions-col',
                        onclick: (e) => toggleWsDrawer('sessions', null, e.currentTarget),
                    }, Icon('thread')) : null,
                    hasSessions ? h('button', {
                        class: 'ws-desktop-toggle ws-sessions-toggle', type: 'button',
                        'aria-label': sessionsIsCollapsed ? 'expand conversations' : 'collapse conversations',
                        title: sessionsIsCollapsed ? 'expand conversations' : 'collapse conversations',
                        'aria-expanded': sessionsIsCollapsed ? 'false' : 'true', onclick: (e) => toggleWs('sessions', e.currentTarget),
                    }, Icon(sessionsIsCollapsed ? 'chevron-right' : 'chevron-left')) : null,
                    h('div', { class: 'ws-crumb-main' }, crumb),
                    hasPane ? h('button', {
                        class: 'ws-desktop-toggle ws-pane-toggle', type: 'button',
                        'aria-label': paneIsCollapsed ? 'show context pane' : 'hide context pane',
                        title: paneIsCollapsed ? 'show context pane' : 'hide context pane',
                        'aria-expanded': paneIsCollapsed ? 'false' : 'true',
                        onclick: (e) => toggleWs('pane', e.currentTarget),
                    }, Icon(paneIsCollapsed ? 'chevron-left' : 'chevron-right')) : null,
                    hasPane ? h('button', {
                        class: 'ws-drawer-toggle ws-pane-drawer-toggle', type: 'button',
                        'aria-label': 'toggle context pane', 'aria-expanded': 'false',
                        'aria-controls': 'ws-pane-col',
                        onclick: (e) => toggleWsDrawer('pane', null, e.currentTarget),
                    }, Icon('page')) : null)
                : null,
            h('main', { class: 'ws-main ds-app-surface' + (narrow ? ' narrow' : '') + (mainFlush ? ' ws-main--flush' : ''), id: 'ws-main', tabindex: '0' },
                ...(Array.isArray(main) ? main : [main])),
            status || null),
        hasPane
            ? h('aside', { id: 'ws-pane-col', class: 'ws-pane', role: 'complementary', 'aria-label': paneLabel },
                pane)
            : null,
        (!narrow && !railIsCollapsed) ? WsResizer('rail') : null,
        (!narrow && (hasSessions || keepSessionsTrack) && !sessionsIsCollapsed) ? WsResizer('sessions') : null,
        (!narrow && (hasPane || keepPaneTrack) && !paneIsCollapsed) ? WsResizer('pane') : null,
    );
}

export function WorkspaceRail({ brand = '247420', action, items = [], footer } = {}) {
    return h('div', { class: 'ws-rail-inner' },
        h('div', { class: 'ws-rail-head' },
            h('span', { class: 'ws-rail-brand' }, brand)),
        action
            ? h('button', {
                class: 'ws-rail-action', type: 'button',
                'aria-label': action.label,
                onclick: action.onClick || null,
            }, action.icon ? Icon(action.icon) : null, h('span', { class: 'ws-rail-action-label' }, action.label))
            : null,
        h('ul', { class: 'ws-rail-nav', role: 'list' },
            ...items.map((it) => h('li', { key: it.key || it.label, role: 'listitem' },
                h('button', {
                    type: 'button',
                    class: 'ws-rail-item' + (it.active ? ' active' : '') + (it.rail ? ' has-rail-flag' : ''),
                    'aria-current': it.active ? 'page' : null,
                    'aria-label': it.label + (it.count ? ' (' + it.count + ')' : '') + (it.rail === 'flame' ? ', needs attention' : ''),
                    title: it.label,
                    onclick: it.onClick || null,
                },
                    it.icon ? Icon(it.icon) : h('span', { class: 'ws-rail-item-glyph', 'aria-hidden': 'true' }),
                    h('span', { class: 'ws-rail-item-label' }, it.label),
                    (it.count != null && it.count !== 0 && it.count !== '0')
                        ? h('span', { class: 'ws-rail-item-count ds-badge ds-badge--sm', 'aria-hidden': 'true' }, String(it.count))
                        : null,
                    it.rail ? h('span', { class: 'ws-rail-item-flag tone-' + it.rail, 'aria-hidden': 'true' }) : null)))),
        footer ? h('div', { class: 'ws-rail-foot' }, footer) : null,
    );
}
