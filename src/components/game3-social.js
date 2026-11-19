import * as webjsx from '../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function GameEventCard({ title, about = '', byName = '', at = 0, now = Date.now(), interested = 0, isInterested = false, canCancel = false, onRsvp, onCancel, key } = {}) {
    const live = at <= now;
    return h('article', { key, class: 'ds-g3-event' + (live ? ' is-live' : '') },
        live ? h('span', { key: 'live', class: 'ds-g3-event-live' }, 'Live now') : h('time', { key: 'when', class: 'ds-g3-event-when', datetime: new Date(at).toISOString() }, new Date(at).toLocaleString()),
        h('h3', { key: 't', class: 'ds-g3-event-title' }, title),
        about ? h('p', { key: 'a', class: 'ds-g3-event-about' }, about) : null,
        h('div', { key: 'f', class: 'ds-g3-event-foot' },
            h('span', { key: 'm', class: 'ds-g3-event-meta' }, 'by ' + byName + ' · ' + interested + ' interested'),
            h('span', { key: 'b', class: 'ds-g3-event-actions' },
                canCancel ? h('button', { key: 'c', type: 'button', class: 'ds-g3-btn ds-g3-btn--ghost', onclick: onCancel || null }, 'Cancel') : null,
                h('button', { key: 'r', type: 'button', class: 'ds-g3-btn' + (isInterested ? ' is-on' : ''), 'aria-pressed': isInterested ? 'true' : 'false', onclick: onRsvp || null }, isInterested ? 'Interested' : 'Mark interested')
            )
        )
    );
}

export function GameEventList({ events = [], now = Date.now(), viewerId = '', isOwner = false, onRsvp, onCancel, onCreate, key } = {}) {
    const sorted = [...events].sort((a, b) => a.at - b.at);
    return h('section', { key, class: 'ds-g3-event-list', 'aria-label': 'Events' },
        sorted.length
            ? sorted.map((e) => GameEventCard({
                key: e.id,
                title: e.title,
                about: e.about,
                byName: e.byName,
                at: e.at,
                now,
                interested: (e.going || []).length,
                isInterested: (e.going || []).includes(viewerId),
                canCancel: e.by === viewerId || isOwner,
                onRsvp: () => onRsvp && onRsvp(e.id),
                onCancel: () => onCancel && onCancel(e.id)
            }))
            : h('p', { key: 'empty', class: 'ds-g3-event-empty' }, 'No events yet. Make the first one below.'),
        onCreate ? GameEventComposer({ key: 'composer', onCreate }) : null
    );
}

export function GameEventComposer({ onCreate, defaultAt = '', key } = {}) {
    let title = '';
    let about = '';
    let at = defaultAt;
    const submit = () => {
        const w = Date.parse(at);
        if (title.trim() && w) onCreate({ title: title.trim(), about, at: w });
    };
    return h('form', { key, class: 'ds-g3-event-composer', onsubmit: (e) => { e.preventDefault(); submit(); } },
        h('label', { key: 'l1', class: 'ds-field-label' }, 'Create event',
            h('input', { key: 'i1', type: 'text', maxlength: '60', placeholder: "What's happening? (movie night, tournament…)", class: 'ds-g3-input', oninput: (e) => { title = e.target.value; } })
        ),
        h('input', { key: 'i2', type: 'text', maxlength: '120', placeholder: 'Details (optional)', class: 'ds-g3-input', 'aria-label': 'Details', oninput: (e) => { about = e.target.value; } }),
        h('input', { key: 'i3', type: 'datetime-local', class: 'ds-g3-input', value: defaultAt, 'aria-label': 'When', oninput: (e) => { at = e.target.value; } }),
        h('button', { key: 'b', type: 'submit', class: 'ds-g3-btn' }, 'Schedule')
    );
}

export function StickerPicker({ stickers = [], server = '', onPick, key } = {}) {
    return h('div', { key, class: 'ds-g3-stickers', role: 'listbox', 'aria-label': 'Stickers' },
        h('div', { key: 'h', class: 'ds-g3-stickers-head' }, 'Stickers · ' + server),
        h('div', { key: 'g', class: 'ds-g3-stickers-grid' },
            stickers.map((s) => h('button', { key: s.id, type: 'button', role: 'option', class: 'ds-g3-sticker', title: s.name, 'aria-label': s.name, onclick: onPick ? () => onPick(s.id) : null },
                h('img', { src: s.url, alt: s.name, loading: 'lazy' })
            ))
        )
    );
}

