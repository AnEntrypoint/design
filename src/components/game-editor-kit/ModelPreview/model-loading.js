import { three } from './three-runtime.js'

function frameModel(preview) {
  const { THREE } = three
  const box = new THREE.Box3().setFromObject(preview.model)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)

  preview.model.position.sub(center)
  const fov = preview.camera.fov * (Math.PI / 180)
  const cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2))
  preview.camera.position.z = cameraZ * 1.5
  preview.camera.lookAt(0, 0, 0)

  preview.bbox = box
}

export async function loadModel(preview, modelPath) {
  preview.modelPath = modelPath
  await preview.ready
  if (preview.disposed) return
  const loader = new three.GLTFLoader()

  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.load(modelPath, resolve, undefined, reject)
    })

    if (preview.model) {
      preview.scene.remove(preview.model)
    }

    preview.model = gltf.scene
    preview.scene.add(preview.model)

    frameModel(preview)
    preview.model.castShadow = false
    preview.model.receiveShadow = false

    preview.model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false
        node.receiveShadow = false
      }
    })
  } catch (err) {
    console.error('Failed to load model:', err)
  }
}

export function toggleWireframe(preview) {
  preview.showWireframe = !preview.showWireframe
  if (!preview.model) return
  preview.model.traverse((node) => {
    if (node.isMesh && node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach(mat => { mat.wireframe = preview.showWireframe })
      } else {
        node.material.wireframe = preview.showWireframe
      }
    }
  })
}
