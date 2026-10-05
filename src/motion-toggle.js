import { attempt } from './best-effort.js';

const KEY = '247420:motion';
const VALID = new Set(['auto', 'reduced']);
const listeners = new Set();
let _current = 'auto';

function isBrowser() {
    return typeof document !== 'undefined' && typeof window !== 'undefined';
}

function readStored() {
    try {
        const v = window.localStorage.getItem(KEY);
        return VALID.has(v) ? v : null;
    } catch { return null; }
}

function writeStored(mode) {
    attempt(() => { window.localStorage.setItem(KEY, mode); });
}

function writeAttr(mode) {
    if (!isBrowser()) return;
    if (mode === 'reduced') document.documentElement.setAttribute('data-motion', 'reduced');
    else document.documentElement.removeAttribute('data-motion');
}

export function applyMotion(mode) {
    if (!VALID.has(mode)) mode = 'auto';
    _current = mode;
    writeAttr(mode);
    writeStored(mode);
    for (const cb of listeners) {
        attempt(() => { cb({ mode }); });
    }
    return mode;
}

export function getMotion() {
    return _current;
}

export function isMotionReduced() {
    if (_current === 'reduced') return true;
    if (_current !== 'auto') return false;
    if (!isBrowser() || !window.matchMedia) return false;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

export function onMotionChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function initMotion() {
    if (!isBrowser()) return 'auto';
    const stored = readStored();
    applyMotion(stored || 'auto');
    return _current;
}

if (isBrowser()) initMotion();
