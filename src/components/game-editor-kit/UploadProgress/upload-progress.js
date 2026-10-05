import { renderProgress } from './progress-view.js'
import { uploadFile } from './chunked-upload.js'

export function createUploadProgress(opts = {}) {
  const session = {
    container: null,
    abortController: null,
    onCancel: opts.onCancel || (() => {}),
    onComplete: opts.onComplete || (() => {}),
    onError: opts.onError || (() => {}),
    state: {
      fileName: '',
      fileSize: 0,
      bytesUploaded: 0,
      totalChunks: 0,
      currentChunk: 0,
      startTime: 0,
      status: 'idle'
    },
    render: () => renderProgress(session)
  }

  return {
    mount(container) {
      session.container = container
      container.classList.add('ds-ep-panel')
      container.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0;justify-content:center;align-items:center;padding:24px'
      session.render()
    },
    uploadFile: (file) => uploadFile(session, file),
    getState() {
      return session.state
    },
    render: session.render
  }
}
