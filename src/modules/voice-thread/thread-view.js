import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../../components/shell.js';
import { game3AvatarBg, game3AvInitial } from '../../components/game3-hue.js';

const h = webjsx.createElement;

const seconds = (n) => (n >= 60 ? Math.floor(n / 60) + ':' + String(Math.round(n % 60)).padStart(2, '0') : Math.round(n * 10) / 10 + 's');

const press = (fn) => ({ role: 'button', tabindex: '0', onclick: fn, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } } });

const clipChip = (c, onPlay, onReplay) => h('div', { key: 'c' + c.seq, class: 'ds-g3-vtclip ds-g3-vtclip-' + c.state, title: 'Clip ' + c.seq + ' · ' + seconds(c.seconds) },
    h('span', { class: 'ds-g3-vtseq' }, '#' + c.seq),
    h('span', { class: 'ds-g3-vtdur' }, seconds(c.seconds)),
    c.state === 'expired' ? h('span', { class: 'ds-g3-hint' }, 'audio expired')
        : c.state === 'playing' ? h('span', { class: 'ds-g3-vtbars', 'aria-label': 'playing' }, h('i'), h('i'), h('i'))
            : h('span', { ...press(() => (c.state === 'queued' ? onPlay(c.seq) : onReplay(c.seq))), class: 'ds-g3-vtbtn', 'aria-label': c.state === 'queued' ? 'play clip ' + c.seq : 'replay clip ' + c.seq, title: c.state === 'queued' ? 'Play now' : 'Replay' }, c.state === 'queued' ? '▶' : '↺'));

const lane = (l, acts) => h('div', { key: 'l' + l.id, class: 'ds-g3-vtlane' + (l.speaking ? ' talk' : '') },
    h('div', { class: 'ds-g3-vthead' },
        h('span', { class: 'ds-g3-vtav', style: 'background:' + game3AvatarBg(l.name, l.id) }, game3AvInitial(String(l.name || '?').slice(0, 1).toUpperCase(), l.id)),
        h('span', { class: 'ds-g3-vtname' }, l.name),
        l.speaking ? h('span', { class: 'ds-g3-vtlive' }, 'speaking') : null),
    h('div', { class: 'ds-g3-vtclips' }, ...(l.clips.length ? l.clips.map((c) => clipChip(c, acts.onPlay, acts.onReplay)) : [h('span', { key: 'none', class: 'ds-g3-hint' }, 'nothing queued')])));

export function Game3VoiceThread({ thread, acts } = {}) {
    const t = thread || { connected: false, lanes: [], stack: [], vad: { level: 0 }, settings: {} };
    const status = !t.connected ? 'Not connected' : t.ownTalk ? 'You are talking: incoming voice is paused and stacked' : t.liveSpeakers && t.liveSpeakers.length ? t.liveSpeakers.map((x) => x.name).join(', ') + ' talking live' : t.stack.length ? 'Playing the stack' : 'Quiet: live voice plays as it comes';
    return h('div', { class: 'ds-g3-vt', role: 'region', 'aria-label': 'voice thread' },
        h('div', { key: 'bar', class: 'ds-g3-vtbar' },
            t.connected
                ? h('div', { ...press(() => acts.onLeave()), class: 'ds-g3-evb ds-g3-evb-ghost' }, 'Leave thread')
                : h('div', { ...press(() => acts.onJoin()), class: 'ds-g3-evb ds-g3-evb-on' }, t.joining ? 'Joining…' : 'Join thread'),
            h('span', { class: 'ds-g3-vtstate' + (t.ownTalk ? ' own' : t.connected ? ' live' : ''), role: 'status', 'aria-live': 'polite' },
                h('i', { class: 'ds-g3-vtdot', 'aria-hidden': 'true' }), status)),
        h('div', { key: 'tools', class: 'ds-g3-vttools' },
            h('label', { class: 'ds-g3-vtfield' }, h('span', null, 'Mic sensitivity'),
                h('input', { type: 'range', min: '0', max: '100', value: String(Math.round((t.settings.sensitivity === undefined ? 0.5 : t.settings.sensitivity) * 100)), class: 'ds-g3-range', 'aria-label': 'mic sensitivity', onchange: (e) => acts.onSensitivity(Number(e.target.value) / 100) })),
            h('div', { class: 'ds-g3-vtmeter', role: 'meter', 'aria-label': 'voice level', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round((t.vad.level || 0) * 100)) }, h('i', { style: '--ds-g3-vt-level:' + Math.round((t.vad.level || 0) * 100) + '%' + (t.vad.voiced ? ';--ds-g3-vt-on:1' : '') })),
            h('span', { class: 'ds-g3-hint', title: 'Clips that were not speech (hot mic, breathing, keyboard) and were dropped' }, (t.filtered || 0) + ' filtered'),
            h('div', { ...press(() => acts.onKeep(!t.settings.keep)), class: 'ds-g3-tgl' + (t.settings.keep ? ' on' : ''), 'aria-label': 'keep clips', 'aria-pressed': t.settings.keep ? 'true' : 'false' }, h('div', null, h('div', { class: 'ds-g3-tgl-label' }, 'Keep clips'), h('div', { class: 'ds-g3-hint' }, 'uploads each clip so people who join later can hear it')), h('div', { class: 'ds-g3-sw2', 'aria-hidden': 'true' }))),
        h('div', { key: 'stack', class: 'ds-g3-vtstack' },
            h('h6', null, 'Stack'),
            ...(t.stack.length
                ? t.stack.map((c, i) => h('div', { key: 's' + c.seq, class: 'ds-g3-vtrow' + (i === 0 && c.state === 'playing' ? ' on' : '') },
                    h('span', { class: 'ds-g3-vtseq' }, '#' + c.seq), h('span', { class: 'ds-g3-vtname' }, c.name), h('span', { class: 'ds-g3-vtdur' }, seconds(c.seconds)),
                    i === 0 ? h('span', { class: 'ds-g3-vtctl' },
                        h('span', { ...press(() => acts.onPause()), class: 'ds-g3-vtbtn', title: t.paused ? 'Resume' : 'Pause', 'aria-label': t.paused ? 'resume' : 'pause' }, t.paused ? '▶' : '❙❙'),
                        h('span', { ...press(() => acts.onSkip()), class: 'ds-g3-vtbtn', title: 'Skip', 'aria-label': 'skip' }, '⏭')) : null))
                : [h('div', { key: 'empty', class: 'ds-g3-hint' }, 'the stack is empty')])),
        h('div', { key: 'lanes', class: 'ds-g3-vtlanes' }, ...(t.lanes.length ? t.lanes.map((l) => lane(l, acts)) : [h('div', { key: 'none', class: 'ds-g3-hint' }, t.connected ? 'nobody has spoken yet' : 'join the thread to hear and be heard')])));
}
