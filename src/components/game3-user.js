import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
import { IconToggle } from './shell/icons.js';
import { STATUS } from '../game3-data.js';
import { menuKeys } from './game3-usermenus.js';

const h = webjsx.createElement;

let longPress = null;
let suppressClick = false;

export function Game3UserPanel({ name = 'You', color = 'var(--accent)', statusLabel = '', statusColor = '#23a55a', muted = false, onProfile, onMute, onSettings, onAvatar, onRenameStart, onContext, rename = null, menu = null, hideInitial = false } = {}) {
    const initial = hideInitial ? '' : String(name || '?').trim().slice(0, 1).toUpperCase();
    const startPress = (e) => { if (!onContext) return; const t = e.touches && e.touches[0]; const x = t ? t.clientX : 0; const y = t ? t.clientY : 0; clearTimeout(longPress); longPress = setTimeout(() => { longPress = null; suppressClick = true; setTimeout(() => { suppressClick = false; }, 900); onContext({ clientX: x, clientY: y, preventDefault() {} }); }, 520); };
    const endPress = () => { clearTimeout(longPress); longPress = null; };
    const guard = (fn) => (e) => { if (suppressClick) { suppressClick = false; e.stopPropagation(); return; } if (fn) fn(e); };
    return h('div', {
        class: 'ds-g3-me',
        oncontextmenu: onContext ? (e) => { e.preventDefault(); onContext(e); } : null,
        ontouchstart: startPress, ontouchend: endPress, ontouchmove: endPress, ontouchcancel: endPress,
    },
        ...(menu ? [menu] : []),
        h('div', { class: 'ds-g3-mebtn', role: 'button', tabindex: '0', 'aria-haspopup': 'menu', 'aria-label': 'status menu, ' + name, onclick: guard(onProfile), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onProfile && onProfile(e); } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); onContext && onContext({ clientX: 0, clientY: 0, preventDefault() {} }); } } },
            h('div', { class: 'ds-g3-meav', role: 'button', tabindex: '0', 'aria-haspopup': 'menu', 'aria-label': 'change avatar', title: 'Change avatar', style: '--ds-g3-av-color:' + color, onclick: guard((e) => { e.stopPropagation(); onAvatar && onAvatar(e); }), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onAvatar && onAvatar(e); } } },
                initial,
                h('span', { class: 'ds-g3-medot', style: '--ds-g3-dot-color:' + statusColor, 'aria-hidden': 'true' })),
            h('div', { class: 'ds-g3-mentext' },
                rename
                    ? h('input', { class: 'ds-g3-rename', maxlength: '32', value: rename.value, 'aria-label': 'display name', 'aria-invalid': rename.error ? 'true' : null, onclick: (e) => e.stopPropagation(), onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') rename.onCommit(e.target.value); else if (e.key === 'Escape') rename.onCancel(); }, oninput: (e) => rename.onInput(e.target.value) })
                    : h('div', { class: 'ds-g3-men', title: 'Rename', onclick: guard((e) => { e.stopPropagation(); onRenameStart && onRenameStart(e); }) }, name),
                rename && rename.error ? h('div', { class: 'ds-g3-mes ds-g3-mes-err', role: 'alert' }, rename.error) : statusLabel ? h('div', { class: 'ds-g3-mes', onclick: guard((e) => { e.stopPropagation(); onProfile && onProfile(e); }) }, statusLabel) : null)),
        h('button', { type: 'button', class: 'ds-g3-ibtn' + (muted ? ' red' : ''), title: muted ? 'Unmute' : 'Mute', 'aria-label': muted ? 'unmute microphone' : 'mute microphone', 'aria-pressed': muted ? 'true' : 'false', onclick: onMute },
            ...IconToggle(muted, 'g3-micoff', 'g3-mic', { size: 20 })),
        h('button', { type: 'button', class: 'ds-g3-ibtn', title: 'User Settings', 'aria-label': 'user settings', onclick: onSettings },
            Icon('g3-gear', { size: 20 })));
}

const statusDraft = { emoji: null, text: null };
export const statusDraftReset = () => { statusDraft.emoji = null; statusDraft.text = null; };

const PRESETS = [['30m', '30 min'], ['1h', '1 hour'], ['today', 'Today'], ['never', 'Never']];

export const statusPresetSeconds = (key) => {
    if (key === '30m') return 1800;
    if (key === '1h') return 3600;
    if (key === 'today') { const end = new Date(); end.setHours(24, 0, 0, 0); return Math.max(60, Math.round((end.getTime() - Date.now()) / 1000)); }
    return 0;
};

export function Game3StatusMenu({ status = 'online', custom = '', emoji = '', preset = 'never', expiresLabel = '', onStatus, onCustom, onPreset } = {}) {
    const save = (menu) => { const t = menu.querySelector('input[aria-label="custom status"]'); const em = menu.querySelector('.ds-g3-cemo'); if (onCustom) onCustom(t.value, em.value, preset); };
    return h('div', { key: 'smenu', class: 'ds-g3-statusmenu', role: 'menu', onkeydown: menuKeys },
        h('div', { key: 'csrow', class: 'ds-g3-csrow' },
            h('input', { class: 'ds-g3-cst ds-g3-cemo', maxlength: '8', placeholder: '😀', value: statusDraft.emoji !== null ? statusDraft.emoji : emoji, 'aria-label': 'status emoji', oninput: (e) => { statusDraft.emoji = e.target.value; }, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') save(e.currentTarget.closest('.ds-g3-statusmenu')); } }),
            h('input', { key: 'cst', class: 'ds-g3-cst', maxlength: '60', placeholder: 'Set a custom status, Enter saves', value: statusDraft.text !== null ? statusDraft.text : custom, 'aria-label': 'custom status', oninput: (e) => { statusDraft.text = e.target.value; }, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') save(e.currentTarget.closest('.ds-g3-statusmenu')); } })),
        h('div', { key: 'pre', class: 'ds-g3-presets', role: 'radiogroup', 'aria-label': 'clear after' }, ...PRESETS.map(([k, l]) => h('span', { key: k, role: 'radio', tabindex: '0', 'aria-checked': preset === k ? 'true' : 'false', class: preset === k ? 'on' : '', onclick: () => onPreset && onPreset(k), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPreset && onPreset(k); } } }, l))),
        expiresLabel ? h('div', { key: 'exp', class: 'ds-g3-mi-hint ds-g3-mi-pad' }, 'clears at ' + expiresLabel) : null,
        ...(custom || emoji ? [h('div', { key: 'clr', role: 'menuitem', tabindex: '0', onclick: () => onCustom && onCustom('', '', 'never'), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCustom && onCustom('', '', 'never'); } } }, '✕ Clear custom status')] : []),
        ...Object.entries(STATUS).map(([k, [n, c]]) => h('div', { key: k, role: 'menuitem', tabindex: '0', class: k === status ? 'ds-g3-on' : '', onclick: () => onStatus && onStatus(k), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStatus && onStatus(k); } } }, h('i', { style: 'background:' + c }), n)));
}
