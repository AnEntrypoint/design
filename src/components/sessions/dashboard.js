
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Btn } from '../shell.js';
import { Select, SearchInput } from '../content.js';
import { SessionCard } from './session-card.js';
const h = webjsx.createElement;

const STREAM_WORD = {
  connected: 'listening for activity',
  connecting: 'connecting to live stream…',
  offline: 'live stream offline — retrying…',
  lost: 'live stream offline — retrying…',
};

/**
 * The live multi-session command center ("Live" dashboard).
 *
 * The stop-all / stop-selected danger buttons are two-step (host-driven, the
 * kit is stateless): the first click fires onArmStop* so the host flips
 * confirming* true and re-renders; the armed button reads 'stop N sessions -
 * press again' and only THAT click fires the real onStopAll/onStopSelected.
 * Hosts that wire no onArmStop* keep the old single-click behavior.
 *
 * @param {Object} [props]
 * @param {Array<Object>} [props.sessions=[]] - session shape: `{ sid, realSid, title, agent, model, cwd, elapsedMs, counter, lastActivity, currentTool, status, stopping, external, isNew, cost, tokens }`.
 * @param {Function} [props.onStop] - onStop(session).
 * @param {Function} [props.onOpen] - onOpen(session).
 * @param {Function} [props.onView] - onView(session).
 * @param {Function} [props.onStopAll]
 * @param {Function} [props.onStopSelected]
 * @param {boolean} [props.confirmingStopAll=false]
 * @param {boolean} [props.confirmingStopSelected=false]
 * @param {'connected'|'connecting'|'lost'|'offline'} [props.streamState]
 * @returns {*} webjsx vnode
 */
