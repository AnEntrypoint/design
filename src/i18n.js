import { attempt } from './best-effort.js';
const STORAGE_KEY = 'ds-locale';
const FALLBACK_LOCALE = 'en';

const catalogs = new Map();

export function registerLocale(locale, table) {
  catalogs.set(locale, { ...(catalogs.get(locale) || {}), ...table });
}

registerLocale('en', {});

export function getLocale() {
  const stored = attempt(() => typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY), null);
  if (stored && catalogs.has(stored)) return stored;
  if (typeof navigator !== 'undefined' && navigator.language) {
    const short = navigator.language.slice(0, 2);
    if (catalogs.has(short)) return short;
  }
  return FALLBACK_LOCALE;
}

export function setLocale(locale) {
  attempt(() => { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, locale); });
}

export function t(key, fallbackText, vars) {
  const locale = getLocale();
  const table = catalogs.get(locale) || {};
  let str = (key in table) ? table[key] : fallbackText;
  if (vars) for (const k of Object.keys(vars)) str = str.split('{' + k + '}').join(String(vars[k]));
  return str;
}

export function availableLocales() {
  return [...catalogs.keys()];
}
