import * as webjsx from '../../../../vendor/webjsx/index.js'
import { StatBar, LevelBadge } from './stat-meters.js'
import { QuestPanel } from './quest-panel.js'
import { AbilityBar } from './ability-slots.js'

const h = webjsx.createElement

export function RpgProgressHud(props = {}) {
  const {
    level = 1,
    xp = 0,
    xpToNext = 100,
    health = 100,
    maxHealth = 100,
    mana = 100,
    maxMana = 100,
    questTitle = null,
    questProgress = 0,
    questTarget = 0,
    abilities = [],
    className = ''
  } = props

  return h('div', {
    class: `ds-rpg-hud ${className}`.trim(),
    style: `
      position: fixed;
      left: 16px;
      bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      pointer-events: none;
      z-index: var(--z-dock,600);
      user-select: none;
    `
  },
    questTitle ? QuestPanel({ title: questTitle, progress: questProgress, target: questTarget }) : null,
    h('div', {
      style: `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: var(--bg-2,#222);
        border: 1px solid var(--rule,#444);
        border-radius: var(--r-1,6px);
        min-width: 220px;
      `
    },
      LevelBadge({ level }),
      h('div', {
        style: `
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        `
      },
        StatBar({ value: health, max: maxHealth, color: 'var(--danger,#cc3333)' }),
        StatBar({ value: mana, max: maxMana, color: 'var(--accent,#262626)' }),
        StatBar({ value: xp, max: xpToNext, color: 'var(--success,#33aa55)', label: `XP ${Math.round(xp)}/${Math.round(xpToNext)}` })
      )
    ),
    AbilityBar({ abilities })
  )
}
