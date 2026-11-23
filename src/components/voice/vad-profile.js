import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

const pct = (n) => (Number(n) || 0).toFixed(1) + '%';

export function VadProfileControl({ value = 'balanced', profiles = [], variant = 'g3', onChange } = {}) {
    if (!profiles.length) return null;
    const ids = profiles.map((p) => p.id);
    const current = ids.includes(value) ? value : ids[0];
    const pick = (id, from) => {
        if (onChange && id !== current) onChange(id);
        if (from) setTimeout(() => { const el = from.parentNode && from.parentNode.querySelector('[data-vad-profile="' + id + '"]'); if (el) el.focus(); }, 0);
    };
    const onKey = (e) => {
        const at = ids.indexOf(e.currentTarget.getAttribute('data-vad-profile'));
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (step) { e.preventDefault(); pick(ids[(at + step + ids.length) % ids.length], e.currentTarget); }
        else if (e.key === 'Home') { e.preventDefault(); pick(ids[0], e.currentTarget); }
        else if (e.key === 'End') { e.preventDefault(); pick(ids[ids.length - 1], e.currentTarget); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e.currentTarget.getAttribute('data-vad-profile')); }
    };
    const vx = variant === 'vx';
    const helpId = 'vad-profile-help-' + variant;
    return h('div', { class: 'ds-vadprof ds-vadprof-' + variant },
        h('div', { class: (vx ? 'vx-segmented ' : '') + 'ds-vadprof-group', role: 'radiogroup', 'aria-label': 'voice clip filter sensitivity', 'aria-describedby': helpId },
            ...profiles.map((p) => h('button', {
                key: 'p-' + p.id, type: 'button', role: 'radio', 'data-vad-profile': p.id,
                'aria-checked': p.id === current ? 'true' : 'false', tabindex: p.id === current ? '0' : '-1',
                class: (vx ? 'vx-seg' + (p.id === current ? ' vx-seg-on' : '') : 'ds-vadprof-opt' + (p.id === current ? ' on' : '')) + ' ds-vadprof-btn',
                onclick: () => pick(p.id), onkeydown: onKey
            }, p.label))),
        h('ul', { id: helpId, class: 'ds-vadprof-help' },
            ...profiles.map((p) => h('li', { key: 'h-' + p.id, class: p.id === current ? 'on' : '' },
                h('b', null, p.label), ': speech kept ' + pct(p.speechKeptPct) + ', hot mic kept ' + pct(p.hotMicKeptPct)))),
        h('div', { class: 'ds-vadprof-note' }, 'Measured on labelled clips: speech kept is the share of real speech clips passed, hot mic kept is the share of fans, breathing, keys and similar that leak through. Takes effect the next time you join a voice thread.'));
}
