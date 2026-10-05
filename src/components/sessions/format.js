
import { formatDateTime } from '../../locale.js';

export function fmtTime(t) {
  try { return formatDateTime(t); } catch { return String(t || ''); }
}
export function fmtAgo(t) {
  if (!t) return '';
  const s = Math.floor((Date.now() - new Date(t).getTime()) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

export function fmtDuration(ms) {
  if (ms == null || !isFinite(ms) || ms < 0) return '';
  const s = Math.round(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ' + (s % 60) + 's';
  const hrs = Math.floor(m / 60);
  return hrs + 'h ' + (m % 60) + 'm';
}

export const STATUS_WORD = { error: 'error', stale: 'idle', running: 'running', stopping: 'stopping' };
export const STATUS_DISC = { error: 'status-dot-error', stale: 'status-dot-stale', running: 'status-dot-live', stopping: 'status-dot-connecting' };
