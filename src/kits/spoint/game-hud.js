export function Crosshair(h) {
  return h('div', { class: 'sp-hud-crosshair' }, '+')
}

export function AmmoCounter(h, props = {}) {
  const { ammo = 0, magazine = 30, reloading = false, reloadProgress = 0 } = props
  return h('div', { class: 'sp-hud-ammo' },
    reloading
      ? h('span', { class: 'sp-hud-ammo-reloading' }, `RELOADING ${reloadProgress}%`)
      : h('span', null, `${ammo}/${magazine}`)
  )
}

export function HealthBar(h, props = {}) {
  const { hp = 100 } = props
  const hpClass = hp > 60 ? 'sp-hud-hp-high' : hp > 30 ? 'sp-hud-hp-mid' : 'sp-hud-hp-low'
  return h('div', { class: 'sp-hud-health' },
    h('div', { class: `sp-hud-health-fill ${hpClass}`, style: `width:${hp}%` }),
    h('span', { class: 'sp-hud-health-num' }, String(hp))
  )
}

export function BoostIndicator(h, props = {}) {
  const { boostSec = 0 } = props
  if (boostSec <= 0) return null
  return h('div', { class: 'sp-hud-boost' }, `BOOSTED ${boostSec}s`)
}

export function renderGameHud(h, state = {}) {
  const {
    hp = 100,
    ammo = 0,
    magazine = 30,
    reloading = false,
    reloadProgress = 0,
    boostSec = 0,
  } = state

  return h('div', { class: 'sp-hud' },
    Crosshair(h),
    AmmoCounter(h, { ammo, magazine, reloading, reloadProgress }),
    HealthBar(h, { hp }),
    BoostIndicator(h, { boostSec })
  )
}
