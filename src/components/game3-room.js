import * as webjsx from '../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function VoiceRoom({ name = '', participants = [], selfId = '', muted = false, deafened = false, onToggleMute, onToggleDeafen, onLeave, key } = {}) {
    return h('section', { key, class: 'ds-g3-voice', 'aria-label': 'Voice room ' + name },
        h('header', { key: 'h', class: 'ds-g3-voice-head' },
            h('span', { key: 'n', class: 'ds-g3-voice-name' }, name),
            h('span', { key: 'c', class: 'ds-g3-voice-count' }, participants.length + ' connected')
        ),
        h('ul', { key: 'p', class: 'ds-g3-voice-list' },
            participants.map((p) => h('li', { key: p.id, class: 'ds-g3-voice-person' + (p.speaking ? ' is-speaking' : '') + (p.id === selfId ? ' is-self' : '') },
                h('span', { key: 'a', class: 'ds-g3-voice-dot', 'aria-hidden': 'true' }),
                h('span', { key: 'n' }, p.name),
                p.muted ? h('span', { key: 'm', class: 'ds-g3-voice-flag' }, 'muted') : null
            ))
        ),
        (onToggleMute || onToggleDeafen || onLeave) ? h('div', { key: 'k', class: 'ds-g3-voice-controls' },
            h('button', { key: 'mu', type: 'button', class: 'ds-g3-btn' + (muted ? ' is-on' : ''), 'aria-pressed': muted ? 'true' : 'false', onclick: onToggleMute || null }, muted ? 'Unmute' : 'Mute'),
            h('button', { key: 'de', type: 'button', class: 'ds-g3-btn' + (deafened ? ' is-on' : ''), 'aria-pressed': deafened ? 'true' : 'false', onclick: onToggleDeafen || null }, deafened ? 'Undeafen' : 'Deafen'),
            h('button', { key: 'lv', type: 'button', class: 'ds-g3-btn ds-g3-btn--danger', onclick: onLeave || null }, 'Leave')
        ) : null
    );
}

export function ToggleRow({ label, hint = '', checked = false, onChange, key } = {}) {
    return h('div', { key, class: 'ds-g3-toggle' },
        h('div', { key: 't', class: 'ds-g3-toggle-text' },
            h('span', { key: 'l', class: 'ds-g3-toggle-label' }, label),
            hint ? h('span', { key: 'h', class: 'ds-g3-toggle-hint' }, hint) : null
        ),
        h('button', { key: 's', type: 'button', role: 'switch', class: 'ds-g3-switch' + (checked ? ' is-on' : ''), 'aria-checked': checked ? 'true' : 'false', 'aria-label': label, onclick: onChange ? () => onChange(!checked) : null })
    );
}

export function GameSettingsSection({ title, children = [], key } = {}) {
    return h('section', { key, class: 'ds-g3-settings' },
        h('h2', { key: 'h', class: 'ds-g3-settings-title' }, title),
        children
    );
}

export function ServerCreateForm({ colors = [], initialColor = '', onCreate, onCancel, key } = {}) {
    let name = '';
    let color = initialColor || colors[0] || '';
    const submit = (e) => {
        e.preventDefault();
        if (name.trim() && onCreate) onCreate({ name: name.trim(), color });
    };
    return h('form', { key, class: 'ds-g3-server-form', onsubmit: submit },
        h('label', { key: 'n', class: 'ds-g3-field' }, 'Server name',
            h('input', { key: 'i', type: 'text', maxlength: '24', class: 'ds-g3-input', placeholder: 'My server', oninput: (e) => { name = e.target.value; } })
        ),
        h('fieldset', { key: 'c', class: 'ds-g3-swatches' },
            h('legend', null, 'Colour'),
            colors.map((c) => h('button', { key: c, type: 'button', class: 'ds-g3-swatch' + (c === color ? ' is-on' : ''), 'aria-pressed': c === color ? 'true' : 'false', 'aria-label': c, style: '--ds-swatch:' + c, onclick: (e) => { color = c; e.currentTarget.parentNode.querySelectorAll('.ds-g3-swatch').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }))
        ),
        h('div', { key: 'a', class: 'ds-g3-form-actions' },
            onCancel ? h('button', { key: 'x', type: 'button', class: 'ds-g3-btn ds-g3-btn--ghost', onclick: onCancel }, 'Cancel') : null,
            h('button', { key: 's', type: 'submit', class: 'ds-g3-btn is-on' }, 'Create server')
        )
    );
}

export function CatchUpButton({ count = 0, onClick, key } = {}) {
    return h('button', { key, type: 'button', class: 'ds-g3-catchup', onclick: onClick || null, 'aria-label': count ? count + ' unread messages, catch up' : 'Catch up' },
        'Catch up', count ? h('span', { key: 'c', class: 'ds-g3-catchup-count' }, String(count)) : null
    );
}

export function SplitToggle({ mode = 'single', onChange, key } = {}) {
    const opts = [['single', 'Single'], ['split', 'Split']];
    return h('div', { key, class: 'ds-g3-segment', role: 'radiogroup', 'aria-label': 'View mode' },
        opts.map(([v, label]) => h('button', { key: v, type: 'button', role: 'radio', class: 'ds-g3-segment-opt' + (mode === v ? ' is-on' : ''), 'aria-checked': mode === v ? 'true' : 'false', onclick: onChange ? () => onChange(v) : null }, label))
    );
}
