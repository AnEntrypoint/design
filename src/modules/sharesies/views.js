import * as webjsx from '../../../vendor/webjsx/index.js';
import { Game3Modal } from '../../components/game3-modal.js';
import { game3AvatarBg, game3AvInitial } from '../../components/game3-hue.js';

const h = webjsx.createElement;

const press = (fn) => ({ role: 'button', tabindex: '0', onclick: fn, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } } });

const STATE_TEXT = { idle: 'Not started', joining: 'Joining…', 'waiting-host': 'Waiting for the host to appear…', connected: 'Connected', reconnecting: 'Host dropped, reconnecting…', ended: 'The program exited', left: 'Left' };

export const stateText = (session) => (session.state === 'ended' ? 'The program exited with code ' + session.exitCode : STATE_TEXT[session.state] || session.state);

export const WARNING = 'Everyone in the session can see this terminal and anyone who joins can type into it. The seed in the address is the password: only share it with people you trust.';

export function SharesiesCard({ seed, sessions, onJoin, onOpen, onLeave, key, name, time, avatarId, onProfile }) {
    const session = sessions.find((x) => x.id === seed.id);
    const active = session && session.state !== 'left' && session.state !== 'ended' && session.state !== 'idle';
    const ended = session && session.state === 'ended';
    return h('div', { key, class: 'ds-g3-msg ds-g3-ln' },
        h('div', { class: 'ds-g3-av', role: 'button', tabindex: '0', style: '--ds-g3-av-color:' + game3AvatarBg(name, avatarId), onclick: onProfile }, game3AvInitial(String(name || '?').slice(0, 1).toUpperCase(), avatarId)),
        h('div', { class: 'ds-g3-col' },
            h('div', null, h('span', { class: 'ds-g3-who' }, name), h('span', { class: 'ds-g3-when' }, time)),
            h('div', { class: 'ds-g3-inv ds-g3-shcard' },
                h('div', { class: 'ds-g3-inv-ih' }, 'A shared terminal'),
                h('div', { class: 'ds-g3-inv-ib' },
                    h('div', { class: 'ds-g3-inv-dico' }, '>_'),
                    h('div', { class: 'ds-g3-shtext' }, h('h3', null, 'Live terminal over Sharesies'), h('p', null, session ? stateText(session) : 'Not joined. Nothing connects until you press Join.')),
                    active ? h('span', { ...press(onOpen), class: 'ds-g3-evb ds-g3-evb-on' }, 'Open')
                        : h('span', { ...press(onJoin), class: 'ds-g3-evb ds-g3-evb-on' }, ended ? 'Join again' : 'Join')),
                h('div', { class: 'ds-g3-shwarn', role: 'note' }, WARNING),
                active ? h('div', { ...press(onLeave), class: 'ds-g3-shleave' }, 'Leave session') : null)));
}

export function SharesiesPanel({ session, onClose, onLeave }) {
    const people = session.participants.filter((p) => !p.isHost);
    return h('div', { key: 'shpanel', class: 'ds-g3-shpanel', role: 'dialog', 'aria-label': 'shared terminal' },
        h('div', { class: 'ds-g3-shhead' },
            h('b', null, 'Shared terminal'),
            h('span', { class: 'ds-g3-shstate ' + session.state, role: 'status' }, stateText(session)),
            h('span', { ...press(onClose), class: 'ds-g3-evx', 'aria-label': 'hide panel', title: 'Hide (stay connected)' }, '✕')),
        h('div', { class: 'ds-g3-shwho' }, 'Can see and type: the host' + (people.length ? ' and ' + people.length + ' other' + (people.length === 1 ? '' : 's') : '') + '. ' + WARNING),
        h('div', { key: 'term', class: 'ds-g3-term', 'data-sharesies-term': session.id }),
        h('div', { class: 'ds-g3-shfoot' }, h('span', { ...press(onLeave), class: 'ds-g3-evb ds-g3-evb-ghost' }, 'Leave session')));
}

