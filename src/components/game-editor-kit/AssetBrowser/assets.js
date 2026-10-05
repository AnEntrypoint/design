import * as webjsx from '../../../../vendor/webjsx/index.js'
import { Icon } from '../../../components.js'
import { getSharedWM } from '../ui-components.js'
import { showToast } from '../utils.js'
import { getFilteredAssets } from './query.js'
const h = webjsx.createElement

export function showAssetMenu(s, ops, asset, anchor) {
  const wm = getSharedWM()
  if (!wm) {
    showToast('Quick menu requires window manager', 'info')
    return
  }

  const folders = Object.keys(s.folders).filter(f => f !== (asset.folder || '')).sort()
  const actions = [
    () => s.onAssetSelect?.(asset)
  ]

  if (folders.length > 0) {
    for (const f of folders) {
      actions.push(() => {
        asset.folder = f
        s.onAssetMove?.(asset.id, f)
        ops.render()
      })
    }
  }

  actions.push(() => { navigator.clipboard.writeText(asset.path || asset.name) })

  showToast('Asset menu (right-click context)', 'info')
}

function assetRow(s, ops, asset) {
  return h('div', {
    style: 'padding:6px 8px;border-bottom:1px solid var(--panel-border,#eee);cursor:pointer;display:flex;gap:8px;align-items:center;transition:background 0.1s',
    onMouseEnter: (el) => el.target.style.background = 'var(--panel-hover,#f5f5f5)',
    onMouseLeave: (el) => el.target.style.background = 'transparent'
  }, [
    asset.thumbnail ? h('img', { src: asset.thumbnail, style: 'width:32px;height:32px;border-radius:var(--r-hair,2px);object-fit:contain', alt: asset.name }) : h('span', { style: 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--panel-bg-2,#eee);border-radius:var(--r-hair,2px)' }, Icon('package', { size: 18 })),
    h('div', { style: 'flex:1;min-width:0', onClick: () => s.onAssetSelect?.(asset) }, [
      h('div', { style: 'font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, asset.name),
      asset.tags && asset.tags.length > 0 ? h('div', { style: 'font-size:10px;color:var(--panel-text-3,#999);margin-top:2px' }, asset.tags.join(', ')) : null
    ].filter(Boolean)),
    h('div', { style: 'display:flex;gap:4px' }, [
      h('button', {
        type: 'button',
        title: 'Menu',
        style: 'padding:2px 6px;font-size:11px;cursor:pointer;background:transparent;border:none;color:var(--panel-text-2)',
        onClick: (e) => {
          e.stopPropagation()
          showAssetMenu(s, ops, asset, e.target)
        }
      }, "[...]")
    ])
  ])
}

export function renderAssetList(s, ops) {
  const filtered = getFilteredAssets(s)

  if (filtered.length === 0) {
    return h('div', { style: 'padding:24px;text-align:center;color:var(--panel-text-2)' }, 'No assets')
  }

  const items = filtered.map(asset => assetRow(s, ops, asset))

  const elapsed = performance.now() - s.renderStart
  if (elapsed > 50) console.warn(`[AssetBrowser] render took ${elapsed.toFixed(1)}ms for ${filtered.length} assets`)

  return h('div', {}, items)
}
