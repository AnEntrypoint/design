import { three } from './three-runtime.js'

export function exportPreview(preview) {
  if (!preview.renderer) return
  const canvas = preview.renderer.domElement
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `preview-${Date.now()}.png`
  link.click()
}

export function disposePreview(preview) {
  preview.disposed = true
  if (preview.animationId) {
    cancelAnimationFrame(preview.animationId)
  }
  if (preview.renderer) {
    preview.renderer.dispose()
    preview.renderer.domElement.parentNode?.removeChild(preview.renderer.domElement)
  }
}

export function resizePreview(preview, width, height) {
  if (!preview.renderer) return
  preview.camera.aspect = width / height
  preview.camera.updateProjectionMatrix()
  preview.renderer.setSize(width, height)
}

export function setCameraDistance(preview, distance) {
  if (!preview.camera) return
  preview.cameraDistance = distance
  const currentDist = preview.camera.position.length()
  preview.camera.position.multiplyScalar(distance / currentDist)
}

export function setBackgroundColor(preview, color) {
  preview.backgroundColor = color
  if (!preview.scene) return
  preview.scene.background = new three.THREE.Color(color)
}
