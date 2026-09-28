const LAYER_RANK_SPAN = 98

const isFinitePoint = (point) => !!point && typeof point === 'object' && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z)
const isThreeVector = (point) => typeof point.clone === 'function'
const isBehindCameraOrBeyondFarPlane = (ndc) => ndc.z > 1 || ndc.z < -1
const isOutsideViewport = (ndc) => Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1

export function normalizePosition(worldPos) {
	return isFinitePoint(worldPos) ? { x: worldPos.x, y: worldPos.y, z: worldPos.z } : null
}

function projectToNdc(camera, worldPos, position) {
	if (typeof camera.project === 'function') return camera.project(position)
	const vectorClass = isThreeVector(worldPos) ? worldPos.constructor : camera.position && camera.position.constructor
	if (typeof vectorClass !== 'function') return null
	const vector = isThreeVector(worldPos) ? worldPos.clone() : new vectorClass(position.x, position.y, position.z)
	return typeof vector.project === 'function' ? vector.project(camera) : null
}

export function projectToScreen(camera, worldPos, width, height) {
	const position = normalizePosition(worldPos)
	if (!position || !camera) return null
	const ndc = projectToNdc(camera, worldPos, position)
	if (!ndc || !Number.isFinite(ndc.x) || !Number.isFinite(ndc.y) || !Number.isFinite(ndc.z)) return null
	if (isBehindCameraOrBeyondFarPlane(ndc) || isOutsideViewport(ndc)) return null
	return { x: (ndc.x + 1) / 2 * width, y: (1 - ndc.y) / 2 * height, depth: ndc.z }
}

export function layerRank(depth) {
	return Math.round((1 - depth) / 2 * LAYER_RANK_SPAN)
}
