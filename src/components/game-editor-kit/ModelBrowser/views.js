import * as webjsx from '../../../../vendor/webjsx/index.js'
import { EmptyState } from '../ui-components.js'
import { filteredAndSorted } from './filtering.js'
import { renderThumbnailCard, renderListRow } from './cards.js'
const h = webjsx.createElement

function emptyView(s) {
  return EmptyState({ text: s.search ? 'No models match your search' : 'No models available' })
}

export function renderGridView(s, ops) {
  const filtered = filteredAndSorted(s)
  if (filtered.length === 0) return emptyView(s)
  const grid = h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;padding:8px;align-content:start' },
    ...filtered.map(m => renderThumbnailCard(s, ops, m))
  )
  return grid
}

export function renderListView(s, ops) {
  const filtered = filteredAndSorted(s)
  if (filtered.length === 0) return emptyView(s)
  const list = h('div', { style: 'display:flex;flex-direction:column;gap:0' },
    ...filtered.map(m => renderListRow(s, ops, m))
  )
  return list
}