export function SharesiesShare({ share, targets, session, acts }) {
    const target = share.target || 'channel';
    const chosen = targets.find((t) => t.id === target) || targets[0];
    return h('div', { key: 'shshare', class: 'ds-g3-scrim', role: 'presentation', onclick: (e) => { if (e.target === e.currentTarget) acts.onClose(); } },
        Game3Modal({ title: 'Share a terminal', onClose: acts.onClose },
            h('div', { class: 'ds-g3-shwarn' }, WARNING),
            h('h6', null, '1. What to share'),
            h('div', { class: 'ds-g3-row2' },
                h('input', { class: 'ds-g3-fi', id: 'sh-app', placeholder: 'bash', value: share.app || '', maxlength: '120', 'aria-label': 'program to share', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') acts.onGenerate(e.target.value); } }),
                h('span', { ...press(() => acts.onGenerate(document.getElementById('sh-app').value)), class: 'ds-g3-evb ds-g3-evb-on' }, share.seed ? 'New seed' : 'Generate')),
            share.seed ? [
                h('h6', { key: 'h2' }, '2. Run this on the machine to share'),
                h('code', { key: 'cmd', class: 'ds-g3-code' }, share.command),
                h('div', { key: 'cp', class: 'ds-g3-btnrow' }, h('span', { ...press(() => acts.onCopy(share.command)), class: 'ds-g3-evb' }, 'Copy command')),
                h('h6', { key: 'h3' }, '3. Send the invite'),
                chosen && chosen.public ? h('div', { key: 'pub', class: 'ds-g3-shwarn ds-g3-shdanger' }, 'This is a public room. Posting the invite here gives everyone control of that terminal. Pick a DM or a private server instead.') : null,
                h('div', { key: 'tg', class: 'ds-g3-row2' },
                    h('select', { class: 'ds-g3-langsel', 'aria-label': 'where to post', onchange: (e) => acts.onTarget(e.target.value) }, ...targets.map((t) => h('option', { key: t.id, value: t.id, selected: t.id === target }, t.label + (t.public ? ' (public)' : '')))),
                    h('span', { ...press(() => acts.onPost(target)), class: 'ds-g3-evb ds-g3-evb-on' }, share.posted ? 'Posted' : 'Post invite')),
                h('h6', { key: 'h4' }, 'Who is in'),
                session
                    ? h('div', { key: 'who', class: 'ds-g3-shwho' }, stateText(session) + '. In the session: ' + (session.participants.length ? session.participants.map((p) => (p.isHost ? 'host' : String(p.identity).slice(0, 10))).join(', ') : 'nobody yet'))
                    : h('div', { key: 'watch', class: 'ds-g3-btnrow' }, h('span', { ...press(() => acts.onWatch()), class: 'ds-g3-evb' }, 'Watch who joins'), h('span', { class: 'ds-g3-hint' }, 'joins as a viewer so you can see who is connected'))].filter(Boolean) : null));
}

export function SharesiesRail({ sessions, onShare, onOpen, onLeave }) {
    return [
        h('div', { key: 'shh', class: 'group group-header' }, h('span', null, 'Shared sessions'), h('button', { type: 'button', class: 'group-add-btn', 'aria-label': 'share a terminal', title: 'Share a terminal', onclick: onShare }, '+')),
        ...(sessions.filter((x) => !x.watch).length
            ? sessions.filter((x) => !x.watch).map((x) => h('a', { key: 'sh' + x.id, href: '#', class: 'ds-g3-shrow', onclick: (e) => { e.preventDefault(); onOpen(x.id); } },
                h('span', { class: 'ds-g3-shdot ' + x.state, 'aria-hidden': 'true' }),
                h('span', { class: 'ds-g3-shname' }, 'terminal ' + x.id.slice(2, 8)),
                h('span', { class: 'ds-g3-shleavebtn', role: 'button', tabindex: '0', title: 'Leave', 'aria-label': 'leave session', onclick: (e) => { e.preventDefault(); e.stopPropagation(); onLeave(x.id); } }, '✕')))
            : [h('div', { key: 'sh0', class: 'rail-empty', role: 'status' }, 'no shared sessions')]),
    ];
}