export function SoundBoard({ sounds = [], onPlay, disabled = false, key } = {}) {
    return h('div', { key, class: 'ds-g3-soundboard', role: 'group', 'aria-label': 'Soundboard' },
        sounds.map((s) => h('button', { key: s.id, type: 'button', class: 'ds-g3-sound', disabled: disabled ? true : null, onclick: onPlay ? () => onPlay(s.id) : null },
            h('span', { key: 'e', class: 'ds-g3-sound-glyph', 'aria-hidden': 'true' }, s.e),
            h('span', { key: 'n' }, s.name)
        ))
    );
}

export function RadioPill({ playing = false, channel = '', onToggle, key } = {}) {
    return h('div', { key, class: 'ds-g3-radio' + (playing ? ' is-playing' : '') },
        h('span', { key: 't', class: 'ds-g3-radio-text' }, playing ? 'Lofi radio is playing in ' + channel : 'Lofi radio is off'),
        playing ? h('span', { key: 'eq', class: 'ds-g3-radio-eq', 'aria-hidden': 'true' }, h('i', null), h('i', null), h('i', null), h('i', null)) : null,
        onToggle ? h('button', { key: 'b', type: 'button', class: 'ds-g3-btn', 'aria-pressed': playing ? 'true' : 'false', onclick: onToggle }, playing ? 'Stop' : 'Play') : null
    );
}

export function KeywordAlerts({ words = [], max = 12, onChange, key } = {}) {
    const set = (next) => onChange && onChange(next.slice(0, max));
    return h('div', { key, class: 'ds-g3-keywords' },
        h('span', { key: 'l', class: 'ds-field-label' }, 'Keyword alerts'),
        h('ul', { key: 'c', class: 'ds-g3-keywords-chips', 'aria-label': 'Keywords' },
            words.map((w) => h('li', { key: w, class: 'ds-g3-keyword' },
                h('span', null, w),
                onChange ? h('button', { type: 'button', class: 'ds-g3-keyword-remove', 'aria-label': 'Remove ' + w, onclick: () => set(words.filter((x) => x !== w)) }, '×') : null
            ))
        ),
        onChange && words.length < max ? h('input', {
            key: 'i',
            type: 'text',
            class: 'ds-g3-input',
            placeholder: 'Add a word, press Enter',
            maxlength: '32',
            'aria-label': 'Add keyword',
            onkeydown: (e) => {
                if (e.key !== 'Enter') return;
                const v = e.target.value.trim().toLowerCase();
                if (v && !words.includes(v)) set([...words, v]);
                e.target.value = '';
                e.preventDefault();
            }
        }) : null,
        h('span', { key: 'h', class: 'ds-field-hint' }, words.length + ' of ' + max + ' whole words')
    );
}

export function EventsList({ events = [], now = Date.now(), emptyText = '', key } = {}) {
    if (!events.length) return h('p', { key, class: 'ds-g3-empty' }, emptyText);
    return h('ul', { key, class: 'ds-g3-events' }, ...events.map((e) => h('li', { key: e.id, class: 'ds-g3-event' },
        h('span', { key: 't', class: 'ds-g3-event-title' }, e.title),
        h('span', { key: 'w', class: 'ds-g3-event-when' }, new Date(e.start).toLocaleString()),
        e.location ? h('span', { key: 'l', class: 'ds-g3-event-where' }, e.location) : null,
        (e.start <= now && (!e.end || e.end > now)) ? h('span', { key: 'live', class: 'ds-g3-event-live' }, 'LIVE') : null
    )));
}

export function ServerDiscover({ servers = [], joinedIds = [], onJoin, emptyText = '', key } = {}) {
    return h('section', { key, class: 'ds-g3-discover', 'aria-label': 'Discover servers' },
        servers.length
            ? h('ul', { key: 'l', class: 'ds-g3-discover-list' }, servers.map((s) => {
                const joined = joinedIds.includes(s.id);
                return h('li', { key: s.id, class: 'ds-g3-discover-row' },
                    h('span', { key: 'i', class: 'ds-g3-discover-tile', style: '--ds-tile:' + (s.color || '#5865f2'), 'aria-hidden': 'true' }, s.initials),
                    h('span', { key: 'n', class: 'ds-g3-discover-name' }, s.name),
                    h('span', { key: 'm', class: 'ds-g3-discover-meta' }, s.members + ' members'),
                    h('button', { key: 'b', type: 'button', class: 'ds-g3-btn' + (joined ? ' is-on' : ''), disabled: joined ? true : null, onclick: joined || !onJoin ? null : () => onJoin(s.id) }, joined ? 'Joined' : 'Join')
                );
            }))
            : h('p', { key: 'e', class: 'ds-g3-discover-empty' }, emptyText || 'No servers yet.')
    );
}
