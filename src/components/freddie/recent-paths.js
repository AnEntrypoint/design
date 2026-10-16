import { attempt } from '../../best-effort.js';

const RECENT_KEY = 'fd_recent_cwds';
const RECENT_CAP = 5;

export function getRecentPaths() {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
}

export function saveRecentPath(path) {
    if (typeof localStorage === 'undefined' || !path) return;
    const list = getRecentPaths().filter(p => p !== path);
    list.unshift(path);
    attempt(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_CAP))); });
}
