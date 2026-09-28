const LAYER_RANK_SPAN = 98

const isFinitePoint = (point) => !!point && typeof point === 'object' && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z)
const isProjectableVector = (point) => typeof point.clone === 'function' && typeof point.project === 'function'
const isBehindCameraOrBeyondFarPlane = (ndc) => ndc.z > 1 || ndc.z < -1
const isOutsideViewport = (ndc) => Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1

export function normalizePosition(worldPos) {
	return isFinitePoint(worldPos) ? { x: worldPos.x, y: worldPos.y, z: worldPos.z } : null
}

function projectToNdc(camera, worldPos, position) {
	if (typeof camera.project === 'function') return camera.project(position)
	if (typeof camera.updateMatrixWorld === 'function') camera.updateMatrixWorld()
	const vectorClass = isProjectableVector(worldPos) ? worldPos.constructor : camera.position && camera.position.constructor
	if (typeof vectorClass !== 'function') return null
	const vector = isProjectableVector(worldPos) ? worldPos.clone() : new vectorClass(position.x, position.y, position.z)
	return typeof vector.project === 'function' ? vector.project(camera) : null
}

function distanceToCamera(camera, position) {
	return isFinitePoint(camera.position) ? Math.hypot(position.x - camera.position.x, position.y - camera.position.y, position.z - camera.position.z) : null
}

export function projectToScreen(camera, worldPos, width, height) {
	const position = normalizePosition(worldPos)
	if (!position || !camera) return null
	const ndc = projectToNdc(camera, worldPos, position)
	if (!ndc || !Number.isFinite(ndc.x) || !Number.isFinite(ndc.y) || !Number.isFinite(ndc.z)) return null
	if (isBehindCameraOrBeyondFarPlane(ndc) || isOutsideViewport(ndc)) return null
	return {
		x: (ndc.x + 1) / 2 * width,
		y: (1 - ndc.y) / 2 * height,
		depth: ndc.z,
		distance: distanceToCamera(camera, position),
		far: Number.isFinite(camera.far) && camera.far > 0 ? camera.far : null,
		position
	}
}

export function layerRank(screen) {
	const hasLinearDistance = screen.distance !== null && screen.far !== null
	const nearness = hasLinearDistance ? 1 - Math.min(screen.distance / screen.far, 1) : (1 - screen.depth) / 2
	return Math.round(nearness * LAYER_RANK_SPAN)
}
