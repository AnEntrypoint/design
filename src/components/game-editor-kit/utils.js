
export function showToast(message, type = 'info') {
  const duration = type === 'error' ? 5000 : 3000
  const toastContainer = document.getElementById('game-editor-kit-toast-container') || (() => {
    const container = document.createElement('div')
    container.id = 'game-editor-kit-toast-container'
    container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:var(--z-toast,900);display:flex;flex-direction:column;gap:8px'
    document.body.appendChild(container)
    return container
  })()

  const toast = document.createElement('div')
  const bgColor = type === 'error' ? 'var(--danger,#cc2222)' : type === 'success' ? 'var(--success,#22aa22)' : 'var(--accent,#262626)'
  const fgColor = 'var(--on-color,#ffffff)'
  toast.style.cssText = `
    background:${bgColor};
    color:${fgColor};
    padding:12px 16px;
    border-radius:4px;
    font-size:12px;
    box-shadow:var(--shadow-overlay,0 2px 8px rgba(0,0,0,0.3));
    max-width:300px;
    word-wrap:break-word;
    animation:slideIn 200ms ease-out;
  `
  toast.textContent = message

  const style = document.createElement('style')
  if (!document.getElementById('game-editor-kit-toast-styles')) {
    style.id = 'game-editor-kit-toast-styles'
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideOut 200ms ease-out'
    setTimeout(() => toast.remove(), 200)
  }, duration)
}
