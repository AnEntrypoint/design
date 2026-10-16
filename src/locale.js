import { getLocale } from './i18n.js';
import { attempt } from './best-effort.js';

function hour12Preference(locale) {
    try { return Intl.DateTimeFormat(locale).resolvedOptions().hour12; }
    catch { return undefined; }
}

export function formatTime(date, locale = getLocale()) {
    const hour12 = hour12Preference(locale);
    try { return new Date(date).toLocaleTimeString(locale, hour12 === undefined ? undefined : { hour12 }); }
    catch { return new Date(date).toLocaleTimeString(); }
}

export function formatDateTime(date, locale = getLocale()) {
    const hour12 = hour12Preference(locale);
    try { return new Date(date).toLocaleString(locale, hour12 === undefined ? undefined : { hour12 }); }
    catch { return new Date(date).toLocaleString(); }
}

export function formatNumber(n, locale = getLocale()) {
    try { return n.toLocaleString(locale); } catch { return String(n); }
}

const RTF_DIVISIONS = [
    { amount: 60, unit: 'seconds' },
    { amount: 60, unit: 'minutes' },
    { amount: 24, unit: 'hours' },
    { amount: 7, unit: 'days' },
    { amount: 4.34524, unit: 'weeks' },
    { amount: 12, unit: 'months' },
    { amount: Infinity, unit: 'years' },
];

export function formatRelativeTime(date, locale = getLocale(), now = Date.now()) {
    let duration = (new Date(date).getTime() - now) / 1000;
    const relative = attempt(() => {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        for (const division of RTF_DIVISIONS) {
            if (Math.abs(duration) < division.amount) return rtf.format(Math.round(duration), division.unit);
            duration /= division.amount;
        }
    });
    if (relative !== undefined) return relative;
    return formatTime(date, locale);
}
