export function promptText(wm, opts = {}) {
  return new Promise((resolve) => {
    const value = prompt(opts.label || 'Enter value', opts.value || '')
    resolve(value)
  })
}
