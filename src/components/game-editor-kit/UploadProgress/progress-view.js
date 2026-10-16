import * as webjsx from '../../../../vendor/webjsx/index.js'
import { formatBytes, calculateETA, getProgress, getUploadSpeed } from './transfer-metrics.js'

const h = webjsx.createElement

function describeStatus(state) {
  if (state.status === 'uploading') {
    return { text: `Uploading: ${state.currentChunk}/${state.totalChunks} chunks`, color: 'var(--fg-1)' }
  }
  if (state.status === 'completed') {
    return { text: 'Upload completed', color: 'var(--success,#28a745)' }
  }
  if (state.status === 'error') {
    return { text: 'Upload failed: ' + (state.errorMessage || 'Unknown error'), color: 'var(--error,#dc3545)' }
  }
  if (state.status === 'cancelled') {
    return { text: 'Upload cancelled', color: 'var(--fg-2)' }
  }
  return { text: '', color: 'var(--fg-2)' }
}

function actionButtons(session) {
  const { state } = session
  return [
    (state.status === 'uploading' || state.status === 'idle') && h('button', {
      type: 'button',
      style: 'padding:6px 12px;font-size:12px;border-radius:var(--r-hair,3px);background:var(--danger,#dc3545);color:var(--on-color,#fff);border:none;cursor:pointer',
      onClick: () => {
        if (session.abortController) session.abortController.abort()
        session.state.status = 'cancelled'
        session.onCancel?.()
        session.render()
      }
    }, 'Cancel'),

    state.status === 'completed' && h('button', {
      type: 'button',
      style: 'padding:6px 12px;font-size:12px;border-radius:var(--r-hair,3px);background:var(--fg-2);color:var(--on-color,#fff);border:none;cursor:pointer',
      onClick: () => {
        session.container.innerHTML = ''
      }
    }, 'Close')
  ]
}

export function renderProgress(session) {
  if (!session.container) return

  const { state } = session
  const progress = getProgress(state)
  const eta = calculateETA(state)
  const speed = getUploadSpeed(state)
  const status = describeStatus(state)

  const content = h('div', { style: 'padding:16px;border-radius:var(--r-0,4px);background:var(--panel-bg,#fff);border:1px solid var(--panel-border,#ddd)' }, [
    h('div', { style: 'margin-bottom:12px' }, [
      h('div', { style: 'font-weight:500;margin-bottom:4px' }, state.fileName),
      h('div', { style: 'font-size:12px;color:var(--fg-2)' }, `${formatBytes(state.bytesUploaded)} / ${formatBytes(state.fileSize)}`)
    ]),

    h('div', { style: 'margin-bottom:12px' }, [
      h('div', { style: 'height:20px;background:var(--panel-bg-2,#eee);border-radius:var(--r-hair,3px);overflow:hidden;border:1px solid var(--panel-border,#ddd)' }, [
        h('div', {
          style: `height:100%;background:var(--primary,#262626);transition:width 0.2s;width:${progress}%`
        })
      ]),
      h('div', { style: 'font-size:11px;color:var(--fg-2);margin-top:4px;text-align:center' }, `${progress}%`)
    ]),

    h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;font-size:11px' }, [
      h('div', {}, [
        h('div', { style: 'color:var(--fg-2)' }, 'Speed'),
        h('div', { style: 'font-weight:500' }, speed)
      ]),
      h('div', {}, [
        h('div', { style: 'color:var(--fg-2)' }, eta ? 'ETA' : ''),
        h('div', { style: 'font-weight:500' }, eta || '-')
      ])
    ]),

    h('div', { style: `color:${status.color};font-size:12px;margin-bottom:12px` }, status.text),

    state.thumbnail ? h('div', { style: 'margin-bottom:12px' }, [
      h('div', { style: 'font-size:11px;color:var(--fg-2);margin-bottom:6px' }, 'Preview'),
      h('img', { src: state.thumbnail, style: 'max-width:100%;max-height:128px;border-radius:var(--r-0,4px);border:1px solid var(--panel-border,#ddd)' })
    ]) : null,

    h('div', { style: 'display:flex;gap:8px;justify-content:flex-end' }, actionButtons(session))
  ].filter(Boolean))

  session.container.innerHTML = ''
  session.container.appendChild(content)
}
