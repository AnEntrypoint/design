import { loadThree } from './three-runtime.js'
import { initScene } from './scene-setup.js'
import { renderFrame } from './orbit-controls.js'
import { loadModel, toggleWireframe } from './model-loading.js'
import { exportPreview, disposePreview, resizePreview, setCameraDistance, setBackgroundColor } from './viewport-controls.js'

export class ModelPreview {
  constructor(container, opts = {}) {
    this.container = container
    this.model = opts.model || null
    this.modelPath = opts.modelPath || null
    this.size = opts.size || { width: 512, height: 512 }
    this.autoRotate = opts.autoRotate !== false
    this.showWireframe = opts.showWireframe || false
    this.showCollider = opts.showCollider || false
    this.backgroundColor = opts.backgroundColor || 0x1a1a1a
    this.cameraDistance = opts.cameraDistance || 5

    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.model = null
    this.animationId = null
    this.disposed = false
    this.dragging = false
    this.previousMousePosition = { x: 0, y: 0 }

    this.ready = loadThree().then(() => initScene(this))
  }

  loadModel(modelPath) {
    return loadModel(this, modelPath)
  }

  toggleWireframe() {
    toggleWireframe(this)
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate
  }

  toggleCollider() {
    this.showCollider = !this.showCollider
  }

  _animate = () => renderFrame(this)

  exportPreview() {
    exportPreview(this)
  }

  dispose() {
    disposePreview(this)
  }

  resize(width, height) {
    resizePreview(this, width, height)
  }

  setCameraDistance(distance) {
    setCameraDistance(this, distance)
  }

  setBackgroundColor(color) {
    setBackgroundColor(this, color)
  }

  setKeyLightIntensity(intensity) {
    if (this.keyLight) this.keyLight.intensity = intensity
  }

  setFillLightIntensity(intensity) {
    if (this.fillLight) this.fillLight.intensity = intensity
  }
}

export function createModelPreviewViewer(containerElement, opts = {}) {
  return new ModelPreview(containerElement, opts)
}
