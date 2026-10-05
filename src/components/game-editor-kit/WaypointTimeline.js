import * as webjsx from '../../../vendor/webjsx/index.js'
import { Btn, Toolbar, EmptyState } from './ui-components.js'
import { Icon } from '../shell/icons.js'
const h = webjsx.createElement
const applyDiff = webjsx.applyDiff

export function collectWaypointRows(entities) {
  const flat = []
  const walk = (nodes) => {
    for (const n of nodes || []) {
      if (n && n.id) flat.push(n)
      if (n && n.children && n.children.length) walk(n.children)
    }
  }
  walk(entities)
  return flat
    .filter(n => n.custom && n.custom._waypoint)
    .map(n => ({ id: n.id, order: n.custom.order ?? 0, position: Array.isArray(n.position) ? n.position : [0, 0, 0], label: n.label || n.id }))
    .sort((a, b) => a.order - b.order)
}

export function reorderDelta(rows, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= rows.length || toIndex >= rows.length) return []
  const next = rows.slice()
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  const out = []
  next.forEach((r, i) => { if (r.order !== i) out.push({ id: r.id, order: i }) })
  return out
}

export function createWaypointTimeline(container, { onSelect, onAdd, onRemove, onReorder } = {}) {
  let _rows = [], _sel = null

  container.classList.add('ds-ep-panel')

  function render() {
    const toolbar = Toolbar({ children: [
      Btn({ primary: true, title: 'Add a new waypoint at the end of the path (drops at the viewport center)', onClick: (e) => { e.preventDefault(); onAdd?.(_rows.length) }, children: ['+ Waypoint'] }),
      h('div', { class: 'ds-ed-bar-grow' }),
      h('span', { class: 'ds-ed-files-loading' }, `${_rows.length} waypoint${_rows.length === 1 ? '' : 's'}`)
    ] })

    let body
    if (!_rows.length) {
      body = h('div', { style: 'display:flex;align-items:center;justify-content:center;text-align:center;flex:1' },
        EmptyState({ text: 'No waypoints yet -- click "+ Waypoint" to drop the first one, or place a "waypoint" app from the Add menu' }))
    } else {
      body = h('div', { style: 'flex:1;min-height:0;overflow-y:auto' },
        ..._rows.map((r, i) => h('div', {
          key: 'wp' + r.id,
          class: 'ds-ep-eventrow',
          style: 'display:flex;gap:8px;align-items:center;padding:6px 8px;border-bottom:1px solid var(--rule);cursor:pointer' + (r.id === _sel ? ';background:color-mix(in oklab, var(--accent) 15%, transparent)' : ''),
          onclick: () => { _sel = r.id; onSelect?.(r.id); render() }
        },
          h('span', { style: 'flex:0 0 auto;width:20px;text-align:center;font-weight:700;opacity:0.6' }, String(i)),
          h('div', { style: 'display:flex;flex-direction:column;gap:2px;min-width:0;flex:1' },
            h('span', { class: 'ds-ep-eventrow-type' }, r.label),
            h('span', { class: 'ds-ep-eventrow-sub' }, `[${r.position.map(v => v.toFixed(1)).join(', ')}]`)
          ),
          h('span', { style: 'flex:0 0 auto;display:flex;gap:2px' },
            Btn({ ghost: true, title: 'Move earlier in the path', onClick: (e) => { e.preventDefault(); e.stopPropagation(); onReorder?.(reorderDelta(_rows, i, i - 1)) }, children: [Icon('chevron-up', { size: 12 })] }),
            Btn({ ghost: true, title: 'Move later in the path', onClick: (e) => { e.preventDefault(); e.stopPropagation(); onReorder?.(reorderDelta(_rows, i, i + 1)) }, children: [Icon('chevron-down', { size: 12 })] }),
            Btn({ ghost: true, danger: true, title: 'Remove this waypoint', onClick: (e) => { e.preventDefault(); e.stopPropagation(); onRemove?.(r.id) }, children: [Icon('x', { size: 12 })] })
          )
        ))
      )
    }

    applyDiff(container, [
      h('div', { class: 'ds-ep-panel' }, toolbar, h('div', { class: 'ds-ep-panel-body ds-ep-flush', style: 'display:flex;flex-direction:column;flex:1;min-height:0' }, body))
    ])
  }

  render()

  return {
    updateEntities(entities) { _rows = collectWaypointRows(entities); if (_sel && !_rows.some(r => r.id === _sel)) _sel = null; render() },
    setSelected(id) { _sel = id || null; render() },
    get rows() { return _rows }
  }
}
