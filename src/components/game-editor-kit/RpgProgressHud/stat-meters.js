import * as webjsx from '../../../../vendor/webjsx/index.js'

const h = webjsx.createElement

export function StatBar(props = {}) {
  const {
    value = 0,
    max = 1,
    color = 'var(--accent,#262626)',
    label,
    className = ''
  } = props
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0

  return h('div', {
    class: `ds-rpg-statbar ${className}`.trim(),
    style: `
      position: relative;
      width: 100%;
      height: 14px;
      border-radius: var(--r-0,4px);
      background: var(--bg-1,#1a1a1a);
      border: 1px solid var(--rule,#444);
      overflow: hidden;
    `
  },
    h('div', {
      style: `
        position: absolute;
        inset: 0;
        width: ${pct}%;
        background: ${color};
        transition: width 200ms ease-out;
      `
    }),
    h('div', {
      style: `
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: var(--fg,#ccc);
        text-shadow: 0 1px 2px var(--scrim-strong,rgba(0,0,0,$1));
        white-space: nowrap;
      `
    }, label != null ? String(label) : `${Math.round(value)}/${Math.round(max)}`)
  )
}

export function LevelBadge(props = {}) {
  const { level = 1 } = props
  return h('div', {
    class: 'ds-rpg-level-badge',
    title: `Level ${level}`,
    style: `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent,#262626);
      color: var(--accent-fg,#fff);
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
      border: 2px solid var(--bg-1,#1a1a1a);
    `
  }, String(level))
}
