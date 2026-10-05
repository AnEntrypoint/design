const BUTTON_STYLE = 'padding:4px 8px;background:var(--accent);color:var(--accent-fg);border:none;border-radius:var(--r-hair,3px);cursor:pointer;font-size:11px'

function addButton(parent, label, style, onClick) {
  const button = document.createElement('button')
  button.textContent = label
  button.style.cssText = style
  button.addEventListener('click', onClick)
  parent.appendChild(button)
}

export function setupToolbar(preview) {
  const uiContainer = document.createElement('div')
  uiContainer.style.cssText = 'position:absolute;top:8px;right:8px;display:flex;flex-direction:column;gap:4px;z-index:var(--z-raised,100)'

  addButton(uiContainer, 'Wireframe', BUTTON_STYLE, () => preview.toggleWireframe())
  addButton(uiContainer, 'Collider', BUTTON_STYLE + ';opacity:0.6', () => preview.toggleCollider())
  addButton(uiContainer, 'AutoRotate', BUTTON_STYLE, () => preview.toggleAutoRotate())
  addButton(uiContainer, 'Export', BUTTON_STYLE, () => preview.exportPreview())

  preview.renderer.domElement.parentNode.appendChild(uiContainer)
}
