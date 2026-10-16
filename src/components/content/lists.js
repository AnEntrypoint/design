import * as webjsx from '../../../vendor/webjsx/index.js';
import { Btn, Icon } from '../shell.js';
import { Row, RowLink } from './row.js';
import { Panel } from './panel.js';
const h = webjsx.createElement;

export function WorksList({ works = [], openedIndex = -1, onToggle }) {
    return Panel({
        children: works.map((w, i) => {
            const isOpen = openedIndex === i;
            return h('div', { key: i },
                Row({
                    code: w.code,
                    title: w.title, sub: w.sub,
                    meta: h('span', { class: 'ds-works-meta' },
                        w.meta != null ? h('span', {}, w.meta) : null,
                        Icon(isOpen ? 'chevron-down' : 'chevron-right')),
                    active: isOpen,
                    expanded: isOpen,
                    onClick: () => onToggle && onToggle(isOpen ? -1 : i)
                }),
                isOpen ? h('div', { class: 'work-detail', 'data-work-index': String(i) },
                    h('div', { class: 'ds-prose' },
                        h('p', { class: 'ds-work-body' }, w.body)
                    ),
                    h('div', { class: 'ds-work-actions' },
                        Btn({ variant: 'primary', href: w.href || '#', 'aria-label': 'open ' + (w.title || 'project'), children: 'open ->' }),
                        Btn({ href: w.source || '#', children: 'source' })
                    )
                ) : null
            );
        })
    });
}

export function WritingList({ posts = [] }) {
    return Panel({
        children: posts.map((p, i) =>
            RowLink({ key: i, code: p.date, title: p.title, meta: p.tag, href: p.href || '#' })
        )
    });
}

export function EventList({ items, events, emptyText = 'no events', rankPad = 3, loading = false, loadingText = 'loading events…' }) {
    const list = items || events || [];
    if (loading && !list.length) {
        return h('section', { class: 'ds-section ds-event-list' },
            h('div', { key: 'st', role: 'status', 'aria-live': 'polite', class: 'ds-event-state lede' }, loadingText),
            ...Array.from({ length: 7 }, (_, i) => h('div', { key: 'sk' + i, class: 'ds-event-row-skeleton', 'aria-hidden': 'true' },
                h('span', { key: 'r', class: 'ds-skel ds-skel-rank' }),
                h('span', { key: 't', class: 'ds-skel ds-skel-title' }),
                h('span', { key: 'm', class: 'ds-skel ds-skel-meta' }))));
    }
    if (!list.length) return h('p', { class: 'lede' }, emptyText);
    return h('section', { class: 'ds-section ds-event-list' },
        ...list.map((it, i) => Row({
            key: it.key || ('ev' + i),
            code: it.code != null ? it.code : (it.rank != null ? it.rank : String(i + 1).padStart(rankPad, '0')),
            title: it.title || '(empty)',
            sub: it.sub || '',
            active: it.active,
            onClick: it.onClick,
            kind: it.kind,
            rail: it.rail,
            expanded: it.expanded,
            detail: it.detail,
            actions: it.actions,
            highlight: it.highlight,
            meta: it.meta
        }))
    );
}
