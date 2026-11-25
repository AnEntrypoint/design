
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { SettingsSection, SettingsRow, SettingsRowToggle, SettingsRowSelect } from './settings-row.js';
import { VadProfileControl } from './vad-profile.js';
import { FOCUSABLE_SEL, trapTabKey } from '../editor-primitives/shared.js';
const h = webjsx.createElement;

let modalKeyHandler = null;
let restoreFocusEl = null;

function devOptions(devices) {
    return (devices || []).map(d => ({ value: d.value, label: d.label }));
}

function sliderRow({ icon, label, min, max, step, value, format, onInput, ariaLabel }) {
    return SettingsRow({
        icon, label,
        description: h('div', { class: 'vx-stg-range-row' },
            h('input', {
                type: 'range', class: 'vx-stg-range', min: String(min), max: String(max), step: String(step),
                value: String(value), 'aria-label': ariaLabel || label,
                onclick: (e) => e.stopPropagation(),
                oninput: onInput ? (e) => onInput(parseFloat(e.target.value)) : null
            }),
            h('span', { class: 'vx-stg-range-val' }, format(value))
        )
    });
}

export function VoiceSettingsModal({ open = false, mode = 'ptt', inputId, outputId, inputDevices = [], outputDevices = [], vadThreshold = 0.5, rnnoise = false, autoGain = false, forceTurn = false, bitrate = 64, volume, vadProfile, vadProfiles = [], onVadProfile, onChange, onSave, onCancel, onClose } = {}) {
    if (!open) return null;
    const patch = (p) => onChange && onChange(p);
    const modes = ['ptt', 'vad'];
    const vol = volume == null ? 1 : volume;
    if (!restoreFocusEl && typeof document !== 'undefined') restoreFocusEl = document.activeElement;
    const trigger = restoreFocusEl;
    let detach = null;
    const finish = (fn) => () => {
        if (detach) { detach(); detach = null; }
        restoreFocusEl = null;
        if (trigger && trigger.focus && document.contains(trigger)) trigger.focus();
        fn && fn();
    };
    const close = finish(onClose);
    return h('div', {
        class: 'vx-modal-backdrop',
        onclick: (e) => { if (e.target === e.currentTarget) close(); },
        ref: (el) => {
            if (!el) return;
            const dialog = el.querySelector('.vx-modal');
            const onKey = (e) => {
                if (!document.contains(el)) { if (detach) { detach(); detach = null; } return; }
                if (e.key === 'Escape') { e.preventDefault(); close(); return; }
                if (dialog) trapTabKey(dialog, e);
            };
            if (modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler);
            document.addEventListener('keydown', onKey);
            modalKeyHandler = onKey;
            detach = () => {
                document.removeEventListener('keydown', onKey);
                if (modalKeyHandler === onKey) modalKeyHandler = null;
            };
            setTimeout(() => {
                const target = dialog && dialog.querySelector(FOCUSABLE_SEL);
                if (target) target.focus();
                else if (dialog) dialog.focus();
            }, 0);
        }
    },
        h('div', { class: 'vx-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Voice settings', tabindex: '-1' },
            h('div', { class: 'vx-modal-head' },
                h('h2', { class: 'vx-modal-title' }, 'Voice settings'),
                h('button', { type: 'button', class: 'vx-modal-x', 'aria-label': 'close', onclick: close }, Icon('x'))
            ),
            h('div', { class: 'vx-modal-body' },
                SettingsSection({ title: 'Mode', children:
                    h('div', { class: 'vx-segmented', role: 'group', 'aria-label': 'mode' },
                        ...modes.map(m => h('button', {
                            key: 'm-' + m, type: 'button',
                            class: 'vx-seg' + (m === mode ? ' vx-seg-on' : ''),
                            'aria-pressed': m === mode ? 'true' : 'false',
                            onclick: () => patch({ mode: m })
                        }, m.toUpperCase())))
                }),
                SettingsSection({ title: 'Devices', children: [
                    SettingsRowSelect({
                        icon: 'mic', label: 'Input device', ariaLabel: 'input device',
                        value: inputId, options: devOptions(inputDevices),
                        onChange: (v) => patch({ inputId: v })
                    }),
                    SettingsRowSelect({
                        icon: 'speaker', label: 'Output device', ariaLabel: 'output device',
                        value: outputId, options: devOptions(outputDevices),
                        onChange: (v) => patch({ outputId: v })
                    })
                ]}),
                mode === 'vad' ? SettingsSection({ title: 'Voice activity', children:
                    sliderRow({
                        icon: 'blank', label: 'VAD threshold', min: 0, max: 1, step: 0.01, value: vadThreshold,
                        format: (v) => Math.round((Number(v) || 0) * 100) + '%',
                        onInput: (v) => patch({ vadThreshold: v }), ariaLabel: 'VAD threshold'
                    })
                }) : null,
                vadProfiles.length ? SettingsSection({ title: 'Voice thread clip filter', children: VadProfileControl({ value: vadProfile, profiles: vadProfiles, variant: 'vx', onChange: onVadProfile }) }) : null,
                SettingsSection({ title: 'Processing', children: [
                    SettingsRowToggle({ icon: 'blank', label: 'RNNoise', checked: rnnoise, onToggle: (v) => patch({ rnnoise: v }) }),
                    SettingsRowToggle({ icon: 'blank', label: 'Auto gain', checked: autoGain, onToggle: (v) => patch({ autoGain: v }) }),
                    SettingsRowToggle({ icon: 'blank', label: 'Force TURN', checked: forceTurn, onToggle: (v) => patch({ forceTurn: v }) })
                ]}),
                SettingsSection({ title: 'Bandwidth & volume', children: [
                    sliderRow({
                        icon: 'blank', label: 'Bitrate', min: 8, max: 256, step: 8, value: bitrate,
                        format: (v) => (Number(v) || 0) + ' kbps',
                        onInput: (v) => patch({ bitrate: Math.round(v) }), ariaLabel: 'bitrate'
                    }),
                    sliderRow({
                        icon: 'blank', label: 'Master volume', min: 0, max: 1, step: 0.01, value: vol,
                        format: (v) => Math.round(v * 100) + '%',
                        onInput: (v) => patch({ volume: v }), ariaLabel: 'master volume'
                    })
                ]}),
                SettingsSection({ title: 'How voice rooms connect', children: [
                    SettingsRow({
                        icon: 'blank', label: 'One relay hub per room',
                        description: 'One browser acts as the hub: the first one in the room keeps the role, and if it drops the others agree on a replacement (best measured uplink first) within about 5 seconds. Everyone else sends one stream to the hub (about 70 kbps) and hears the others through it. The hub sends every listener its own voice plus a relayed copy of each other speaker. Measured with everyone talking at once, the hub uploads about 0.07 Mbps with 2 people, 0.23 with 3, 0.5 with 4 and 0.8 to 1.0 with 5; 1.3 with 6 is an estimate. A hub on a 1 Mbps uplink saturates at 5 to 6 people all talking together. With one person talking at a time the hub needs only about 0.05 Mbps per extra listener.'
                    })
                ]})
            ),
            h('div', { class: 'vx-modal-foot' },
                h('button', { type: 'button', class: 'vx-btn', onclick: finish(onCancel) }, 'Cancel'),
                h('button', { type: 'button', class: 'vx-btn vx-btn-primary', onclick: finish(onSave) }, 'Save')
            )
        )
    );
}
