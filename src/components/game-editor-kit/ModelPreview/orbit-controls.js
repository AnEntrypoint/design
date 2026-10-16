export function setupControls(preview) {
  preview.renderer.domElement.addEventListener('mousedown', (e) => {
    preview.dragging = true
    preview.previousMousePosition = { x: e.clientX, y: e.clientY }
  })

  preview.renderer.domElement.addEventListener('mousemove', (e) => {
    if (!preview.dragging || !preview.model) return
    const deltaX = e.clientX - preview.previousMousePosition.x
    const deltaY = e.clientY - preview.previousMousePosition.y
    preview.model.rotation.y += deltaX * 0.01
    preview.model.rotation.x += deltaY * 0.01
    preview.previousMousePosition = { x: e.clientX, y: e.clientY }
  })

  preview.renderer.domElement.addEventListener('mouseup', () => {
    preview.dragging = false
  })

  preview.renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault()
    preview.camera.position.multiplyScalar(1 + e.deltaY * 0.001)
  })
}

export function renderFrame(preview) {
  preview.animationId = requestAnimationFrame(preview._animate)

  if (preview.model && preview.autoRotate && !preview.dragging) {
    preview.model.rotation.y += 0.005
  }

  preview.renderer.render(preview.scene, preview.camera)
}
