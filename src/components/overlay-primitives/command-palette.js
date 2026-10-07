
import * as webjsx from '../../../vendor/webjsx/index.js';
import { trapTab } from './floating.js';
const h = webjsx.createElement;

export function CommandPalette({ open, items = [], onSelect, onClose } = {}) {
    if (!open) return null;
    const list = Array.isArray(items) ? items : [];
    const labelOf = (it) => String(it.label || it.title || it.name || '');
    let store = null;
    const text = () => (store ? store.text : '');
    const setText = (v) => { if (store) store.text = v; };
    const activeIdx = () => (store ? store.active : 0);
    const setActive = (v) => { if (store) store.active = v; };

    const matches = () => {
        const q = text().trim().toLowerCase();
        return q ? list.filter(it => labelOf(it).toLowerCase().includes(q)) : list.slice();
    };

    const rowsFor = (filtered) => {
        const out = [];
        let lastGroup = null, flatIdx = 0;
        const active = activeIdx();
        for (const it of filtered) {
            const grp = it.group != null ? String(it.group) : null;
            if (grp && grp !== lastGroup) {
                out.push(h('div', { class: 'ov-cmd-group', role: 'presentation' }, grp));
                lastGroup = grp;
            }
            const idx = flatIdx++;
            const glyph = it.icon != null ? it.icon : (it.glyph != null ? it.glyph : null);
            const hint = it.hint != null ? it.hint : (it.shortcut != null ? it.shortcut : null);
            out.push(h('button', {
                type: 'button', role: 'option',
                id: 'ov-cmd-item-' + idx,
                'data-idx': String(idx),
                'aria-selected': idx === active ? 'true' : 'false',
                class: 'ov-cmd-item' + (idx === active ? ' is-active' : ''),
                onclick: () => choose(it),
                onmousemove: () => { if (activeIdx() !== idx) { setActive(idx); renderInner(); } },
            },
                glyph != null ? h('span', { class: 'ov-cmd-glyph', 'aria-hidden': 'true' }, glyph) : null,
                h('span', { class: 'ov-cmd-label' }, labelOf(it)),
                hint != null ? h('span', { class: 'ov-cmd-hint' }, hint) : null
            ));
        }
        return out;
    };

    let rootEl = null, inputEl = null, listEl = null, flat = [];
    const prevFocus = (typeof document !== 'undefined') ? document.activeElement : null;
    const close = () => { if (store && store.prevFocus && store.prevFocus.focus && document.contains(store.prevFocus)) store.prevFocus.focus(); if (onClose) onClose(); };
    const choose = (it) => { if (it && onSelect) onSelect(it); };

    const renderInner = () => {
        if (!listEl || !store) return;
        const filtered = matches();
        flat = filtered;
        if (activeIdx() >= filtered.length) setActive(Math.max(0, filtered.length - 1));
        const active = activeIdx();
        webjsx.applyDiff(listEl, h('div', { class: 'ov-cmd-list-inner' },
            filtered.length ? rowsFor(filtered) : h('div', { class: 'ov-cmd-empty' }, list.length ? 'No matching commands' : 'No commands available')));
        const sel = listEl.querySelector('.ov-cmd-item.is-active');
        if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
        if (inputEl) inputEl.setAttribute('aria-activedescendant', filtered.length ? 'ov-cmd-item-' + active : '');
    };

    const onKey = (e) => {
        if (!store) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); if (flat.length) { setActive((activeIdx() + 1) % flat.length); renderInner(); } }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (flat.length) { setActive((activeIdx() - 1 + flat.length) % flat.length); renderInner(); } }
        else if (e.key === 'Enter') { e.preventDefault(); if (flat[activeIdx()]) choose(flat[activeIdx()]); }
        else if (e.key === 'Tab') { const root = e.currentTarget; if (root) trapTab(root, e, true); }
    };

    return h('div', {
        class: 'ov-cmd-backdrop', role: 'presentation',
        ref: (el) => {
            if (!el) return;
            if (!el._ovCmd) el._ovCmd = { text: '', active: 0, prevFocus };
            store = el._ovCmd;
            if (el._ovCmdBound) return; el._ovCmdBound = true; rootEl = el;
            el.addEventListener('mousedown', (e) => {
                const panel = el.querySelector('.ov-cmd-panel');
                if (panel && !panel.contains(e.target)) close();
            });
        },
    },
        h('div', { class: 'ov-cmd-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Command palette', onkeydown: onKey },
            h('input', {
                type: 'text', class: 'ov-cmd-input', placeholder: 'Type a command…',
                'aria-label': 'command search',
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': 'true',
                'aria-controls': 'ov-cmd-list',
                'aria-activedescendant': '',
                oninput: (e) => { setText(e.target.value); setActive(0); renderInner(); },
                ref: (el) => {
                    if (!el) return;
                    inputEl = el;
                    if (store && el.value !== store.text) el.value = store.text;
                    if (el._ovCmdIn) return; el._ovCmdIn = true;
                    setTimeout(() => el.focus(), 0);
                },
            }),
            h('div', { class: 'ov-cmd-list', id: 'ov-cmd-list', role: 'listbox',
                ref: (el) => { if (!el) return; listEl = el; queueMicrotask(renderInner); } })
        )
    );
}
