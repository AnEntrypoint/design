import { three } from './three-runtime.js'
import { setupControls } from './orbit-controls.js'
import { setupToolbar } from './toolbar.js'

export function setupLighting(preview) {
  const { THREE } = three
  const keyLight = new THREE.DirectionalLight(0xffffff, 1)
  keyLight.position.set(5, 8, 5)
  keyLight.castShadow = false
  preview.scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-5, 3, -5)
  preview.scene.add(fillLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  preview.scene.add(ambientLight)

  preview.keyLight = keyLight
  preview.fillLight = fillLight
}

export function initScene(preview) {
  if (preview.disposed) return
  const { THREE } = three
  preview.raycaster = new THREE.Raycaster()
  preview.mouse = new THREE.Vector2()
  preview.container.style.cssText = 'position:relative;width:100%;height:100%;background:var(--bg-2);overflow:hidden'

  preview.scene = new THREE.Scene()
  preview.scene.background = new THREE.Color(preview.backgroundColor)

  const width = preview.container.clientWidth || preview.size.width
  const height = preview.container.clientHeight || preview.size.height

  preview.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  preview.camera.position.set(preview.cameraDistance, preview.cameraDistance * 0.6, preview.cameraDistance)

  preview.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  preview.renderer.setSize(width, height)
  preview.renderer.setPixelRatio(window.devicePixelRatio || 1)
  preview.container.appendChild(preview.renderer.domElement)

  setupLighting(preview)
  setupControls(preview)
  setupToolbar(preview)
  preview._animate()
}
