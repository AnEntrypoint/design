// World position -> canvas pixel coordinates for DamageNumbers. Pure: no DOM, no imports, loads in Node.
//
// A THREE.Camera has no project() method; the projection is Vector3.project(camera). Three call shapes
// are accepted so the host never has to adapt: a camera-like object exposing project(pos) directly, a
// Vector3 worldPos (cloned, because project() mutates), or a plain {x,y,z} projected through the Vector3
// class the camera's own position already carries -- so this module never imports 'three'.

const RANK_SPAN = 98

const isFinitePoint = (p) => !!p && typeof p === 'object' && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)

export function normalizePosition(worldPos) {
	return isFinitePoint(worldPos) ? { x: worldPos.x, y: worldPos.y, z: worldPos.z } : null
}

function toNdc(camera, worldPos, pos) {
	if (typeof camera.project === 'function') return camera.project(pos)
	const Vec = typeof worldPos.clone === 'function' ? worldPos.constructor : camera.position && camera.position.constructor
	if (typeof Vec !== 'function') return null
	const v = typeof worldPos.clone === 'function' ? worldPos.clone() : new Vec(pos.x, pos.y, pos.z)
	return typeof v.project === 'function' ? v.project(camera) : null
}

// null when the point cannot be drawn: no camera, a non-finite position, behind the camera / past the
// far plane (NDC z > 1, where x/y come back mirrored), or outside the viewport.
export function projectToScreen(camera, worldPos, width, height) {
	const pos = normalizePosition(worldPos)
	if (!pos || !camera) return null
	const ndc = toNdc(camera, worldPos, pos)
	if (!ndc || !Number.isFinite(ndc.x) || !Number.isFinite(ndc.y) || !Number.isFinite(ndc.z)) return null
	if (ndc.z > 1 || ndc.z < -1 || Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1) return null
	return { x: (ndc.x + 1) / 2 * width, y: (1 - ndc.y) / 2 * height, depth: ndc.z }
}

// Nearer numbers (smaller depth) draw above farther ones. The rank is added to the --z-raised rung in CSS,
// so it stays inside that rung's 100-step gap instead of being a raw z-index.
export function layerRank(depth) {
	return Math.round((1 - depth) / 2 * RANK_SPAN)
}
