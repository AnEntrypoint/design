import * as webjsx from '../../../../vendor/webjsx/index.js'
import { Icon } from '../../../components.js'
const h = webjsx.createElement
const { applyDiff } = webjsx

function metaRow(label, value) {
  return h('tr', {},
    h('td', { style: 'color:var(--fg-3);padding:2px 4px' }, label),
    h('td', { style: 'text-align:right;padding:2px 4px' }, value)
  )
}

function renderMetadata(model) {
  return h('div', {},
    h('div', { style: 'color:var(--fg-3);margin-bottom:4px' }, 'Metadata'),
    h('table', { style: 'width:100%;border-collapse:collapse' },
      model.polyCount ? metaRow('Polygons:', Math.round(model.polyCount / 1000) + 'k') : null,
      model.fileSize ? metaRow('File Size:', Math.round(model.fileSize / 1024 / 1024 * 10) / 10 + ' MB') : null,
      model.colliderType ? metaRow('Collider:', model.colliderType) : null,
      model.textureSize ? metaRow('Texture:', model.textureSize) : null
    )
  )
}

function renderTags(model) {
  return model.tags && model.tags.length > 0 ? h('div', {},
    h('div', { style: 'color:var(--fg-3);margin-bottom:4px' }, 'Tags'),
    h('div', { style: 'display:flex;flex-wrap:wrap;gap:4px' },
      ...model.tags.map(tag => h('span', {
        style: 'background:var(--accent);color:var(--accent-fg);padding:2px 6px;border-radius:var(--r-hair,3px);font-size:10px'
      }, tag))
    )
  ) : null
}

function renderActions(s, ops) {
  return h('div', { style: 'margin-top:auto;display:flex;gap:6px;padding-top:8px;border-top:1px solid var(--rule)' },
    h('button', {
      class: 'ds-ep-wm-btn',
      style: 'flex:1;padding:6px;font-size:11px',
      onclick: (e) => {
        e.preventDefault()
        s.previewMode = false
        ops.render()
      }
    }, 'Cancel'),
    h('button', {
      class: 'ds-ep-wm-btn ds-ep-wm-btn-primary',
      style: 'flex:1;padding:6px;font-size:11px',
      onclick: (e) => {
        e.preventDefault()
        s.opts.onPlaceModel?.(s.selectedModel)
        s.previewMode = false
        ops.render()
      }
    }, 'Place Model')
  )
}

function initPreviewCanvas(s) {
  setTimeout(() => {
    const target = document.getElementById('model-preview-container')
    if (!target || !s.selectedModel) return
    s.opts.onPreview?.(s.selectedModel, target)
  }, 0)
}

export function renderPreview(s, ops) {
  if (!s.previewMode || !s.selectedModel) return
  const overlay = h('div', {
    style: 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--scrim-strong,rgba(0,0,0,0.7));display:flex;align-items:center;justify-content:center;z-index:var(--z-modal,800)',
    onclick: (e) => {
      if (e.target === e.currentTarget) { s.previewMode = false; ops.render() }
    }
  },
    h('div', {
      style: 'background:var(--bg-1);border:1px solid var(--rule);border-radius:var(--r-1,8px);width:90%;max-width:900px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden',
      onclick: (e) => e.stopPropagation()
    },
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--rule)' },
        h('h3', { style: 'margin:0;font:14px monospace;color:var(--fg)' }, s.selectedModel.name || 'Untitled'),
        h('button', {
          class: 'ds-ep-wm-btn',
          style: 'padding:4px 8px;font-size:11px',
          onclick: () => { s.previewMode = false; ops.render() }
        }, Icon('x'))
      ),
      h('div', { style: 'flex:1;min-height:0;display:flex;gap:12px;padding:12px;overflow-y:auto' },
        h('div', { style: 'flex:1;min-width:300px;background:var(--bg-2);border-radius:var(--r-1,6px);border:1px solid var(--rule);display:flex;align-items:center;justify-content:center;position:relative', id: 'model-preview-container' },
          h('div', { style: 'color:var(--fg-3);text-align:center' }, 'Loading preview...')
        ),
        h('div', { style: 'width:300px;display:flex;flex-direction:column;gap:8px;background:var(--bg-2);padding:12px;border-radius:var(--r-1,6px);border:1px solid var(--rule);overflow-y:auto;font-size:11px' },
          renderMetadata(s.selectedModel),
          renderTags(s.selectedModel),
          renderActions(s, ops)
        )
      )
    )
  )
  applyDiff(s.container.parentNode || s.container, [overlay], { replace: true })
  initPreviewCanvas(s)
}
