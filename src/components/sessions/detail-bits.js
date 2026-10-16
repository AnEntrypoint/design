
import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function SessionMeta({ items = [] } = {}) {
  if (!items.length) return null;
  return h('div', { class: 'ds-session-meta-strip', role: 'group', 'aria-label': 'session metadata' },
    ...items.map((it, i) => h('span', {
      key: 'sm-' + (it.label != null ? it.label : i),
      class: 'ds-session-meta-item',
      title: it.title || null,
    },
      [
        it.label != null ? h('span', { key: 'l', class: 'ds-session-meta-label' }, it.label) : null,
        h('span', { key: 'v', class: 'ds-session-meta-value' }, it.value != null ? String(it.value) : ''),
        it.onCopy ? h('button', {
          key: 'c', type: 'button', class: 'ds-session-meta-copy',
          'aria-label': 'copy ' + (it.title || it.label || 'value'),
          onclick: () => it.onCopy(it.value),
        }, 'copy') : null,
        it.onAction ? h('button', {
          key: 'a', type: 'button', class: 'ds-session-meta-action',
          onclick: () => it.onAction(it.value),
        }, it.actionLabel || 'use') : null,
      ].filter(Boolean))));
}

export function AgentListSkeleton({ rows = 5 } = {}) {
  return h('div', { class: 'ds-agent-list-skeleton', 'aria-hidden': 'true' },
    ...Array.from({ length: Math.max(1, rows) }, (_, i) => h('div', { key: 'ags' + i, class: 'ds-agent-row-skeleton' },
      h('span', { class: 'ds-skel ds-skel-icon' }),
      h('span', { class: 'ds-skel ds-skel-title' }),
      h('span', { class: 'ds-skel ds-skel-meta' }))),
    h('span', { key: 'st', class: 'ds-agent-list-skeleton-status', role: 'status', 'aria-live': 'polite' }, 'loading agents…'));
}
