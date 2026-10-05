import * as webjsx from '../../../../vendor/webjsx/index.js'
import { renderToolbar } from './toolbar.js'
import { renderFolderTree, renderFolderPanel } from './folders.js'
import { renderAssetList } from './assets.js'
const h = webjsx.createElement

export function createAssetBrowser(opts = {}) {
  const s = {
    onAssetSelect: opts.onAssetSelect || (() => {}),
    onAssetMove: opts.onAssetMove || (() => {}),
    onFolderCreate: opts.onFolderCreate || (() => {}),
    onFolderDelete: opts.onFolderDelete || (() => {}),
    onFolderRename: opts.onFolderRename || (() => {}),
    assets: opts.initialAssets || [],
    folders: opts.initialFolders || {},
    currentFolder: '',
    searchQuery: '',
    selectedTags: new Set(),
    container: null,
    renderStart: 0
  }
  const ops = {}

  function render() {
    if (!s.container) return

    const toolbar = renderToolbar(s, ops)
    const breadcrumbs = renderFolderTree(s, ops)
    const folderPanel = renderFolderPanel(s, ops)
    const assetList = renderAssetList(s, ops)

    const content = h('div', { style: 'display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden' }, [
      toolbar,
      breadcrumbs,
      folderPanel,
      h('div', { style: 'flex:1;overflow-y:auto' }, [assetList])
    ])

    s.container.innerHTML = ''
    s.container.appendChild(content)
  }

  ops.render = render

  return {
    mount(container) {
      s.container = container
      s.container.classList.add('ds-ep-panel')
      s.container.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0'
      render()
    },
    setAssets(assets) {
      s.assets = assets
      render()
    },
    setFolders(folders) {
      s.folders = folders
      render()
    },
    getCurrentFolder() {
      return s.currentFolder
    },
    navigateToFolder(path) {
      s.currentFolder = path
      render()
    },
    render
  }
}
