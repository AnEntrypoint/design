import * as webjsx from '../../../../vendor/webjsx/index.js'
import { Icon } from '../../../components.js'
import { Btn, SearchInput } from '../ui-components.js'
const h = webjsx.createElement
const { applyDiff } = webjsx

const SELECT_STYLE = 'padding:4px 6px;border-radius:var(--r-0,4px);border:1px solid var(--rule);background:var(--bg-1);color:var(--fg);font:var(--fs-nano,11px) var(--ff-mono,monospace)'

export function renderToolbar(s, ops) {
  const controls = h('div', { style: 'display:flex;align-items:center;gap:6px;padding:6px;flex-wrap:wrap;min-height:40px' },
    SearchInput({
      value: s.search,
      placeholder: 'Search models...',
      onInput: v => { s.search = (v || '').toLowerCase(); ops.render() }
    }),
    h('select', {
      style: SELECT_STYLE,
      onchange: (e) => { s.sortBy = e.target.value; ops.render() },
      value: s.sortBy
    },
      h('option', { value: 'name' }, 'Sort: Name'),
      h('option', { value: 'size' }, 'Sort: Size'),
      h('option', { value: 'date' }, 'Sort: Date'),
      h('option', { value: 'usage' }, 'Sort: Usage')
    ),
    h('select', {
      style: SELECT_STYLE,
      onchange: (e) => { s.filterCategory = e.target.value; ops.render() },
      value: s.filterCategory
    },
      h('option', { value: 'all' }, 'Category: All'),
      h('option', { value: 'prop' }, 'Category: Prop'),
      h('option', { value: 'building' }, 'Category: Building'),
      h('option', { value: 'vehicle' }, 'Category: Vehicle'),
      h('option', { value: 'character' }, 'Category: Character')
    ),
    Btn({
      ghost: s.viewMode !== 'grid',
      onClick: () => { s.viewMode = 'grid'; ops.render() },
      title: 'Grid View',
      children: [Icon('grid')]
    }),
    Btn({
      ghost: s.viewMode !== 'list',
      onClick: () => { s.viewMode = 'list'; ops.render() },
      title: 'List View',
      children: [Icon('rows')]
    }),
    Btn({
      ghost: true,
      onClick: ops.loadModels,
      title: 'Refresh',
      children: [Icon('refresh')]
    })
  )
  applyDiff(s.toolbarHost, [controls])
}
