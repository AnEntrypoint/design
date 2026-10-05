import * as webjsx from '../../../../vendor/webjsx/index.js'

const h = webjsx.createElement

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
      border-radius: var(--r-0,5px);
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
        background: var(--scrim-strong,rgba(0,0,0,0.65));
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
        text-shadow: 0 1px 2px var(--scrim-strong,rgba(0,0,0,$1));
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
