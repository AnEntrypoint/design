import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

function highlightTitle(title, highlight) {
    const text = String(title);
    const needle = String(highlight).toLowerCase();
    if (!needle) return text;
    const lower = text.toLowerCase();
    const segs = [];
    let pos = 0, n = 0;
    while (pos <= text.length) {
        const hit = lower.indexOf(needle, pos);
        if (hit === -1) break;
        if (hit > pos) segs.push(h('span', { key: 'hs' + n++ }, text.slice(pos, hit)));
        segs.push(h('mark', { key: 'hs' + n++, class: 'ds-hl' }, text.slice(hit, hit + needle.length)));
        pos = hit + needle.length;
    }
    if (!segs.length) return text;
    if (pos < text.length) segs.push(h('span', { key: 'hs' + n++ }, text.slice(pos)));
    return segs;
}

export function Row({ code, rank, title, sub, meta, active, state = 'default', onClick, key, style, href, kind, cols, leading, trailing, target, selected, rail, expanded, highlight, actions, detail }) {
    const codeVal = code != null ? code : rank;
    const isActive = state === 'active' || (state === 'default' && (active || selected));
    const isLink = kind === 'link' || (href != null && !onClick);
    const isButton = !isLink && !!onClick;
    const stateCls = state === 'disabled' ? ' row-state-disabled' : (state === 'error' ? ' row-state-error' : '');
    const noLead = codeVal == null && leading == null;
    const cls = 'row' + (isActive ? ' active' : '') + stateCls + (cols ? ' row-grid' : '') + (noLead && !cols ? ' row-nocode' : '') + (rail ? ' rail-' + rail : '');
    const isDisabled = state === 'disabled';
    const props = { key, class: cls, style: cols ? `${style ? style + ';' : ''}grid-template-columns:${cols}` : style };
    if (isLink) {
        props.href = href || '#';
        if (target) props.target = target;
    } else if (isButton && !isDisabled) {
        props.onclick = onClick;
        props.role = 'button';
        props.tabindex = '0';
        props.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); }
        };
        if (expanded === true || expanded === false) props['aria-expanded'] = expanded ? 'true' : 'false';
    }
    if (isDisabled) props['aria-disabled'] = 'true';
    if (isActive && (isLink || isButton)) props['aria-current'] = isActive ? 'page' : null;
    const titleNode = (highlight && typeof title === 'string')
        ? h('span', {}, ...[].concat(highlightTitle(title, highlight)))
        : title;
    const actionRow = (expanded === true && Array.isArray(actions) && actions.length)
        ? h('span', { class: 'row-actions', role: 'group', 'aria-label': 'row actions' },
            ...actions.map((a, i) => h('button', {
                key: 'ract' + i,
                type: 'button',
                class: 'row-act',
                title: a.title || a.label,
                'aria-label': a.title || a.label,
                onclick: (e) => { e.stopPropagation(); a.onClick && a.onClick(e); },
                onkeydown: (e) => { e.stopPropagation(); },
            }, a.label)))
        : null;
    const railWord = rail === 'flame' ? 'error' : rail === 'purple' ? 'subagent' : null;
    const detailNode = (highlight && typeof detail === 'string')
        ? h('span', {}, ...[].concat(highlightTitle(detail, highlight)))
        : detail;
    return h(isLink ? 'a' : 'div', props,
        railWord ? h('span', { class: 'sr-only' }, railWord) : null,
        leading != null ? leading : (codeVal != null ? h('span', { class: 'code' }, codeVal) : null),
        h('span', { class: 'title', title: typeof title === 'string' ? title : undefined }, titleNode, sub ? h('span', { class: 'sub', title: typeof sub === 'string' ? sub : undefined }, sub) : null),
        trailing != null ? trailing : (meta != null ? h('span', { class: 'meta' }, meta) : null),
        actionRow,
        detail != null ? h('pre', { class: 'ds-row-detail' }, detailNode) : null);
}

