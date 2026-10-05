import { attempt } from './best-effort.js';

const KEY = '247420:theme';
const ACCENT_KEY = '247420:accent';
const DENSITY_KEY = '247420:density';
const LOCALE_KEY = '247420:locale';
const VALID = new Set(['auto', 'paper', 'ink', 'dark', 'thebird', 'github-dark']);
const VALID_ACCENT = new Set(['green', 'purple', 'mascot', 'acid']);
const VALID_DENSITY = new Set(['compact', 'comfortable', 'spacious']);
const listeners = new Set();
let _mq = null;
let _current = 'auto';
const _warned = { theme: new Set(), accent: new Set(), density: new Set() };
function warnOnce(kind, attr, value, fallbackNote) {
    if (typeof console === 'undefined' || _warned[kind].has(value)) return;
    _warned[kind].add(value);
    console.warn(`[247420] unrecognised ${attr}="${value}": ${fallbackNote}`);
}

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
    document.documentElement.setAttribute('data-theme', mode);
}

function ensureMq() {
    if (_mq || !isBrowser() || !window.matchMedia) return;
    _mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
        if (_current === 'auto') {
            for (const cb of listeners) {
                attempt(() => { cb({ mode: 'auto', resolved: _mq.matches ? 'ink' : 'paper' }); });
            }
        }
    };
    if (_mq.addEventListener) _mq.addEventListener('change', onChange);
    else if (_mq.addListener) _mq.addListener(onChange);
}

export function applyTheme(mode) {
    if (!VALID.has(mode)) {
        warnOnce('theme', 'data-theme', mode, 'falling back to "auto". Valid values: ' + [...VALID].join(', '));
        mode = 'auto';
    }
    _current = mode;
    writeAttr(mode);
    writeStored(mode);
    ensureMq();
    const resolved = mode === 'auto'
        ? (_mq && _mq.matches ? 'ink' : 'paper')
        : mode;
    for (const cb of listeners) {
        attempt(() => { cb({ mode, resolved }); });
    }
    return mode;
}

export function getTheme() {
    return _current;
}

export function resolvedTheme() {
    if (_current !== 'auto') return _current;
    ensureMq();
    return _mq && _mq.matches ? 'ink' : 'paper';
}

export function onThemeChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

function readStoredKey(key, valid) {
    try { const v = window.localStorage.getItem(key); return valid.has(v) ? v : null; } catch { return null; }
}

export function applyAccent(accent) {
    if (!isBrowser()) return accent;
    if (VALID_ACCENT.has(accent)) {
        document.documentElement.setAttribute('data-accent', accent);
        attempt(() => { window.localStorage.setItem(ACCENT_KEY, accent); });
    } else {
        if (accent) warnOnce('accent', 'data-accent', accent, 'clearing to the theme default. Valid values: ' + [...VALID_ACCENT].join(', '));
        document.documentElement.removeAttribute('data-accent');
        attempt(() => { window.localStorage.removeItem(ACCENT_KEY); });
    }
    return accent;
}

export function getAccent() {
    if (!isBrowser()) return null;
    return document.documentElement.getAttribute('data-accent');
}

export function applyDensity(density) {
    if (!isBrowser()) return density;
    if (VALID_DENSITY.has(density)) {
        document.documentElement.setAttribute('data-density', density);
        attempt(() => { window.localStorage.setItem(DENSITY_KEY, density); });
    } else if (density) {
        warnOnce('density', 'data-density', density, 'no attribute set, comfortable default applies. Valid values: ' + [...VALID_DENSITY].join(', '));
    }
    return density;
}

export function getDensity() {
    if (!isBrowser()) return null;
    return document.documentElement.getAttribute('data-density');
}

export function applyDirection(locale) {
    if (!isBrowser()) return 'ltr';
    let dir = 'ltr';
    attempt(() => { const info = new Intl.Locale(locale).textInfo; if (info && (info.direction === 'rtl' || info.direction === 'ltr')) dir = info.direction; });
    document.documentElement.setAttribute('dir', dir);
    attempt(() => { window.localStorage.setItem(LOCALE_KEY, locale); });
    return dir;
}

export function getDirection() {
    if (!isBrowser()) return 'ltr';
    return document.documentElement.getAttribute('dir') || 'ltr';
}

export function initDirection() {
    if (!isBrowser()) return 'ltr';
    let stored = null;
    attempt(() => { stored = window.localStorage.getItem(LOCALE_KEY); });
    if (stored) return applyDirection(stored);
    return getDirection();
}

export function initTheme() {
    if (!isBrowser()) return 'auto';
    const stored = readStored();
    const fromAttr = document.documentElement.getAttribute('data-theme');
    const initial = stored || (VALID.has(fromAttr) ? fromAttr : 'auto');
    applyTheme(initial);
    const accent = readStoredKey(ACCENT_KEY, VALID_ACCENT);
    if (accent) applyAccent(accent);
    const density = readStoredKey(DENSITY_KEY, VALID_DENSITY);
    if (density) applyDensity(density);
    return initial;
}

if (isBrowser()) {
    Promise.resolve().then(() => {
        attempt(() => { initTheme(); });
        attempt(() => { initDirection(); });
    });
}
