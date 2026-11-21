import * as webjsx from '../../vendor/webjsx/index.js';
const h = webjsx.createElement;

const TABS = [
    ['User Settings', [['account', 'My Account'], ['profile', 'Profiles']]],
    ['App Settings', [['appearance', 'Appearance'], ['access', 'Accessibility'], ['voice', 'Voice & Audio'], ['notif', 'Notifications'], ['media', 'Chat & Media'], ['lang', 'Language & Time'], ['keys', 'Keybinds'], ['adv', 'Advanced']]],
];

const COPY = {
    mic: ['Mic open to the room', 'muting here silences you for everyone; switch your mic on and pick push to talk from the mic in Spawn\'s chat'],
    vcsounds: ['Join and leave sounds', 'the bloop when someone enters or leaves your voice room'],
    sbsounds: ['Hear the soundboard', 'off: airhorns and rimshots skip you'],
    sound: ['Message sounds', 'a soft ping when someone posts where you can hear it'],
    mentionsonly: ['Only ping for mentions', 'stay quiet unless someone @s you or says an alert word'],
    motion: ['Reduced motion', 'stops animations: typing dots, the radio bars, flashes'],
    ulinks: ['Always underline links', 'easier to tell links from text'],
    embeds: ['Show pictures from links', 'image links show the picture itself'],
    jumbo: ['Big emoji', 'a message of only emoji shows them large'],
    spoilers: ['Always reveal spoilers', 'no click needed on ||hidden|| text'],
    h24: ['24-hour time', '13:37 instead of 1:37 PM'],
    devmode: ['Developer Mode', 'adds Copy Message ID and Copy User ID'],
};

const GROUPS = {
    access: ['motion', 'ulinks'],
    voice: ['vcsounds', 'sbsounds'],
    notif: ['sound', 'mentionsonly'],
    media: ['embeds', 'jumbo', 'spoilers'],
    lang: ['h24'],
    adv: ['devmode'],
};

const KEYBINDS = [['Quick Switcher', 'Ctrl P'], ['Send message', 'Enter'], ['New line', 'Shift Enter'], ['Mark channel read, close menus', 'Esc'], ['Previous / next channel', 'Alt ↑ ↓'], ['Bring back your last message', '↑'], ['Jump to newest', 'End'], ['Scroll a page', 'Page Up / Down'], ['Mention someone', 'Shift click name'], ['Reply to a message', 'Double-click it'], ['Emoji by name', ':fire'], ['Upload a picture', 'Ctrl V or drop it'], ['Pick a suggestion', 'Enter']];

const SWATCHES = ['#c4602f', '#5865f2', '#eb459e', '#9b84ee', '#1abc9c', '#f1c40f', '#57f287', '#2b2d31'];

const toggleRow = (key, checked, onToggle) => h('div', { key, class: 'ds-g3-tgl' + (checked ? ' on' : ''), role: 'switch', tabindex: '0', 'aria-checked': checked ? 'true' : 'false', 'aria-label': COPY[key][0], onclick: () => onToggle && onToggle(key, !checked) },
    h('div', null,
        h('div', { class: 'ds-g3-tgl-label' }, COPY[key][0]),
        h('div', { class: 'ds-g3-hint' }, COPY[key][1])),
    h('div', { class: 'ds-g3-sw2', 'aria-hidden': 'true' }));

