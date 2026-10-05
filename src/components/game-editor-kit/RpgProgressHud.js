import * as webjsx from '../../../vendor/webjsx/index.js'
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
      border-radius: 4px;
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
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
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
      border-radius: 4px;
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

export function AbilitySlot(props = {}) {
  const {
    id,
    name = '',
    icon,
    hotkey,
    unlocked = true,
    cooldownRemaining = 0,
    cooldownMax = 0
  } = props
  const glyph = icon || name.charAt(0).toUpperCase() || '?'
  const onCooldown = unlocked && cooldownRemaining > 0
  const cooldownFrac = onCooldown && cooldownMax > 0
    ? Math.max(0, Math.min(1, cooldownRemaining / cooldownMax))
    : 0

  return h('div', {
    key: id,
    class: 'ds-rpg-ability-slot',
    title: unlocked ? name : `${name} (locked)`,
    style: `
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 5px;
      background: var(--bg-2,#222);
      border: 1px solid var(--rule,#444);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: ${unlocked ? 'var(--fg,#ccc)' : 'var(--fg-3,#888)'};
      opacity: ${unlocked ? 1 : 0.4};
      overflow: hidden;
      flex-shrink: 0;
    `
  },
    glyph,
    onCooldown ? h('div', {
      style: `
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: ${cooldownFrac > 0 ? cooldownFrac * 100 : 100}%;
        background: rgba(0,0,0,0.65);
      `
    }) : null,
    onCooldown ? h('div', {
      style: `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: var(--fg,#ccc);
        text-shadow: 0 1px 2px rgba(0,0,0,0.9);
      `
    }, String(Math.ceil(cooldownRemaining))) : null,
    hotkey != null ? h('div', {
      style: `
        position: absolute;
        top: 1px;
        right: 2px;
        font-size: 8px;
        font-weight: 700;
        color: var(--fg-3,#888);
      `
    }, String(hotkey)) : null,
    !unlocked ? h('div', {
      style: `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      `
    }, '\u{1F512}') : null
  )
}

export function AbilityBar(props = {}) {
  const { abilities = [] } = props
  if (abilities.length === 0) return null
  return h('div', {
    class: 'ds-rpg-ability-bar',
    style: `
      display: flex;
      gap: 4px;
    `
  }, ...abilities.map(a => AbilitySlot(a)))
}

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
      z-index: 9000;
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
        border-radius: 6px;
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
