export function norm(p) { return String(p || '').replace(/^\/+|\/+$/g, '') }
export function join(a, b) { a = norm(a); b = norm(b); return a ? (b ? a + '/' + b : a) : b }
export function parent(p) { p = norm(p); const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i) }