export function RowLink({ code, title, sub, meta, href = '#', key, target }) {
    return Row({ code, title, sub, meta, href, kind: 'link', key, target });
}

/**
 * One FIELD of a record: its label, its value, and whatever the app needs to
 * say about that value.
 *
 * This is the third row shape, and it exists because the other two do not fit
 * it. `Row` is a LIST row -- title/sub/meta describing one item in a
 * collection. `Receipt` is a static key/value table with nowhere to put a
 * control. A record's field needs both halves: a value that may be
 * interactive (click to edit, a provenance chip beside it) and annotations
 * that hang beneath it. Without this, every app displaying a record's fields
 * hand-rolls the same label/value row and its own separator, and the
 * separators then drift apart between apps.
 *
 * The separator is the kit's (`panel-row.css`), not the caller's, which is the
 * whole point: one rule owns where a field row ends, and the last row in a
 * group correctly has none.
 *
 * @param {any} label The field's human name.
 * @param {any} value The value, or whatever the caller renders in its place.
 * @param {any} trailing Rendered after the value -- chips, a source marker.
 * @param {any} notes Annotations rendered beneath the value.
 * @param {string} field Machine name, emitted as data-field for targeting.
 * @param {string} key webjsx list key.
 */
/**
 * One entry in a LOG or timeline: a dense single line, with a coloured rail
 * marking what kind of thing happened.
 *
 * The kit's fourth row shape, and it is a different species from the other
 * three rather than a variant of them. `Row` is a grid-laid LIST row with a
 * background, a radius and hover chrome -- right for an item you click into,
 * wrong for a hundred consecutive audit lines. `DetailRow` is a record's
 * field. `Receipt` is a static key/value table. A timeline entry is none of
 * those: it is quiet, dense, unclickable by default, and its most important
 * signal is a colour at the leading edge telling you at a glance whether this
 * line is an inbound message, a reply, an automated observation or a warning.
 *
 * `EventList` already existed and does NOT cover this -- it composes `Row`,
 * so it renders events as clickable list rows. This is the log-line shape
 * that a case timeline, an audit trail or an activity feed actually wants.
 *
 * Slots map to the parts a log line always has: `leading` an icon, `label`
 * the fixed-width what/who column, `text` the body that takes the remaining
 * width, `trailing` any per-entry control, and `meta` the timestamp pinned at
 * the end.
 *
 * @param {'accent'|'ok'|'warn'|'muted'} tone Rail colour at the leading edge.
 * @param {any} leading Icon or marker before the label.
 * @param {any} label Fixed-width what/who column.
 * @param {any} text The entry body.
 * @param {any} trailing Per-entry control, rendered before the meta.
 * @param {any} meta Timestamp or similar, pinned at the end.
 * @param {string} kind Machine name for the entry type, emitted as data-kind.
 * @param {string} key webjsx list key.
 */
export function LogRow({ tone, leading, label, text, trailing, meta, kind, key }) {
    const TONES = new Set(['accent', 'ok', 'warn', 'muted']);
    const toneCls = ' ds-log-row--tone-' + (TONES.has(tone) ? tone : 'muted');
    return h('div', { key, class: 'ds-log-row' + toneCls, ...(kind ? { 'data-kind': String(kind) } : {}) },
        leading != null ? h('span', { class: 'ds-log-lead' }, leading) : null,
        label != null ? h('span', { class: 'ds-log-label' }, label) : null,
        h('span', { class: 'ds-log-text' }, text),
        trailing != null ? trailing : null,
        meta != null ? h('span', { class: 'ds-log-meta' }, meta) : null);
}

export function DetailRow({ label, value, trailing, notes, field, key }) {
    return h('div', { key, class: 'ds-detail-row', ...(field ? { 'data-field': field } : {}) },
        h('span', { class: 'ds-detail-label' }, label),
        h('span', { class: 'ds-detail-val' },
            value,
            trailing != null ? trailing : null,
            ...(notes == null ? [] : (Array.isArray(notes) ? notes : [notes]))));
}
