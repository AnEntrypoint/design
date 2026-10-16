export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}

export function calculateETA(state) {
  if (state.bytesUploaded === 0 || state.startTime === 0) return null

  const elapsed = (performance.now() - state.startTime) / 1000
  const bytesPerSecond = state.bytesUploaded / elapsed
  const bytesRemaining = state.fileSize - state.bytesUploaded

  if (bytesPerSecond <= 0) return null

  const secondsRemaining = Math.round(bytesRemaining / bytesPerSecond)
  if (secondsRemaining < 60) return secondsRemaining + 's'
  if (secondsRemaining < 3600) return Math.round(secondsRemaining / 60) + 'm'
  return Math.round(secondsRemaining / 3600) + 'h'
}

export function getProgress(state) {
  if (state.fileSize === 0) return 0
  return Math.min(100, Math.round((state.bytesUploaded / state.fileSize) * 100))
}

export function getUploadSpeed(state) {
  if (state.bytesUploaded === 0 || state.startTime === 0) return '0 MB/s'
  const elapsed = (performance.now() - state.startTime) / 1000
  const mbPerSecond = (state.bytesUploaded / 1024 / 1024) / elapsed
  if (mbPerSecond < 0.1) return (mbPerSecond * 1000).toFixed(0) + ' KB/s'
  return mbPerSecond.toFixed(1) + ' MB/s'
}
