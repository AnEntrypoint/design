import * as webjsx from '../../../../vendor/webjsx/index.js'
import { StatBar } from './stat-meters.js'

const h = webjsx.createElement

export function QuestPanel(props = {}) {
  const { title, progress = 0, target = 0 } = props
  if (!title) return null

  return h('div', {
    class: 'ds-rpg-quest',
    style: `
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 6px 10px;
      background: var(--bg-2,#222);
      border: 1px solid var(--rule,#444);
      border-radius: var(--r-0,4px);
      min-width: 180px;
    `
  },
    h('div', {
      style: `
        font-size: 11px;
        font-weight: 600;
        color: var(--fg,#ccc);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `
    }, title),
    target > 0
      ? StatBar({ value: progress, max: target, color: 'var(--warn,#cc9922)', className: 'ds-rpg-quest-bar' })
      : null
  )
}
