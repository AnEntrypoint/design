import * as webjsx from '../../../vendor/webjsx/index.js';
import { registerModule } from '../registry.js';

const h = webjsx.createElement;

const COPY = {
    mic: ['Mic open to the room', 'muting here silences you for everyone; switch your mic on and pick push to talk from the mic in the voice controls'],
    vcsounds: ['Join and leave sounds', 'the bloop when someone enters or leaves your voice room'],
    sbsounds: ['Hear the soundboard', 'off: airhorns and rimshots skip you'],
    sound: ['Message sounds', 'a soft ping when someone posts where you can hear it'],
    mentionsonly: ['Only ping for mentions', 'stay quiet unless someone @s you or says an alert word'],
    motion: ['Reduced motion', 'stops animations: typing dots, the radio bars, flashes'],
    ulinks: ['Always underline links', 'easier to tell links from text'],
    rolecolors: ['Show role colours on names', 'off: every name in the chat is plain'],
    embeds: ['Show pictures from links', 'image links show the picture itself'],
    jumbo: ['Big emoji', 'a message of only emoji shows them large'],
    spoilers: ['Always reveal spoilers', 'no click needed on ||hidden|| text'],
    h24: ['24-hour time', '13:37 instead of 1:37 PM'],
    devmode: ['Developer Mode', 'adds Copy Message ID and Copy User ID'],
    devevents: ['Event log', 'the events in this channel, with a title filter'],
    devinspect: ['Channel and member inspector', 'channel and member ids with their status'],
    devtraffic: ['Relay message counters', 'messages received and sent per relay'],
};

const GROUPS = {
    access: ['motion', 'ulinks', 'rolecolors'],
    voice: ['vcsounds', 'sbsounds'],
    notif: ['sound', 'mentionsonly'],
    media: ['embeds', 'jumbo', 'spoilers'],
    lang: ['h24'],
    adv: ['devmode', 'devevents', 'devinspect', 'devtraffic'],
};

const KEYBINDS = [['Quick Switcher', 'Ctrl P'], ['Send message', 'Enter'], ['New line', 'Shift Enter'], ['Mark channel read, close menus', 'Esc'], ['Previous / next channel', 'Alt ↑ ↓'], ['Bring back your last message', '↑'], ['Jump to newest', 'End'], ['Scroll a page', 'Page Up / Down'], ['Mention someone', 'Shift click name'], ['Reply to a message', 'Double-click it'], ['Emoji by name', ':fire'], ['Upload a picture', 'Ctrl V or drop it'], ['Pick a suggestion', 'Enter']];

const toggleRow = (key, checked, onToggle) => h('div', { key, class: 'ds-g3-tgl' + (checked ? ' on' : ''), role: 'switch', tabindex: '0', 'aria-checked': checked ? 'true' : 'false', 'aria-label': COPY[key][0], onclick: () => onToggle && onToggle(key, !checked) },
    h('div', null,
        h('div', { class: 'ds-g3-tgl-label' }, COPY[key][0]),
        h('div', { class: 'ds-g3-hint' }, COPY[key][1])),
    h('div', { class: 'ds-g3-sw2', 'aria-hidden': 'true' }));

const devRow = (label, value, key) => h('div', { key, class: 'ds-g3-dev-row' }, h('span', { class: 'ds-g3-dev-k' }, label), h('code', { class: 'ds-g3-dev-v' }, value));

const devReset = (onDevReset) => h('div', { key: 'dev-reset', class: 'ds-g3-dev-reset' }, h('div', { class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: (e) => { const b = e.currentTarget; if (b.dataset.sure) { onDevReset && onDevReset(); b.dataset.sure = ''; b.textContent = 'Reset local state'; } else { b.dataset.sure = '1'; b.textContent = 'press again to clear zellous preferences'; } } }, 'Reset local state'));

const devRows = (d, onDevReset, onDevFilter, toggles, onDevRefresh) => [
    h('h6', { key: 'dev' }, 'Developer'),
    devRow('Connection', d.connection, 'c'),
    ...d.relays.map((r, i) => devRow(r.url, r.status, 'r' + i)),
    devRow('Presence', d.presence, 'p'),
    devRow('Members', String(d.members.length), 'm'),
    ...(toggles.devinspect ? [
        h('h6', { key: 'dch' }, 'Channels'),
        ...d.channels.map((c) => devRow(c.name, c.type + ' · ' + c.id, 'ch' + c.id)),
        h('h6', { key: 'dmem' }, 'Member inspector'),
        ...d.members.map((m, i) => devRow(m.name || 'member', m.status + ' · ' + m.id, 'mm' + i)),
    ] : []),
    ...(toggles.devtraffic ? [
        h('h6', { key: 'dtr' }, 'Relay counters'),
        h('div', { key: 'dtr-b', class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: () => onDevRefresh && onDevRefresh() }, 'Refresh counters'),
        ...(d.traffic && d.traffic.length ? d.traffic.map((r, i) => devRow(r.url, 'in ' + r.in + ' · out ' + r.out, 'tr' + i)) : [h('p', { key: 'tr-none', class: 'ds-g3-hint' }, 'no relays')]),
    ] : []),
    ...(toggles.devevents ? [
        h('h6', { key: 'dev-ev' }, 'Event log'),
        h('input', { key: 'dev-flt', class: 'ds-g3-fi', maxlength: '60', placeholder: 'filter by title', value: d.filter || '', onchange: (e) => onDevFilter && onDevFilter(e.target.value) }),
        ...(d.events.length ? d.events.map((e, i) => devRow(String(e.title || 'event'), e.start ? new Date(e.start * 1000).toLocaleString() : '', 'e' + i)) : [h('p', { key: 'none', class: 'ds-g3-hint' }, 'no events match')]),
    ] : []),
    devReset(onDevReset),
];

