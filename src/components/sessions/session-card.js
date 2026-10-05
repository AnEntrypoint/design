
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Btn, Icon } from '../shell.js';
import { formatNumber } from '../../locale.js';
import { fmtDuration, STATUS_WORD, STATUS_DISC } from './format.js';
const h = webjsx.createElement;

export function SessionCard({ session = {}, onStop, onOpen, onView, active = false,
                             selectable = false, selected = false, onToggleSelect,
                             density = 'comfortable' } = {}) {
  const s = session;
  const compact = density === 'compact';
  const st = s.stopping ? 'stopping' : (s.status === 'error' ? 'error' : (s.status === 'stale' ? 'stale' : 'running'));
  const elapsedText = s.elapsedMs != null ? fmtDuration(s.elapsedMs) : (s.elapsed != null ? s.elapsed : null);
  const tokText = s.tokens != null ? (typeof s.tokens === 'number' ? formatNumber(s.tokens) : s.tokens) + ' tok' : null;
  const costText = s.cost != null ? (typeof s.cost === 'number' ? '$' + s.cost.toFixed(4) : String(s.cost)) : null;
  const statBits = [elapsedText, s.counter != null ? s.counter : null, tokText].filter((x) => x != null && x !== '');
  const activityBits = [
    s.currentTool ? 'running: ' + s.currentTool : null,
    s.lastActivity ? 'last ' + s.lastActivity : null,
  ].filter(Boolean);
  const cls = 'ds-dash-card is-' + st + (compact ? ' is-compact' : '') + (active ? ' is-active' : '') + (selected ? ' is-selected' : '') + (s.external ? ' is-external' : '') + (s.isNew ? ' is-new' : '');
  const head = h('div', { class: 'ds-dash-card-head' }, ...[
    selectable ? h('button', {
      type: 'button', class: 'ds-dash-select', role: 'checkbox',
      'aria-checked': selected ? 'true' : 'false',
      'aria-label': (selected ? 'deselect' : 'select') + ' session ' + (s.title || s.agent || s.sid),
      onclick: () => onToggleSelect && onToggleSelect(s),
    }, h('span', { class: 'ds-check-box', 'aria-hidden': 'true' })) : null,
    h('span', { class: 'status-dot-disc ' + STATUS_DISC[st], 'aria-hidden': 'true' }),
    h('span', { class: 'ds-dash-status is-' + st }, STATUS_WORD[st]),
    s.external ? h('span', { class: 'ds-dash-external' }, 'external') : null,
    h('span', { class: 'ds-dash-agent', title: s.agent || null }, s.agent || 'agent'),
    s.model ? h('span', { class: 'ds-dash-model', title: s.model }, s.model) : null,
  ].filter(Boolean));
  const meta = h('div', { class: 'ds-dash-meta' }, ...[
    s.cwd ? h('span', { class: 'ds-dash-cwd', title: s.cwd }, s.cwd) : null,
    (statBits.length || costText) ? h('span', { class: 'ds-dash-stat' },
      ...[
        statBits.length ? statBits.join(' · ') : null,
        (statBits.length && costText) ? ' · ' : null,
        costText ? h('span', { class: 'ds-dash-stat-cost' }, costText) : null,
      ].filter(Boolean)
    ) : null,
    activityBits.length ? h('span', { class: 'ds-dash-activity' }, activityBits.join(' · ')) : null,
  ].filter(Boolean));
  const actions = h('div', { class: 'ds-dash-actions', role: 'group', 'aria-label': 'session actions' }, ...[
    onOpen ? Btn({ key: 'open', variant: 'primary', 'aria-label': 'open session', onClick: () => onOpen(s),
      children: [Icon('external-link', { size: 14 }), h('span', {}, 'open')] }) : null,
    onView ? Btn({ key: 'view', 'aria-label': s.external ? 'open in history' : 'view events', onClick: () => onView(s),
      children: [Icon('file-text', { size: 14 }), h('span', {}, s.external ? 'history' : 'events')] }) : null,
    (onStop && !s.external) ? Btn({ key: 'stop', variant: 'danger', disabled: !!s.stopping, 'aria-label': 'stop session',
      onClick: () => !s.stopping && onStop(s),
      children: [Icon('square', { size: 14 }), h('span', {}, s.stopping ? 'stopping…' : 'stop')] }) : null,
  ].filter(Boolean));
  const children = compact
    ? [head, meta].filter(Boolean)
    : [
        s.title ? h('div', { class: 'ds-dash-title', title: s.title }, s.title) : null,
        head, meta, actions,
      ].filter(Boolean);
  return h('div', { class: cls, role: 'group', 'aria-label': 'session ' + (s.title || s.agent || s.sid), 'aria-current': active ? 'true' : null },
    ...children);
}
