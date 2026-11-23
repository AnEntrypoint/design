import * as webjsx from '../../../vendor/webjsx/index.js';
import { registerModule } from '../registry.js';

const h = webjsx.createElement;

const pressAgain = (label, armedLabel, onConfirm, key) => h('div', {
    key, class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0',
    onclick: (e) => {
        const b = e.currentTarget;
        if (b.dataset.sure) { b.dataset.sure = ''; b.textContent = label; onConfirm(); } else { b.dataset.sure = '1'; b.textContent = armedLabel; }
    },
}, label);

const channelRow = (c, acts) => h('div', { key: 'c' + c.id, class: 'ds-g3-srow' },
    h('input', { class: 'ds-g3-fi', maxlength: '32', value: c.name, 'aria-label': 'rename ' + c.name, onchange: (e) => { const v = e.target.value.trim(); if (v && v !== c.name && acts.renameServerChannel) acts.renameServerChannel(c.id, v); else e.target.value = c.name; } }),
    pressAgain('Delete', 'Press again', () => acts.deleteServerChannel && acts.deleteServerChannel(c.id), 'd' + c.id));

const pane = ({ serverSettings: d, acts }) => {
    if (!d) return [h('h2', { key: 'h' }, 'Server Settings'), h('p', { key: 'n', class: 'ds-g3-hint' }, 'Only the owner of a server can change its settings.')];
    const save = (patch) => acts.saveServerSettings && acts.saveServerSettings(patch);
    return [
        h('h2', { key: 'h' }, 'Server Settings'),
        h('h6', { key: 'nm' }, 'Name'),
        h('input', { key: 'name', class: 'ds-g3-fi', maxlength: '32', value: d.name, 'aria-label': 'server name', onkeydown: (e) => { if (e.key === 'Enter') e.target.blur(); }, onchange: (e) => { const v = e.target.value.trim(); if (v && v !== d.name) save({ name: v }); else e.target.value = d.name; } }),
        h('h6', { key: 'cl' }, 'Colour'),
        h('div', { key: 'colors', class: 'ds-g3-icons' }, (d.colors || []).map((c) => h('span', { key: c, class: String(d.color).toLowerCase() === c.toLowerCase() ? 'on' : '', style: 'background:' + c, role: 'button', tabindex: '0', 'aria-label': 'colour ' + c, onclick: () => save({ color: c }) }))),
        h('h6', { key: 'tc' }, 'Text Channels · ' + d.textChannels.length),
        ...d.textChannels.map((c) => channelRow(c, acts)),
        acts.createChannel ? h('div', { key: 'addt', class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: () => acts.createChannel('text') }, 'Add text channel') : null,
        h('h6', { key: 'vc' }, 'Voice Channels · ' + d.voiceChannels.length),
        ...d.voiceChannels.map((c) => channelRow(c, acts)),
        acts.createChannel ? h('div', { key: 'addv', class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: () => acts.createChannel('voice') }, 'Add voice channel') : null,
        h('h6', { key: 'mb' }, 'Members · ' + d.members.length),
        h('p', { key: 'ml', class: 'ds-g3-hint' }, d.members.join(', ')),
        h('h6', { key: 'dz' }, 'Danger Zone'),
        pressAgain('Delete Server', 'press again: delete ' + d.name + ' for everyone', () => acts.deleteServer && acts.deleteServer(), 'delsrv'),
    ].filter(Boolean);
};

registerModule({
    id: 'settings-server-general', kind: 'settingsPane',
    settingsPane: { id: 'general', label: 'Overview', group: 'Server Settings', order: 1, when: (s) => !!s.serverSettings, mount: pane },
});
