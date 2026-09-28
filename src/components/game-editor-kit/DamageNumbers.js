import { projectToScreen, layerRank } from './damage-projection.js'

/**
 * DamageNumbers — Floating damage text rendering in 3D world space.
 *
 * Creates animated damage indicators that float above hit points, fade out
 * over time. Pure UI layer with no backend dependencies — scene/camera are
 * passed in, no game-state coupling. Compatible with THREE.js.
 *
 * Factory pattern: createDamageNumbers(scene, camera, config) returns {
 *   addNumber(damage, worldPos, options),
 *   update(deltaTime),
 *   getActiveNumbers(),
 *   cleanup()
 * }
 */

const FALLBACK_SIZE = { width: 1920, height: 1080 }
const BIG_HIT = 25
const MAX_SCALE_BONUS = 0.5
const DEFAULT_FLOAT_PX = 60
const DEFAULT_MAX_ACTIVE = 200
const SCOPE_SELECTOR = '.ds-247420'

const positive = (value, fallback) => (Number.isFinite(value) && value > 0 ? value : fallback)

// Every rule in the bundled stylesheet sits under the scope class, and a consumer may put that class on
// <html>, <body> or only a root <div>. Mounting on a body that is outside the scope would leave the number
// unstyled (position:static, default size), so the default mount is the body only when it is inside the scope.
function defaultMount() {
	if (typeof document === 'undefined') return null
	if (document.body.closest(SCOPE_SELECTOR)) return document.body
	return document.querySelector(SCOPE_SELECTOR) || document.body
}

/**
 * Create a damage numbers manager.
 *
 * @param {THREE.Scene} scene - The THREE.js scene (for container attachment).
 * @param {THREE.Camera} camera - The THREE.js camera (for projection math).
 * @param {Object} [config={}] - Configuration object.
 * @param {HTMLElement} [config.container] - DOM container for text elements. Defaults to document.body, or the .ds-247420 element when the body is outside that style scope.
 * @param {string} [config.defaultColor] - Default color for numbers. Defaults to the --danger token.
 * @param {number} [config.defaultFontSize] - Default font size in pixels. Defaults to the --fs-h2 token.
 * @param {number} [config.defaultDuration=1500] - Lifetime in milliseconds.
 * @param {number} [config.maxActive=200] - Most numbers on screen at once; past it the oldest is retired first.
 * @param {boolean} [config.useLargerFontForBigDamage=true] - Scale font size with damage amount.
 * @returns {Object} Manager with methods: addNumber, update, getActiveNumbers, cleanup.
 */
export function createDamageNumbers(scene, camera, config = {}) {
	const {
		container: requestedContainer,
		defaultColor,
		defaultFontSize,
		defaultDuration = 1500,
		maxActive = DEFAULT_MAX_ACTIVE,
		useLargerFontForBigDamage = true
	} = config

	const activeLimit = Math.floor(positive(maxActive, DEFAULT_MAX_ACTIVE))
	const container = requestedContainer || defaultMount()
	const numbers = []
	const framedByContainer = !!requestedContainer && (typeof document === 'undefined' || requestedContainer !== document.body)

	// Numbers are position:fixed, so an explicit container contributes its viewport offset as well as its size;
	// the default mount is only a style scope, and the frame is the viewport.
	function canvasFrame() {
		if (framedByContainer && container.clientWidth) {
			const box = container.getBoundingClientRect()
			return { left: box.left, top: box.top, width: container.clientWidth, height: container.clientHeight || FALLBACK_SIZE.height }
		}
		if (typeof window !== 'undefined') return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
		return { left: 0, top: 0, ...FALLBACK_SIZE }
	}

	function createElement(value, screen, frame, options) {
		if (!container || typeof document === 'undefined') return null
		const el = document.createElement('div')
		el.className = 'ds-damage-number'
		el.textContent = String(Math.abs(Math.floor(value)))
		el.style.left = `${frame.left + screen.x}px`
		el.style.top = `${frame.top + screen.y}px`
		el.style.setProperty('--ds-damage-rank', layerRank(screen.depth))
		if (useLargerFontForBigDamage && Math.abs(value) > BIG_HIT) {
			el.style.setProperty('--ds-damage-scale', 1 + Math.min(Math.abs(value) / 100, MAX_SCALE_BONUS))
		}
		const color = options.color || defaultColor
		if (color) el.style.setProperty('--ds-damage-color', color)
		if (defaultFontSize) el.style.setProperty('--ds-damage-size', `${defaultFontSize}px`)
		container.appendChild(el)
		return el
	}

	function addNumber(damage, worldPos, callOptions) {
		const options = callOptions || {}
		const value = Number(damage)
		if (damage === null || damage === undefined || !Number.isFinite(value)) return null
		const frame = canvasFrame()
		const screen = projectToScreen(camera, worldPos, frame.width, frame.height)
		if (!screen) return null
		const element = createElement(value, screen, frame, options)
		if (!element) return null

		const entry = {
			damage: value,
			worldPos: { x: worldPos.x, y: worldPos.y, z: worldPos.z },
			screenPos: { x: screen.x, y: screen.y, z: screen.depth },
			element,
			startTime: Date.now(),
			duration: positive(options.duration, positive(defaultDuration, 1500)),
			floatDistance: Number.isFinite(options.floatDistance) ? options.floatDistance : DEFAULT_FLOAT_PX,
			isActive: true,
			destroyPending: false
		}
		while (numbers.length >= activeLimit) retire(numbers[0], 0)
		numbers.push(entry)
		return entry
	}

	function retire(entry, index) {
		entry.destroyPending = true
		entry.isActive = false
		if (entry.element && entry.element.parentNode) entry.element.parentNode.removeChild(entry.element)
		entry.element = null
		numbers.splice(index, 1)
	}

	// The float distance is a CSS variable, not a transform written here, so a prefers-reduced-motion
	// rule in editor-primitives.css can drop the motion while the fade still plays.
	function update(deltaTime = 16) {
		for (let i = numbers.length - 1; i >= 0; i--) {
			const entry = numbers[i]
			const progress = Math.min((Date.now() - entry.startTime) / entry.duration, 1)
			if (!entry.element || progress >= 1) { retire(entry, i); continue }
			entry.element.style.opacity = String(1 - progress)
			entry.element.style.setProperty('--ds-damage-float', `${progress * entry.floatDistance}px`)
		}
	}

	function getActiveNumbers() {
		const now = Date.now()
		return numbers.filter(n => n.isActive).map(n => ({
			damage: n.damage,
			worldPos: n.worldPos,
			screenPos: n.screenPos,
			elapsed: now - n.startTime,
			duration: n.duration,
			progress: Math.min((now - n.startTime) / n.duration, 1)
		}))
	}

	function cleanup() {
		while (numbers.length) retire(numbers[numbers.length - 1], numbers.length - 1)
	}

	return { addNumber, update, getActiveNumbers, cleanup }
}
