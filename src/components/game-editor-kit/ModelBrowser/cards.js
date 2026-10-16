import * as webjsx from '../../../../vendor/webjsx/index.js'
const h = webjsx.createElement

function thumbnailUrl(s, model) {
  return s.opts.getThumbnailUrl?.(model) || `/api/thumbnail/${encodeURIComponent(model.path)}`
}

export function renderThumbnailCard(s, ops, model) {
  const thumbUrl = thumbnailUrl(s, model)
  const card = h('div', {
    style: 'display:flex;flex-direction:column;gap:4px;padding:6px;border-radius:var(--r-1,6px);background:var(--bg-2);cursor:pointer;border:2px solid transparent;transition:border-color 200ms, background-color 200ms',
    onmouseenter: (e) => e.currentTarget.style.borderColor = 'var(--accent)',
    onmouseleave: (e) => e.currentTarget.style.borderColor = 'transparent',
    onclick: () => { s.selectedModel = model; s.previewMode = true; ops.renderPreview() }
  },
    h('div', { style: 'width:100%;aspect-ratio:1;background:var(--bg-1);border-radius:var(--r-0,4px);overflow:hidden;border:1px solid var(--rule);display:flex;align-items:center;justify-content:center' },
      h('img', {
        src: thumbUrl,
        style: 'width:100%;height:100%;object-fit:cover;background:var(--bg-1)',
        onerror: (e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:var(--fg-3);font:var(--fs-pico,10px) var(--ff-mono,monospace)">No thumbnail</span>' }
      })
    ),
    h('div', { style: 'font:var(--fs-nano,11px) var(--ff-mono,monospace);color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%' }, model.name || 'Untitled'),
    h('div', { style: 'font:var(--fs-pico,10px) var(--ff-mono,monospace);color:var(--fg-3);display:flex;gap:4px' },
      model.polyCount ? h('span', {}, `${Math.round(model.polyCount / 1000)}k▲`) : null,
      model.fileSize ? h('span', {}, `${Math.round(model.fileSize / 1024 / 1024 * 10) / 10}MB`) : null
    )
  )
  return card
}

export function renderListRow(s, ops, model) {
  const row = h('div', {
    style: 'display:grid;grid-template-columns:80px 1fr auto auto;gap:8px;padding:6px;align-items:center;border-bottom:1px solid var(--rule);cursor:pointer;transition:background 100ms',
    onmouseenter: (e) => e.currentTarget.style.background = 'var(--bg-2)',
    onmouseleave: (e) => e.currentTarget.style.background = 'transparent',
    onclick: () => { s.selectedModel = model; s.previewMode = true; ops.renderPreview() }
  },
    h('div', { style: 'width:80px;aspect-ratio:1;background:var(--bg-2);border-radius:var(--r-hair,3px);overflow:hidden;border:1px solid var(--rule)' },
      h('img', {
        src: thumbnailUrl(s, model),
        style: 'width:100%;height:100%;object-fit:cover',
        onerror: (e) => { e.target.parentNode.innerHTML = '<span style="color:var(--fg-3);font:var(--fs-pico,10px) var(--ff-mono,monospace);display:flex;align-items:center;justify-content:center;width:100%;height:100%">No thumb</span>' }
      })
    ),
    h('div', { style: 'display:flex;flex-direction:column;gap:2px;min-width:0' },
      h('div', { style: 'font:12px monospace;color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, model.name || 'Untitled'),
      h('div', { style: 'font:var(--fs-pico,10px) var(--ff-mono,monospace);color:var(--fg-3)' }, model.path || ''),
      h('div', { style: 'font:var(--fs-pico,10px) var(--ff-mono,monospace);color:var(--fg-3);display:flex;gap:8px' },
        model.polyCount ? h('span', {}, `Poly: ${Math.round(model.polyCount / 1000)}k`) : null,
        model.fileSize ? h('span', {}, `Size: ${Math.round(model.fileSize / 1024 / 1024 * 10) / 10}MB`) : null,
        model.colliderType ? h('span', {}, `Collider: ${model.colliderType}`) : null
      )
    ),
    h('button', {
      class: 'ds-ep-wm-btn ds-ep-wm-btn-primary',
      style: 'padding:4px 8px;font-size:11px;white-space:nowrap',
      onclick: (e) => {
        e.stopPropagation()
        s.opts.onPlaceModel?.(model)
      }
    }, 'Place')
  )
  return row
}
