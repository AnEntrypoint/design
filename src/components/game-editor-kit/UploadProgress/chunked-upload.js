const CHUNK_SIZE = 5 * 1024 * 1024

export async function uploadFile(session, file) {
  session.state = {
    fileName: file.name,
    fileSize: file.size,
    bytesUploaded: 0,
    totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    currentChunk: 0,
    startTime: performance.now(),
    status: 'uploading',
    errorMessage: null,
    thumbnail: null
  }

  session.abortController = new AbortController()
  session.render()

  try {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('uploadId', uploadId)
      formData.append('chunkIndex', chunkIndex)
      formData.append('totalChunks', totalChunks)
      formData.append('fileName', file.name)

      session.state.currentChunk = chunkIndex + 1
      session.state.bytesUploaded = end
      session.render()

      const response = await fetch('/upload-model', {
        method: 'POST',
        body: formData,
        signal: session.abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (chunkIndex === totalChunks - 1) {
        const result = await response.json()
        if (result.thumbnail) {
          session.state.thumbnail = result.thumbnail
        }
      }
    }

    session.state.status = 'completed'
    session.state.bytesUploaded = file.size
    session.render()
    session.onComplete?.(session.state)
  } catch (error) {
    if (error.name === 'AbortError') {
      session.state.status = 'cancelled'
    } else {
      session.state.status = 'error'
      session.state.errorMessage = error.message
    }
    session.onError?.(error)
    session.render()
  }
}
