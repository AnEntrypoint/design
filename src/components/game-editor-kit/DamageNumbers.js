import { projectToScreen, layerRank } from './damage-projection.js'

const FALLBACK_SIZE = { width: 1920, height: 1080 }
const BIG_HIT = 25
const MAX_SCALE_BONUS = 0.5
const MAX_DISPLAYED = 999999999
const DEFAULT_FLOAT_PX = 60
const DEFAULT_DURATION_MS = 1500
const DEFAULT_MAX_ACTIVE = 200
const STYLE_SCOPE_CLASS = 'ds-247420'
const LAYER_ATTRIBUTE = 'data-ds-damage-layer'
const INHERITED_SCOPE_ATTRIBUTES = ['data-theme', 'data-accent', 'data-density', 'data-typescale']

const positive = (value, fallback) => (Number.isFinite(value) && value > 0 ? value : fallback)
const monotonicNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now())

function numericDamage(damage) {
	if (typeof damage === 'number') return Number.isFinite(damage) ? damage : null
	if (typeof damage === 'string' && damage.trim() !== '') {
		const parsed = Number(damage)
		return Number.isFinite(parsed) ? parsed : null
	}
	return null
}

function createStyledLayer() {
	if (typeof document === 'undefined' || !document.body) return null
	const layer = document.createElement('div')
	layer.className = STYLE_SCOPE_CLASS
	layer.setAttribute(LAYER_ATTRIBUTE, '')
	const scopeRoot = document.querySelector(`.${STYLE_SCOPE_CLASS}:not([${LAYER_ATTRIBUTE}])`)
	if (scopeRoot) {
		for (const name of INHERITED_SCOPE_ATTRIBUTES) {
			const value = scopeRoot.getAttribute(name)
			if (value !== null) layer.setAttribute(name, value)
		}
	}
	document.body.appendChild(layer)
	return layer
}

/**
 * Create a damage numbers manager.
 *
 * @param {THREE.Scene} scene - Accepted for API symmetry with the host's scene; not used by the projection.
 * @param {THREE.Camera} camera - The THREE.js camera (for projection math).
 * @param {Object} [config={}] - Configuration object.
 * @param {HTMLElement} [config.container] - Element whose on-screen box the 3D view occupies. Defaults to the viewport. Numbers are not mounted inside it.
 * @param {string} [config.defaultColor] - Default color for numbers. Defaults to the --danger-ink token.
 * @param {number} [config.defaultFontSize] - Default font size in pixels. Defaults to the --fs-h2 token.
 * @param {number} [config.defaultDuration=1500] - Lifetime in milliseconds.
 * @param {number} [config.maxActive=200] - Most numbers on screen at once; past it the oldest is retired first.
 * @param {boolean} [config.useLargerFontForBigDamage=true] - Scale font size with damage amount.
 * @returns {Object} Manager with methods: addNumber, update, getActiveNumbers, cleanup.
 */
export function createDamageNumbers(scene, camera, config) {
	const {
		container,
		defaultColor,
		defaultFontSize,
		defaultDuration = DEFAULT_DURATION_MS,
		maxActive = DEFAULT_MAX_ACTIVE,
		useLargerFontForBigDamage = true
	} = config || {}

	const activeLimit = Math.max(1, Math.floor(positive(maxActive, DEFAULT_MAX_ACTIVE)))
	const fontSizePx = positive(defaultFontSize, null)
	const numbers = []
	let layer = null

	function overlayLayer() {
		if (!layer || !layer.parentNode) layer = createStyledLayer()
		return layer
	}

	function frameOfViewportOrContainer() {
		if (container && typeof container.getBoundingClientRect === 'function' && container.clientWidth > 0 && container.clientHeight > 0) {
			const box = container.getBoundingClientRect()
			const scaleX = container.offsetWidth ? box.width / container.offsetWidth : 1
			const scaleY = container.offsetHeight ? box.height / container.offsetHeight : 1
			return {
				left: box.left + container.clientLeft * scaleX,
				top: box.top + container.clientTop * scaleY,
				width: container.clientWidth * scaleX,
				height: container.clientHeight * scaleY
			}
		}
		if (typeof window !== 'undefined') return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
		return { left: 0, top: 0, ...FALLBACK_SIZE }
	}

	function mountElement(shown, look, frame, screen) {
		const host = overlayLayer()
		if (!host) return null
		const el = document.createElement('div')
		el.className = 'ds-damage-number'
		el.textContent = String(shown)
		el.style.left = `${frame.left + screen.x}px`
		el.style.top = `${frame.top + screen.y}px`
		el.style.setProperty('--ds-damage-rank', layerRank(screen))
		if (look.scale !== null) el.style.setProperty('--ds-damage-scale', look.scale)
		if (look.color) el.style.setProperty('--ds-damage-color', look.color)
		if (fontSizePx !== null) el.style.setProperty('--ds-damage-size', `${fontSizePx}px`)
		host.appendChild(el)
		return el
	}

	function addNumber(damage, worldPos, callOptions) {
		const options = callOptions || {}
		const value = numericDamage(damage)
		if (value === null) return null
		const frame = frameOfViewportOrContainer()
		const screen = projectToScreen(camera, worldPos, frame.width, frame.height)
		if (!screen) return null

		const shown = Math.min(Math.floor(Math.abs(value)), MAX_DISPLAYED)
		const look = {
			color: options.color || defaultColor,
			scale: useLargerFontForBigDamage && shown > BIG_HIT ? 1 + Math.min(shown / 100, MAX_SCALE_BONUS) : null
		}
		const duration = positive(options.duration, positive(defaultDuration, DEFAULT_DURATION_MS))
		const floatDistance = Number.isFinite(options.floatDistance) ? options.floatDistance : DEFAULT_FLOAT_PX

		while (numbers.length >= activeLimit) retire(numbers[0], 0)
		const element = mountElement(shown, look, frame, screen)
		if (!element) return null

		const entry = {
			damage: value,
			worldPos: screen.position,
			screenPos: { x: screen.x, y: screen.y, z: screen.depth },
			element,
			startTime: monotonicNow(),
			duration,
			floatDistance,
			isActive: true,
			destroyPending: false
		}
		numbers.push(entry)
		return entry
	}

	function retire(entry, index) {
		numbers.splice(index, 1)
		const element = entry.element
		entry.element = null
		entry.isActive = false
		entry.destroyPending = true
		if (element && element.parentNode) element.parentNode.removeChild(element)
	}

	function update() {
		const now = monotonicNow()
		for (let i = numbers.length - 1; i >= 0; i--) {
			const entry = numbers[i]
			const progress = Math.min(Math.max(now - entry.startTime, 0) / entry.duration, 1)
			if (!entry.element || progress >= 1) { retire(entry, i); continue }
			entry.element.style.opacity = String(1 - progress)
			entry.element.style.setProperty('--ds-damage-float', `${progress * entry.floatDistance}px`)
		}
	}

	function getActiveNumbers() {
		const now = monotonicNow()
		return numbers.map(n => ({
			damage: n.damage,
			worldPos: { ...n.worldPos },
			screenPos: { ...n.screenPos },
			elapsed: Math.max(now - n.startTime, 0),
			duration: n.duration,
			progress: Math.min(Math.max(now - n.startTime, 0) / n.duration, 1)
		}))
	}

	function cleanup() {
		while (numbers.length) retire(numbers[numbers.length - 1], numbers.length - 1)
		if (layer && layer.parentNode) layer.parentNode.removeChild(layer)
		layer = null
	}

	return { addNumber, update, getActiveNumbers, cleanup }
}
