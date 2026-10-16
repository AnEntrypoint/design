import * as webjsx from '../../../../vendor/webjsx/index.js'
import { Icon } from '../../../components.js'
import { getSharedWM } from '../ui-components.js'
import { norm, join, parent } from './paths.js'
import { promptText } from './prompt.js'
const h = webjsx.createElement

export function renderFolderTree(s, ops) {
  const folders = norm(s.currentFolder).split('/').filter(Boolean)
  const breadcrumbs = [h('span', { style: 'cursor:pointer;text-decoration:underline', onClick: () => { s.currentFolder = ''; ops.render() } }, 'Root')]

  let path = ''
  for (const folder of folders) {
    path = join(path, folder)
    const p = path
    breadcrumbs.push(' / ')
    breadcrumbs.push(h('span', { style: 'cursor:pointer;text-decoration:underline', onClick: () => { s.currentFolder = p; ops.render() } }, folder))
  }

  return h('div', { style: 'padding:8px;border-bottom:1px solid var(--panel-border,#ccc);font:11px var(--ff-mono,monospace);color:var(--panel-text-2);display:flex;gap:4px;flex-wrap:wrap;align-items:center' }, breadcrumbs)
}

function folderRow(s, ops, folderPath) {
  const folderName = folderPath.split('/').pop()
  return h('div', {
    style: 'padding:6px 8px;border-bottom:1px solid var(--panel-border,#eee);cursor:pointer;display:flex;gap:8px;justify-content:space-between;align-items:center'
  }, [
    h('div', { style: 'display:flex;gap:6px;align-items:center;flex:1;min-width:0', onClick: () => { s.currentFolder = folderPath; ops.render() } }, [
      h('span', { style: 'color:var(--panel-text-3,#666)' }, Icon('folder', { size: 14 })),
      h('span', { style: 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, folderName)
    ]),
    h('div', { style: 'display:flex;gap:4px' }, [
      h('button', {
        type: 'button',
        title: 'Rename',
        style: 'padding:2px 6px;font-size:11px;cursor:pointer;background:transparent;border:none;color:var(--panel-text-2)',
        onClick: async (e) => {
          e.stopPropagation()
          const wm = getSharedWM()
          const newName = wm ? await promptText(wm, { title: 'Rename folder', label: 'New name', value: folderName }) : prompt('New folder name', folderName)
          if (!newName || newName === folderName) return
          s.onFolderRename?.(folderPath, join(parent(folderPath), newName))
          ops.render()
        }
      }, Icon('edit')),
      h('button', {
        type: 'button',
        title: 'Delete',
        style: 'padding:2px 6px;font-size:11px;cursor:pointer;background:transparent;border:none;color:var(--panel-text-2)',
        onClick: async (e) => {
          e.stopPropagation()
          if (confirm(`Delete folder "${folderName}"?`)) {
            s.onFolderDelete?.(folderPath)
            ops.render()
          }
        }
      }, Icon('x'))
    ])
  ])
}

export function renderFolderPanel(s, ops) {
  const currentFolders = Object.keys(s.folders)
    .filter(f => parent(f) === s.currentFolder)
    .sort()

  const folderItems = currentFolders.map(folderPath => folderRow(s, ops, folderPath))

  return folderItems.length > 0 ? h('div', { style: 'border-bottom:1px solid var(--panel-border,#ddd)' }, folderItems) : null
}
