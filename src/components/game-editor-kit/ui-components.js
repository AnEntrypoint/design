import * as webjsx from '../../../vendor/webjsx/index.js'
const h = webjsx.createElement

export function Btn(opts = {}) {
  const {
    dense = false,
    ghost = false,
    primary = false,
    danger = false,
    onClick,
    title,
    key,
    children = [],
    className = ''
  } = opts

  const base = 'ds-gek-btn'
  const classes = [base, ghost && 'ds-gek-btn-ghost', dense && 'ds-gek-btn-dense', primary && 'ds-gek-btn-primary', danger && 'ds-gek-btn-danger', className].filter(Boolean).join(' ')
  const label = title || children.filter(c => typeof c === 'string').join(' ') || undefined
  return h('button', {
    type: 'button',
    key,
    class: classes,
    title: title || undefined,
    'aria-label': label,
    onclick: onClick
  }, ...children)
}

export function SearchInput(opts = {}) {
  const {
    value = '',
    placeholder = 'Search...',
    onInput
  } = opts

  return h('input', {
    type: 'text',
    value,
    placeholder,
    oninput: (e) => onInput?.(e.target.value),
    style: `
      padding: 4px 6px;
      border-radius: var(--r-0,4px);
      border: 1px solid var(--rule,#444);
      background: var(--bg-1,#1a1a1a);
      color: var(--fg,#ccc);
      font-size: 11px;
      font-family: monospace;
      flex: 1;
      min-width: 120px;
    `
  })
}

export function EmptyState(opts = {}) {
  const { text = 'No items' } = opts
  return h('div', {
    style: `
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--fg-3,#888);
      font-size: 12px;
      text-align: center;
      padding: 24px;
    `
  }, text)
}

export function Toolbar(opts = {}) {
  const { children = [] } = opts
  return h('div', {
    style: `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px;
      flex-wrap: wrap;
      min-height: 40px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rule,#444);
      background: var(--bg-2,#222);
    `
  }, ...children)
}

export function getSharedWM() {
  return {
    initialized: true
  }
}
