import * as webjsx from '../../../../vendor/webjsx/index.js'
import { showToast } from '../utils.js'
import { renderToolbar } from './toolbar.js'
import { renderGridView, renderListView } from './views.js'
import { renderPreview } from './preview.js'
const { applyDiff } = webjsx

export function createModelBrowser(container, opts = {}) {
  const s = {
    opts,
    container,
    active: null,
    models: [],
    search: '',
    viewMode: 'grid',
    sortBy: 'name',
    filterCategory: 'all',
    filterMaterial: 'all',
    filterScale: 'all',
    selectedModel: null,
    loading: false,
    error: null,
    toolbarHost: null,
    viewHost: null,
    previewMode: false
  }
  const ops = {}

  container.classList.add('ds-ep-panel', 'model-browser')
  container.style.cssText = 'display:flex;flex-direction:column;height:100%;background:var(--bg-1,#1a1a1a)'

  function ensureHosts() {
    if (s.toolbarHost && s.toolbarHost.isConnected) return
    container.innerHTML = ''
    s.toolbarHost = document.createElement('div')
    s.toolbarHost.style.cssText = 'flex-shrink:0;border-bottom:1px solid var(--rule);background:var(--bg-2,#222)'
    s.viewHost = document.createElement('div')
    s.viewHost.style.cssText = 'flex:1;min-height:0;overflow-y:auto'
    container.append(s.toolbarHost, s.viewHost)
    renderToolbar(s, ops)
  }

  function loadModels() {
    s.loading = true
    s.error = null
    s.models = []
    render()
    try {
      const models = opts.getAvailableModels?.() || []
      s.models = Array.isArray(models) ? models : Object.values(models)
      if (!Array.isArray(s.models)) s.models = []
    } catch (err) {
      s.error = err.message
      showToast(`Failed to load models: ${err.message}`, 'error')
    } finally {
      s.loading = false
      render()
    }
  }

  function render() {
    if (!s.active) return
    ensureHosts()
    if (s.previewMode) {
      renderPreview(s, ops)
      return
    }
    const view = s.viewMode === 'grid' ? renderGridView(s, ops) : renderListView(s, ops)
    applyDiff(s.viewHost, [view])
  }

  ops.render = render
  ops.loadModels = loadModels
  ops.renderPreview = () => renderPreview(s, ops)

  s.active = container
  loadModels()
  render()

  return {
    refresh: loadModels,
    setModels: (models) => { s.models = models; render() },
    destroy: () => { s.active = null }
  }
}
