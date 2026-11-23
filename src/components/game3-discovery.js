import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
const h = webjsx.createElement;

const stopKeys = (e) => e.stopPropagation();
const when = (at) => (at ? new Date(at * 1000).toLocaleString() : '');
const ACTION = { promote: 'promoted to Discover', remove: 'removed from Discover', save: 'saved listing details' };

const button = (key, label, onClick, cls, disabled) => h('div', {
    key, class: 'ds-g3-evb' + (cls ? ' ' + cls : '') + (disabled ? ' ds-g3-dsc-off' : ''), role: 'button', tabindex: disabled ? '-1' : '0', 'aria-disabled': disabled ? 'true' : 'false',
    onclick: () => { if (!disabled) onClick(); },
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } },
}, label);

const field = (key, label, control, hint) => h('div', { key, class: 'ds-g3-fld' }, h('h6', null, label), control, ...(hint ? [h('p', { class: 'ds-g3-hint' }, hint)] : []));

const checklist = (reqs) => h('ul', { key: 'reqs', class: 'ds-g3-dsc-reqs', 'aria-label': 'requirements' }, ...reqs.map((r) => h('li', { key: r.id, class: r.ok ? 'ok' : 'miss' },
    h('span', { class: 'ds-g3-dsc-mark', 'aria-hidden': 'true' }, Icon(r.ok ? 'check' : 'x', { size: 14 })),
    h('span', null, r.label),
    h('span', { class: 'ds-g3-dsc-sr' }, r.ok ? ' (done)' : ' (missing)'))));

export function Game3DiscoveryPane({ discovery: d, acts }) {
    if (!d) return [h('h2', { key: 'h' }, 'Discovery'), h('p', { key: 'n', class: 'ds-g3-hint' }, 'Open a server to see its discovery settings.')];
    const live = d.status === 'discoverable';
    const status = h('div', { key: 'st', class: 'ds-g3-dsc-status ' + (live ? 'on' : 'off'), role: 'status' },
        h('b', null, live ? 'Discoverable' : 'Undiscoverable'),
        h('span', null, live ? 'This server is listed in Discover Servers.' : 'This server is not listed. It can only be joined by invite.'));
    if (!d.canManage) {
        return [
            h('h2', { key: 'h' }, 'Discovery'),
            status,
            h('p', { key: 'who', class: 'ds-g3-hint' }, 'Only the owner (' + d.owner + ') and admins' + (d.admins.length ? ' (' + d.admins.join(', ') + ')' : '') + ' can promote this server to Discover or remove it.'),
        ];
    }
    const edit = (patch) => acts.discoveryEdit(patch);
    const text = (k, label, max, placeholder, hint) => field(k, label, h('input', { class: 'ds-g3-fi', maxlength: String(max), placeholder, value: Array.isArray(d.fields[k]) ? d.fields[k].join(', ') : (d.fields[k] || ''), 'aria-label': label, onkeydown: (e) => { stopKeys(e); if (e.key === 'Enter') e.target.blur(); }, onchange: (e) => edit({ [k]: e.target.value }) }), hint);
    const pick = (k, label, options) => field(k, label, h('select', { class: 'ds-g3-langsel', 'aria-label': label, onchange: (e) => edit({ [k]: e.target.value }) },
        h('option', { key: '', value: '', selected: !d.fields[k] }, 'not set'),
        ...options.map(([value, text2]) => h('option', { key: value, value, selected: d.fields[k] === value }, text2))));
    return [
        h('h2', { key: 'h' }, 'Discovery'),
        status,
        h('h6', { key: 'rh' }, 'Requirements'),
        checklist(d.requirements),
        h('h6', { key: 'lh' }, 'Listing'),
        h('div', { key: 'nm', class: 'ds-g3-fld' }, h('h6', null, 'Name'), h('p', { class: 'ds-g3-dsc-name' }, d.name || 'unnamed')),
        field('description', 'Description', h('textarea', { class: 'ds-g3-fi', rows: '3', maxlength: '500', placeholder: 'what is this server about?', value: d.fields.description || '', 'aria-label': 'Description', onkeydown: stopKeys, onchange: (e) => edit({ description: e.target.value }) })),
        text('icon', 'Icon', 500, 'https:// image address'),
        pick('category', 'Category', d.categories.map((c) => [c, c.charAt(0).toUpperCase() + c.slice(1)])),
        text('tags', 'Tags', 200, 'chess, friendly, weekly-events', 'up to 8, separated by commas or spaces'),
        pick('language', 'Language', d.languages),
        h('div', { key: 'gl', class: 'ds-g3-tgl' + (d.fields.guidelines ? ' on' : ''), role: 'switch', tabindex: '0', 'aria-checked': d.fields.guidelines ? 'true' : 'false', 'aria-label': 'Community guidelines acknowledged', onclick: () => edit({ guidelines: !d.fields.guidelines }), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } } },
            h('div', null, h('div', { class: 'ds-g3-tgl-label' }, 'Community guidelines acknowledged'), h('div', { class: 'ds-g3-hint' }, 'this server follows respectful, safe community rules and has people who enforce them')),
            h('div', { class: 'ds-g3-sw2', 'aria-hidden': 'true' })),
        h('div', { key: 'act', class: 'ds-g3-btnrow ds-g3-dsc-act' },
            button('save', 'Save details', () => acts.discoverySave(), 'ds-g3-dsc-save', d.busy || !d.dirty),
            ...(live ? [button('remove', 'Remove from Discover', () => acts.discoveryRemove(), '', d.busy)] : [button('promote', 'Promote to discoverable', () => acts.discoveryPromote(), 'ds-g3-evb-on', d.busy)])),
        ...(!live && !d.ready ? [h('p', { key: 'blocked', class: 'ds-g3-note ds-g3-note-err', role: 'status' }, 'Promotion will be refused until every requirement above is done.')] : []),
        h('h6', { key: 'ah' }, 'Audit log'),
        ...(d.log.length ? d.log.map((l, i) => h('div', { key: 'l' + i, class: 'ds-g3-dsc-log' }, h('b', null, l.by), ' ' + (ACTION[l.action] || l.action), h('span', { class: 'ds-g3-hint' }, ' · ' + when(l.at)))) : [h('p', { key: 'ln', class: 'ds-g3-hint' }, 'nothing recorded yet')]),
        ...(d.ignored.length ? [h('h6', { key: 'ih' }, 'Ignored listings'), ...d.ignored.map((l, i) => h('div', { key: 'i' + i, class: 'ds-g3-dsc-log ds-g3-dsc-bad' }, h('b', null, l.by), ' signed a ' + l.status + ' listing but is not a current admin, so it is invalid', h('span', { class: 'ds-g3-hint' }, ' · ' + when(l.at))))] : []),
    ];
}