export function SessionDashboard({ sessions = [], onStop, onOpen, onView, onStopAll, onStopSelected,
                                   confirmingStopAll = false, confirmingStopSelected = false,
                                   onArmStopAll, onArmStopSelected,
                                   sort, filter, errorsOnly = false, onErrorsOnly,
                                   selectable = false, selected, onToggleSelect, onSelectAll, onClearSelection,
                                   activeSid, streamState,
                                   emptyText = 'No live sessions', emptyAction, offline = false,
                                   density = 'comfortable' } = {}) {
  if (offline) {
    return h('div', { class: 'ds-dash-state ds-dash-state-error', role: 'status' }, 'Backend offline — live sessions unavailable');
  }
  const selSet = selected instanceof Set ? selected : new Set(selected || []);
  const selCount = selSet.size;
  const stoppingCount = sessions.filter((s) => s.stopping).length;
  const streamDisc = streamState
    ? 'status-dot-disc ' + (streamState === 'connected' ? 'status-dot-live'
        : streamState === 'connecting' ? 'status-dot-connecting' : 'status-dot-error')
    : null;
  const streamLine = streamState
    ? h('span', { key: 'stream', class: 'ds-dash-stream-disc' },
        h('span', { class: streamDisc, 'aria-hidden': 'true' }),
        h('span', { class: 'ds-dash-stream is-' + streamState, role: 'status', 'aria-live': 'polite' }, STREAM_WORD[streamState] || streamState))
    : null;
  const counts = sessions.reduce((a, s) => {
    const k = s.status === 'error' ? 'error' : (s.status === 'stale' ? 'idle' : 'running');
    a[k] = (a[k] || 0) + 1; return a;
  }, {});
  const breakdownSegs = [
    counts.running ? { k: 'running', t: counts.running + ' running' } : null,
    counts.idle ? { k: 'idle', t: counts.idle + ' idle' } : null,
    counts.error ? { k: 'error', t: counts.error + ' error' + (counts.error === 1 ? '' : 's') } : null,
  ].filter(Boolean);
  const breakdown = breakdownSegs.length
    ? h('span', { key: 'bd', class: 'ds-dash-breakdown', role: 'status', 'aria-live': 'polite' },
        ...breakdownSegs.flatMap((seg, i) => [
          i ? h('span', { key: 'bsep' + i, class: 'ds-dash-breakdown-sep', 'aria-hidden': 'true' }, ' · ') : null,
          h('span', { key: 'bseg' + i, class: 'seg is-' + seg.k }, seg.t),
        ].filter(Boolean)))
    : null;
  const toolbar = (sort || filter || onErrorsOnly)
    ? h('div', { key: 'tb', class: 'ds-dash-toolbar', role: 'group', 'aria-label': 'sort and filter sessions' },
        filter ? SearchInput({
          key: 'filt', value: filter.value || '', label: filter.placeholder || 'Filter sessions', placeholder: filter.placeholder || 'Filter sessions',
          onInput: (v) => filter.onInput && filter.onInput(v),
          resultCount: filter.value ? (sessions.length + ' result' + (sessions.length === 1 ? '' : 's')) : undefined,
        }) : null,
        sort ? Select({ key: 'sort', value: sort.value || 'status', title: 'Sort sessions',
          options: [
            { value: 'status', label: 'sort: status' },
            { value: 'elapsed', label: 'sort: elapsed' },
            { value: 'activity', label: 'sort: last activity' },
            { value: 'errors', label: 'sort: errors first' },
          ], onChange: (v) => sort.onChange && sort.onChange(v) }) : null,
        onErrorsOnly ? h('button', { key: 'eo', type: 'button', class: 'ds-dash-errors-toggle' + (errorsOnly ? ' active' : ''),
          'aria-pressed': errorsOnly ? 'true' : 'false', onclick: () => onErrorsOnly(!errorsOnly) }, 'errors only') : null)
    : null;
  const selectableSids = sessions.filter((s) => !s.external).map((s) => s.sid);
  const selOfVisible = selectableSids.filter((sid) => selSet.has(sid)).length;
  const allState = selOfVisible === 0 ? 'false' : (selOfVisible === selectableSids.length ? 'true' : 'mixed');
  const selectAllCtl = (selectable && onSelectAll && selectableSids.length)
    ? h('button', { key: 'selall', type: 'button', class: 'ds-dash-selectall', role: 'checkbox',
        'aria-checked': allState, 'aria-label': allState === 'true' ? 'clear selection' : 'select all sessions',
        onclick: () => (allState === 'true' && onClearSelection) ? onClearSelection() : onSelectAll(selectableSids) },
        h('span', { class: 'ds-check-box', 'aria-hidden': 'true' }),
        h('span', {}, 'all'))
    : null;
  const clearCtl = (selectable && selCount && onClearSelection)
    ? h('button', { key: 'selclr', type: 'button', class: 'ds-dash-clear', onclick: () => onClearSelection() }, 'clear')
    : null;
  const stopBtn = stoppingCount > 0 && (onStopSelected || onStopAll)
      ? Btn({ key: 'stopbusy', variant: 'danger', disabled: true, children: 'stopping ' + stoppingCount + '…' })
      : (selectable && selCount && onStopSelected
      ? (onArmStopSelected && !confirmingStopSelected
          ? Btn({ key: 'stopsel', variant: 'danger', onClick: () => onArmStopSelected([...selSet]), children: 'stop selected' })
          : Btn({ key: 'stopsel', variant: 'danger', class: confirmingStopSelected ? 'is-armed' : null, onClick: () => onStopSelected([...selSet]),
                  children: confirmingStopSelected ? 'stop ' + selCount + ' sessions - press again' : 'stop selected' }))
      : (onStopAll
          ? (onArmStopAll && !confirmingStopAll
              ? Btn({ key: 'stopall', variant: 'danger', onClick: () => onArmStopAll(sessions), children: 'stop all' })
              : Btn({ key: 'stopall', variant: 'danger', class: confirmingStopAll ? 'is-armed' : null, onClick: () => onStopAll(sessions),
                      children: confirmingStopAll ? 'stop ' + sessions.length + ' sessions - press again' : 'stop all' }))
          : null));
  const headerKids = [
    selectable && selCount
      ? h('span', { key: 'cnt', class: 'ds-dash-count', role: 'status', 'aria-live': 'polite' }, selCount + ' selected')
      : (breakdown || h('span', { key: 'cnt', class: 'ds-dash-count', role: 'status', 'aria-live': 'polite' },
          sessions.length ? sessions.length + ' running'
            : (streamState && streamState !== 'connected' ? '— running (' + (STREAM_WORD[streamState] || streamState) + ')' : '0 running'))),
    selectAllCtl, clearCtl, streamLine,
    h('span', { key: 'spread', class: 'spread' }),
    sessions.length ? stopBtn : null,
    toolbar,
  ].filter(Boolean);
  const header = h('div', { class: 'ds-dash-header', role: 'group', 'aria-label': 'live session controls' }, ...headerKids);
  const grouped = !sort || !sort.value || sort.value === 'status';
  const cardOf = (s) => h('div', { key: s.sid, role: 'listitem' },
    SessionCard({ session: s, onStop, onOpen, onView, active: s.sid === activeSid,
                  selectable, selected: selSet.has(s.sid), onToggleSelect, density }));
  let bodyKids;
  if (!sessions.length) {
    bodyKids = [h('div', { key: 'empty', class: 'ds-dash-state', role: 'status' },
      ...[
        h('span', { key: 'et' }, emptyText),
        (emptyAction && emptyAction.onClick)
          ? Btn({ key: 'ea', onClick: emptyAction.onClick, children: emptyAction.label || 'start a chat' })
          : null,
      ].filter(Boolean))];
  } else if (grouped) {
    const buckets = [
      { key: 'error', label: 'Errored', rows: sessions.filter((s) => !s.external && s.status === 'error') },
      { key: 'running', label: 'Running', rows: sessions.filter((s) => !s.external && s.status !== 'error' && s.status !== 'stale') },
      { key: 'idle', label: 'Idle', rows: sessions.filter((s) => !s.external && s.status === 'stale') },
      { key: 'external', label: 'External', rows: sessions.filter((s) => s.external) },
    ].filter((b) => b.rows.length);
    bodyKids = buckets.map((b) => h('div', { key: 'grp' + b.key, class: 'ds-dash-group', role: 'group', 'aria-label': b.label + ' sessions' },
      h('div', { key: 'gl', class: 'ds-dash-group-label' }, b.label + ' · ' + b.rows.length),
      h('div', { key: 'gg', class: 'ds-dash-grid' + (density === 'compact' ? ' is-compact' : ''), role: 'list', 'aria-label': b.label + ' sessions' }, ...b.rows.map(cardOf))));
  } else {
    bodyKids = [h('div', { key: 'flat', class: 'ds-dash-grid' + (density === 'compact' ? ' is-compact' : ''), role: 'list', 'aria-label': 'live sessions' }, ...sessions.map(cardOf))];
  }
  const body = h('div', { key: 'body', class: 'ds-dash-groups' }, ...bodyKids);
  return h('div', { class: 'ds-dash' }, header, body);
}
