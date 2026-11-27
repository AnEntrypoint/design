import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

const commit = (e, act) => { if (e.key === 'Enter') e.target.blur(); e.stopPropagation(); return act; };

const channelRow = (c, kind, acts) => h('div', { key: kind + c.id, class: 'ds-g3-srow' },
    h('span', null, kind === 'c' ? '#' : '🔊'),
    h('input', { value: c.name, maxlength: '24', 'aria-label': 'rename ' + c.name, onkeydown: (e) => commit(e), onchange: (e) => { const v = e.target.value.trim(); if (v && v !== c.name && acts.renameServerChannel) acts.renameServerChannel(c.id, v); else e.target.value = c.name; } }),
    kind === 'c' ? h('input', { class: 'ds-g3-tpc', value: c.topic || '', maxlength: '60', placeholder: 'topic', 'aria-label': 'topic of ' + c.name, onkeydown: (e) => commit(e), onchange: (e) => acts.topicServerChannel && acts.topicServerChannel(c.id, e.target.value.trim()) }) : null,
    h('b', { title: 'Delete', role: 'button', tabindex: '0', onclick: () => acts.deleteServerChannel && acts.deleteServerChannel(c.id), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acts.deleteServerChannel && acts.deleteServerChannel(c.id); } } }, '✕'));

const addRow = (kind, acts) => {
    const submit = (input) => { const v = input.value.trim(); if (v && acts.addServerChannel) { acts.addServerChannel(kind, v); input.value = ''; } };
    return h('div', { key: 'add' + kind, class: 'ds-g3-srow' },
        h('span', null, '+'),
        h('input', { placeholder: kind === 'c' ? 'new-channel' : 'New Voice', maxlength: '24', 'aria-label': kind === 'c' ? 'new text channel' : 'new voice channel', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(e.target); } }),
        h('b', { class: 'ds-g3-add', title: 'Add', role: 'button', tabindex: '0', onclick: (e) => submit(e.currentTarget.previousElementSibling) }, '✓'));
};

export function Game3ServerSettings({ settings, acts = {}, onClose, onDiscovery } = {}) {
    const d = settings;
    if (!d) return null;
    const save = (patch) => acts.saveServerSettings && acts.saveServerSettings(patch);
    return h('div', { key: 'srvsettings', class: 'ds-g3-scrim', role: 'presentation', onclick: (e) => { if (e.target === e.currentTarget && onClose) onClose(); }, onkeydown: (e) => { if (e.key === 'Escape' && onClose) onClose(); } },
        h('div', { class: 'ds-g3-evm', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Server Settings' },
            h('div', { class: 'ds-g3-evh' },
                h('b', null, '⚙️ ' + d.name + ' · Server Settings'),
                h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close', onclick: onClose }, '✕')),
            h('div', { class: 'ds-g3-evl ds-g3-sform' },
                h('div', { class: 'ds-g3-lbl' }, 'Name'),
                h('input', { value: d.name, maxlength: '32', 'aria-label': 'server name', onkeydown: (e) => commit(e), onchange: (e) => { const v = e.target.value.trim(); if (v && v !== d.name) save({ name: v }); else e.target.value = d.name; } }),
                h('div', { class: 'ds-g3-lbl' }, 'Colour'),
                h('div', { class: 'ds-g3-swatches' }, (d.colors || []).map((c) => h('i', { key: c, class: String(d.color).toLowerCase() === c.toLowerCase() ? 'on' : '', style: 'background:' + c, role: 'button', tabindex: '0', 'aria-label': 'colour ' + c, onclick: () => save({ color: c }), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); save({ color: c }); } } }))),
                h('div', { class: 'ds-g3-lbl' }, 'Text Channels · ' + d.textChannels.length),
                ...d.textChannels.map((c) => channelRow(c, 'c', acts)),
                addRow('c', acts),
                h('div', { class: 'ds-g3-lbl' }, 'Voice Channels · ' + d.voiceChannels.length),
                ...d.voiceChannels.map((c) => channelRow(c, 'v', acts)),
                addRow('v', acts),
                h('div', { class: 'ds-g3-lbl' }, 'Members · ' + d.members.length),
                h('p', { class: 'ds-g3-sub' }, d.members.join(', ')),
                onDiscovery ? h('div', { key: 'disc', class: 'ds-g3-lbl' }, 'Discovery') : null,
                onDiscovery ? h('div', { key: 'discb', class: 'ds-g3-evb ds-g3-evb-on ds-g3-srv-more', role: 'button', tabindex: '0', onclick: onDiscovery }, 'Discovery and promotion') : null,
                h('div', { class: 'ds-g3-lbl' }, 'Danger Zone'),
                h('div', { class: 'ds-g3-evb ds-g3-evb-ghost ds-g3-srv-del', role: 'button', tabindex: '0', onclick: () => acts.openServerDelete && acts.openServerDelete(), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acts.openServerDelete && acts.openServerDelete(); } } }, 'Delete Server'))));
}