export function DiscoverListings({ listings = [], query = '', onQuery, onJoin, onOpen }) {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    const hit = (l) => !q || [l.name, l.description, l.category, l.language, ...l.tags].some((x) => String(x || '').toLowerCase().includes(q));
    const shown = listings.filter(hit);
    const tags = [...new Set(listings.flatMap((l) => l.tags))].sort().slice(0, 24);
    return h('div', { class: 'ds-g3-dsc-find' },
        h('input', { class: 'ds-g3-fi', type: 'search', placeholder: 'search names, descriptions and tags', value: query, 'aria-label': 'search servers', onkeydown: stopKeys, oninput: (e) => onQuery && onQuery(e.target.value) }),
        ...(tags.length ? [h('div', { class: 'ds-g3-dsc-tags' }, ...tags.map((t) => h('span', { key: t, class: 'ds-g3-dsc-tag' + (q === t ? ' on' : ''), role: 'button', tabindex: '0', onclick: () => onQuery && onQuery(q === t ? '' : t), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } } }, '#' + t)))] : []),
        shown.length
            ? h('ul', { class: 'ds-g3-discover' }, ...shown.map((l) => h('li', { key: l.id, class: 'ds-g3-discover-row' },
                h('span', { key: 'i', class: 'ds-g3-discover-ico ds-g3-dsc-ico', 'aria-hidden': 'true' }, (l.name || '?').slice(0, 1).toUpperCase(), ...(l.icon ? [h('img', { class: 'ds-g3-dsc-img', src: l.icon, alt: '', referrerpolicy: 'no-referrer', onerror: (e) => { e.target.hidden = true; } })] : [])),
                h('div', { key: 't', class: 'ds-g3-discover-txt' },
                    h('h3', null, l.name),
                    h('p', null, l.description),
                    h('p', { class: 'ds-g3-dsc-meta' }, [l.category, l.language, 'listed by ' + l.by].filter(Boolean).join(' · ')),
                    ...(l.tags.length ? [h('p', { class: 'ds-g3-dsc-meta' }, l.tags.map((t) => '#' + t).join(' '))] : [])),
                h('button', { key: 'b', type: 'button', class: 'ds-g3-btn', onclick: () => (l.joined ? onOpen && onOpen(l.id) : onJoin && onJoin(l)) }, l.joined ? 'Open' : 'Join'))))
            : h('p', { class: 'ds-g3-empty' }, listings.length ? 'No server matches that search.' : 'No servers are listed yet.'));
}