export function Game3SettingsPanel({ tab = 'account', onTab, name = 'You', initial = 'Y', level = 0, xp = 0, servers = 0, toggles = {}, micOn = true, onMic, keywords = '', mutedChannels = [], onUnmute, compact = false, banner = '', onCompact, onKeywords, onBanner, theme = 'ink', onTheme, onToggle, onReset, onClose } = {}) {
    const group = (g) => GROUPS[g].map((k) => toggleRow(k, !!toggles[k], onToggle));
    const pane = {
        account: () => [
            h('h2', { key: 'h' }, 'My Account'),
            h('div', { key: 'acct', class: 'ds-g3-acct' },
                h('div', { class: 'ds-g3-acct-ban', style: 'background:' + (banner || '#c4602f') }),
                h('div', { class: 'ds-g3-acct-row' },
                    h('div', { class: 'ds-g3-acct-av' }, initial),
                    h('div', null, h('h3', null, name)))),
            h('div', { key: 'stat', class: 'ds-g3-stat' },
                h('div', null, h('b', null, String(level)), h('span', null, 'level')),
                h('div', null, h('b', null, String(xp)), h('span', null, 'xp')),
                h('div', null, h('b', null, String(servers)), h('span', null, 'servers'))),
        ],
        profile: () => [
            h('h2', { key: 'h' }, 'Profiles'),
            h('h6', { key: 'bc' }, 'Banner Colour'),
            h('div', { key: 'sw', class: 'ds-g3-swatches' }, ['', ...SWATCHES].map((c) => h('i', { key: 'c' + c, title: c || 'automatic', class: (banner || '') === c ? 'on' : '', style: 'background:' + (c || '#80848e'), role: 'button', tabindex: '0', onclick: () => onBanner && onBanner(c) }))),
        ],
        appearance: () => [
            h('h2', { key: 'h' }, 'Appearance'),
            h('h6', { key: 'th' }, 'Theme'),
            h('div', { key: 'themes', class: 'ds-g3-themes' },
                h('div', { class: theme === 'ink' ? 'on' : '', title: 'Dark', role: 'button', tabindex: '0', style: 'background:#313338', onclick: () => onTheme && onTheme('ink') }),
                h('div', { class: theme === 'light' ? 'on' : '', title: 'Light', role: 'button', tabindex: '0', style: 'background:#ffffff', onclick: () => onTheme && onTheme('light') })),
            h('h6', { key: 'md' }, 'Message Display'),
            h('div', { key: 'cz', class: 'ds-g3-radio' + (!compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': !compact ? 'true' : 'false', onclick: () => onCompact && onCompact(false) }, h('i', { 'aria-hidden': 'true' }), 'Cozy: modern, beautiful, and easy on your eyes.'),
            h('div', { key: 'cp', class: 'ds-g3-radio' + (compact ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': compact ? 'true' : 'false', onclick: () => onCompact && onCompact(true) }, h('i', { 'aria-hidden': 'true' }), 'Compact: fit more messages on screen at one time.'),
        ],
        access: () => [h('h2', { key: 'h' }, 'Accessibility'), ...group('access')],
        voice: () => [
            h('h2', { key: 'h' }, 'Voice & Audio'),
            toggleRow('mic', micOn, () => onMic && onMic()),
            ...group('voice'),
            h('p', { key: 'hint', class: 'ds-g3-hint' }, 'volume lives in Spawn\'s settings on the right rail'),
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
            h('h6', { key: 'r' }, 'Reset'),
            h('div', { key: 'rb', class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: (e) => { const b = e.currentTarget; if (b.dataset.sure) { onReset && onReset(); b.dataset.sure = ''; b.textContent = 'Reset all settings'; } else { b.dataset.sure = '1'; b.textContent = 'press again to reset every setting'; } } }, 'Reset all settings'),
        ],
    };
    return h('div', { class: 'ds-g3-set', role: 'dialog', 'aria-label': 'settings' },
        h('div', { class: 'ds-g3-set-nav' },
            h('div', null,
                TABS.map(([head, list]) => [
                    h('h5', { key: 'h' + head }, head),
                    ...list.map(([k, n]) => h('p', { key: k, class: k === tab ? 'on' : '', role: 'button', tabindex: '0', onclick: () => onTab && onTab(k) }, n)),
                ]))),
        h('div', { class: 'ds-g3-set-pane' }, (pane[tab] || pane.account)()),
        h('div', { class: 'ds-g3-set-close', role: 'button', tabindex: '0', 'aria-label': 'close settings', onclick: () => onClose && onClose() }, '✕'));
}