const paneSet = ({ devInfo = null, onDevReset, onDevFilter, onDevRefresh, toggles = {}, micOn = true, onMic, keywords = '', mutedChannels = [], onUnmute, compact = false, onCompact, onKeywords, theme = 'ink', onTheme, onToggle, onReset }) => {
    const group = (g) => GROUPS[g].map((k) => toggleRow(k, !!toggles[k], onToggle));
    return {
        appearance: () => [
            h('h2', { key: 'h' }, 'Appearance'),
            h('h6', { key: 'th' }, 'Theme'),
            h('div', { key: 'themes', class: 'ds-g3-themes' },
                [['ink', 'Dark', '#313338'], ['ash', 'Ash', '#2b2b30'], ['onyx', 'Onyx', '#0e0e10'], ['light', 'Light', '#ffffff']].map(([key, label, bg]) => h('div', { key, class: theme === key ? 'on' : '', title: label, role: 'button', tabindex: '0', style: 'background:' + bg, onclick: () => onTheme && onTheme(key) }))),
            h('h6', { key: 'md' }, 'Message Display'),
            h('div', { key: 'cz', class: 'ds-g3-radio' + (!compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': !compact ? 'true' : 'false', onclick: () => onCompact && onCompact(false) }, h('i', { 'aria-hidden': 'true' }), 'Cozy: modern, beautiful, and easy on your eyes.'),
            h('div', { key: 'cp', class: 'ds-g3-radio' + (compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': compact ? 'true' : 'false', onclick: () => onCompact && onCompact(true) }, h('i', { 'aria-hidden': 'true' }), 'Compact: fit more messages on screen at one time.'),
        ],
        access: () => [h('h2', { key: 'h' }, 'Accessibility'), ...group('access')],
        voice: () => [
            h('h2', { key: 'h' }, 'Voice & Audio'),
            toggleRow('mic', micOn, () => onMic && onMic()),
            ...group('voice'),
            h('p', { key: 'hint', class: 'ds-g3-hint' }, 'master volume and devices are in the voice settings next to your mic'),
        ],
        notif: () => [
            h('h2', { key: 'h' }, 'Notifications'),
            ...group('notif'),
            h('h6', { key: 'ka' }, 'Keyword Alerts'),
            h('input', { key: 'kw', class: 'ds-g3-fi', maxlength: '200', placeholder: 'tournament, pizza, my nickname', value: keywords, onchange: (e) => onKeywords && onKeywords(e.target.value) }),
            h('p', { key: 'kh', class: 'ds-g3-hint' }, 'words that ping you, light up and land in your Inbox like an @mention, even in muted channels'),
            h('h6', { key: 'mc' }, 'Muted Channels'),
            ...(mutedChannels.length
                ? mutedChannels.map((c) => h('div', { key: 'm' + c.id, class: 'ds-g3-tgl', role: 'button', tabindex: '0', onclick: () => onUnmute && onUnmute(c.id) },
                    h('div', null,
                        h('div', { class: 'ds-g3-tgl-label' }, '#' + c.name),
                        h('div', { class: 'ds-g3-hint' }, 'muted · press to unmute'))))
                : [h('div', { key: 'none', class: 'ds-g3-hint' }, 'none. the bell in a channel\'s header mutes it.')]),
        ],
        media: () => [h('h2', { key: 'h' }, 'Chat & Media'), ...group('media')],
        lang: () => [h('h2', { key: 'h' }, 'Language & Time'), h('h6', { key: 't' }, 'Time'), ...group('lang')],
        keys: () => [h('h2', { key: 'h' }, 'Keybinds'), ...KEYBINDS.map(([a, k]) => h('div', { key: a, class: 'ds-g3-kb' }, h('span', null, a), h('kbd', null, k)))],
        adv: () => [
            h('h2', { key: 'h' }, 'Advanced'),
            ...group('adv'),
            ...(devInfo && toggles.devmode ? devRows(devInfo, onDevReset, onDevFilter, toggles, onDevRefresh) : []),
            h('h6', { key: 'r' }, 'Reset'),
            h('div', { key: 'rb', class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: (e) => { const b = e.currentTarget; if (b.dataset.sure) { onReset && onReset(); b.dataset.sure = ''; b.textContent = 'Reset all settings'; } else { b.dataset.sure = '1'; b.textContent = 'press again to reset every setting'; } } }, 'Reset all settings'),
        ],
    };
};

const APP_PANES = [['appearance', 'Appearance'], ['access', 'Accessibility'], ['voice', 'Voice & Audio'], ['notif', 'Notifications'], ['media', 'Chat & Media'], ['lang', 'Language & Time'], ['keys', 'Keybinds'], ['adv', 'Advanced']];

APP_PANES.forEach(([id, label], i) => registerModule({
    id: 'settings-' + id, kind: 'settingsPane',
    settingsPane: { id, label, group: 'App Settings', order: 20 + i, mount: (ctx) => paneSet(ctx)[id]() },
}));
