import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

const RULES = [
    ['Be kind', 'No harassment, hate or bullying. Disagree with ideas, not people.'],
    ['Keep it in the right channel', '#gaming for games, #memes for memes, #clips for pictures.'],
    ['No spam', 'No floods, no walls of caps, no repeated pings.'],
    ['Keep it clean', 'Nothing NSFW. Use ||spoilers|| for story reveals.'],
    ['Voice etiquette', "Mute when you're not talking. Soundboard in moderation."],
    ['Have fun', 'Say hi in #general and wave at new people 👋'],
];

export function Game3RulesPanel({ serverName = '', online = 0, members = 0, onDone, key } = {}) {
    return h('div', { key, class: 'ds-g3-rl' },
        h('div', { class: 'ds-g3-rhero' },
            h('div', { class: 'ds-g3-ric' }, 'G3'),
            h('div', null,
                h('h1', null, 'Welcome to ' + serverName),
                h('p', null, online + ' online · ' + members + ' members · a place to hang out'))),
        RULES.map(([t, d], i) => h('div', { key: 'r' + i, class: 'ds-g3-rl-item' },
            h('div', { class: 'ds-g3-rl-n' }, String(i + 1)),
            h('div', null,
                h('b', null, t),
                h('p', null, d)))),
        h('div', { class: 'ds-g3-cta', role: 'button', tabindex: '0', onclick: () => onDone && onDone() }, 'Got it, take me to #general →'));
}
