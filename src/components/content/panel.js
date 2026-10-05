import * as webjsx from '../../../vendor/webjsx/index.js';
import { RowLink } from './row.js';
const h = webjsx.createElement;

export function Panel({ title, count, right, style = '', class: className = '', children, kind, id, headingLevel = 2, bodyAttrs = {} }) {
    const cls = 'panel' + (kind ? ' panel-' + kind : '') + (className ? ' ' + className : '');
    const headingTag = 'h' + headingLevel;
    return h('div', { class: cls, style: style || null, ...(id ? { id } : {}) },
        title != null ? h('div', { class: 'panel-head' },
            h(headingTag, { class: 'panel-title' }, title),
            right != null ? right : (count != null ? h('span', { class: 'ds-badge' }, String(count)) : null)
        ) : null,
        h('div', { class: 'panel-body', ...bodyAttrs }, ...(Array.isArray(children) ? children : [children]))
    );
}

export const Card = Panel;

export function PanelFromItems({ heading, items = [], keyPrefix = 'i', count, style, kind, emptyText } = {}) {
    if (!items || !items.length) return emptyText != null ? h('div', { class: 'empty' }, emptyText) : null;
    const rows = items.map((it, i) => {
        const codeVal = it.code != null ? it.code : (it.rank != null ? it.rank : String(i + 1).padStart(2, '0'));
        return RowLink({
            key: keyPrefix + i,
            code: codeVal,
            title: it.title != null ? it.title : it.name,
            sub: it.sub != null ? it.sub : (it.desc != null ? it.desc : ''),
            meta: it.meta != null ? it.meta : '',
            href: it.href || '#'
        });
    });
    return Panel({ title: heading, count, style, kind, children: rows });
}

export function Section({ title, eyebrow, children, id, headingLevel = 2 }) {
    const headingTag = 'h' + headingLevel;
    return h('section', { class: 'ds-section', ...(id ? { id } : {}) },
        eyebrow ? h('span', { class: 'eyebrow' }, eyebrow) : null,
        title ? h(headingTag, {}, title) : null,
        ...(Array.isArray(children) ? children : [children])
    );
}

export function Receipt({ rows = [], emptyText = 'nothing here yet' }) {
    if (!rows.length) return h('div', { class: 'empty' }, emptyText);
    return h('table', { class: 'kv' },
        h('tbody', {}, ...rows.map(([k, v], i) =>
            h('tr', { key: i }, h('td', {}, k), h('td', {}, v))
        ))
    );
}

export function Changelog({ entries = [], emptyText = 'no changelog entries yet' }) {
    if (!entries.length) return h('div', { class: 'empty' }, emptyText);
    return Panel({
        kind: 'wide',
        children: entries.map((e, i) =>
            h('div', { key: i, class: 'row ds-changelog-row' },
                h('span', { class: 'code' }, e.date),
                h('span', { class: 'ds-changelog-ver' }, e.ver),
                h('span', { class: 'title' }, e.msg)
            )
        )
    });
}
