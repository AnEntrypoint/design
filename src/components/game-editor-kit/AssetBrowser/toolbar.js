import * as webjsx from '../../../../vendor/webjsx/index.js'
import { getSharedWM, Btn, SearchInput } from '../ui-components.js'
import { join } from './paths.js'
import { promptText } from './prompt.js'
import { getFilteredAssets, getAllTags } from './query.js'
const h = webjsx.createElement

function tagButton(s, ops, tag) {
  return h('button', {
    type: 'button',
    style: `padding:2px 8px;font-size:10px;border-radius:var(--r-0,4px);border:1px solid var(--panel-border,#ddd);background:${s.selectedTags.has(tag) ? 'var(--primary,#262626)' : 'transparent'};color:${s.selectedTags.has(tag) ? '#fff' : 'var(--panel-text-2)'};cursor:pointer`,
    onClick: () => {
      if (s.selectedTags.has(tag)) s.selectedTags.delete(tag)
      else s.selectedTags.add(tag)
      ops.render()
    }
  }, tag)
}

export function renderToolbar(s, ops) {
  const tags = getAllTags(s)
  return h('div', { style: 'padding:8px;border-bottom:1px solid var(--panel-border,#ddd);display:flex;flex-direction:column;gap:8px' }, [
    h('div', { style: 'display:flex;gap:6px' }, [
      Btn({ onClick: async () => {
        const wm = getSharedWM()
        const name = wm ? await promptText(wm, { title: 'New folder', label: 'Folder name', placeholder: 'name' }) : prompt('Folder name')
        if (!name) return
        const newPath = join(s.currentFolder, name)
        s.folders[newPath] = true
        s.onFolderCreate?.(newPath)
        ops.render()
      }, children: ['+ Folder'] }),
      h('div', { style: 'flex:1' }),
      h('div', { style: 'display:flex;gap:4px;font-size:11px;color:var(--panel-text-2)' }, [
        h('span', {}, `${getFilteredAssets(s).length} asset${getFilteredAssets(s).length !== 1 ? 's' : ''}`)
      ])
    ]),
    SearchInput({ value: s.searchQuery, placeholder: 'Search...', onInput: v => { s.searchQuery = (v || '').toLowerCase(); ops.render() } }),
    tags.length > 0 ? h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap' }, tags.map(tag => tagButton(s, ops, tag))) : null
  ].filter(Boolean))
}
