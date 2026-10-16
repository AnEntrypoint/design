import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { EmojiPicker, CommandPalette } from '../overlay-primitives.js';
import { extractAtQuery, filterFileEntries, buildAtInsertText } from '../../file-mention.js';
import { flashComposerNote, isCoarsePointer, ChatComposerElapsed, updateDetectedBadge } from './composer-affordances.js';
import { attempt } from '../../best-effort.js';

const h = webjsx.createElement;

const EMOJI_TRIGGER_RE = /(?:^|\s)(:([a-zA-Z0-9_+-]{0,24}))$/;

export function ChatComposer({ value, onInput, onSend, onEmoji, onCancel, busy, placeholder = 'message…', disabled, disabledReason, label, context, onPasteFiles, onDropFiles, onAttach, streamingSince, detectAttachment, mentionFiles }) {
    let taEl = null;
    let attachEl = null;
    const attachRef = (el) => { if (el) attachEl = el; };
    const send = () => {
        const v = ((taEl && taEl.value) || value || '').trim();
        if (!v || disabled) return;
        if (onSend) onSend(v);
    };
    const triggerMatch = EMOJI_TRIGGER_RE.exec(value || '');
    const caretPos = taEl ? taEl.selectionStart : (value || '').length;
    const atQuery = mentionFiles ? extractAtQuery((value || '').slice(0, caretPos)) : null;
    const anchorEl = taEl || (typeof document !== 'undefined' ? document.querySelector('.chat-composer textarea') : null);
    const insertEmoji = (ch) => {
        const v = (taEl && taEl.value) || value || '';
        const m = EMOJI_TRIGGER_RE.exec(v);
        const next = m ? (v.slice(0, m.index) + (m[0].startsWith(':') ? '' : v[m.index]) + ch + ' ') : (v + ch);
        if (onInput) onInput(next);
        if (taEl) {
            attempt(() => { if (!sessionStorage.getItem('ds.composer.undoNoteShown')) { sessionStorage.setItem('ds.composer.undoNoteShown', '1'); flashComposerNote(taEl.closest('.chat-composer'), 'inserted. Undo history does not include this insert'); } });
            taEl.value = next;
            taEl.focus();
            taEl.selectionStart = taEl.selectionEnd = next.length;
        }
    };
    let autoGrowScheduled = false;
    const autoGrow = (e) => {
        const ta = e.target;
        if (onInput) onInput(ta.value);
        if (detectAttachment) updateDetectedBadge(ta.closest('.chat-composer'), ta.value, detectAttachment);
        if (!autoGrowScheduled) {
            autoGrowScheduled = true;
            requestAnimationFrame(() => {
                ta.style.height = 'auto';
                const cap = parseFloat(getComputedStyle(ta).maxHeight) || 200;
                ta.style.height = Math.min(ta.scrollHeight, cap) + 'px';
                autoGrowScheduled = false;
            });
        }
    };
    const taRef = (el) => {
        if (!el) return;
        taEl = el;
        const next = value || '';
        if (el.value !== next) el.value = next;
        el.style.height = 'auto';
        const cap = parseFloat(getComputedStyle(el).maxHeight) || 200;
        el.style.height = Math.min(el.scrollHeight, cap) + 'px';
        if (detectAttachment) updateDetectedBadge(el.closest('.chat-composer'), next, detectAttachment);
    };
    const ctxBits = ((context && context.bits) ? context.bits : [])
        .map((b) => {
            if (b == null) return null;
            if (typeof b === 'object') {
                const text = b.text || b.label || '';
                return text ? { text, onClick: b.onClick, title: b.title } : null;
            }
            const text = String(b);
            return text ? { text } : null;
        })
        .filter(Boolean);
    const hasBitClicks = ctxBits.some((b) => b.onClick);
    let contextLine = null;
    if (ctxBits.length && hasBitClicks) {
        const kids = [];
        ctxBits.forEach((b, i) => {
            if (i) kids.push(h('span', { key: 'csep' + i, class: 'chat-composer-context-sep', 'aria-hidden': 'true' }, ' · '));
            if (b.onClick) kids.push(h('button', {
                key: 'cbit' + i, type: 'button', class: 'chat-composer-context-bit',
                title: b.title || null, 'aria-label': b.title || b.text,
                onclick: (e) => { e.preventDefault(); b.onClick(e); },
            }, b.text));
            else kids.push(h('span', { key: 'cbit' + i, class: 'chat-composer-context-text' }, b.text));
        });
        contextLine = h('div', { class: 'chat-composer-context', role: 'group', 'aria-label': 'active session: ' + ctxBits.map((b) => b.text).join(', ') }, ...kids);
    } else if (ctxBits.length) {
        const joined = ctxBits.map((b) => b.text).join(' · ');
        contextLine = h(context.onClick ? 'button' : 'div', {
            class: 'chat-composer-context', type: context.onClick ? 'button' : null,
            'aria-label': context.onClick ? ('change target: ' + joined) : null,
            onclick: context.onClick ? (e) => { e.preventDefault(); context.onClick(e); } : null,
        }, joined);
    }
    const hasDraft = !!(value && value.trim());
    const anchorRect = (anchorEl && anchorEl.getBoundingClientRect) ? anchorEl.getBoundingClientRect() : null;
    const vvWidth = (typeof window !== 'undefined')
        ? ((window.visualViewport && window.visualViewport.width) || window.innerWidth)
        : 0;
    const triggerPicker = triggerMatch ? EmojiPicker({
        open: true,
        anchorX: anchorRect ? Math.max(0, Math.min(anchorRect.left, vvWidth - 280)) : 0,
        anchorY: anchorRect ? Math.max(8, anchorRect.top - 8) : 0,
        query: triggerMatch[2] || '',
        onSelect: (ch) => insertEmoji(ch),
        onClose: () => { if (taEl) { const v = taEl.value.replace(EMOJI_TRIGGER_RE, (full, tail) => full.slice(0, full.length - tail.length)); if (onInput) onInput(v); taEl.value = v; taEl.focus(); } },
    }) : null;
    const insertMention = (entry) => {
        const v = (taEl && taEl.value) || value || '';
        if (!atQuery) return;
        const { text: insertText, cursorOffset } = buildAtInsertText(entry.path, entry.isDir);
        const next = v.slice(0, atQuery.start) + insertText + v.slice(caretPos);
        if (onInput) onInput(next);
        if (taEl) {
            taEl.value = next;
            taEl.focus();
            const pos = atQuery.start + cursorOffset;
            taEl.selectionStart = taEl.selectionEnd = pos;
        }
    };
    const mentionEntries = atQuery ? filterFileEntries(mentionFiles, atQuery.query) : [];
    const mentionPicker = atQuery ? CommandPalette({
        open: true,
        items: mentionEntries.map((e) => ({ label: e.path, group: null, icon: e.isDir ? Icon('folder', { size: 14 }) : null, _entry: e })),
        onSelect: (it) => insertMention(it._entry),
        onClose: () => { if (taEl) { const v = taEl.value.slice(0, atQuery.start) + taEl.value.slice(caretPos); if (onInput) onInput(v); taEl.value = v; taEl.focus(); taEl.selectionStart = taEl.selectionEnd = atQuery.start; } },
    }) : null;
    return h('div', {
        class: 'chat-composer' + (hasDraft ? ' has-draft' : '') + (disabled ? ' is-disabled' : ''),
        ondragover: (e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); },
        ondragleave: (e) => { e.currentTarget.classList.remove('dragover'); },
        ondrop: (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
            const files = e.dataTransfer && e.dataTransfer.files;
            if (files && files.length) {
                if (onDropFiles) onDropFiles(files);
                else flashComposerNote(e.currentTarget, 'dropped files are not supported here yet');
            }
        },
    },
        contextLine,
        triggerPicker,
        mentionPicker,
        h('textarea', { ref: taRef, placeholder, rows: 1,
            'aria-label': label || (disabled && disabledReason ? 'message input: ' + disabledReason : 'message input'),
            disabled: !!disabled, 'aria-disabled': disabled ? 'true' : null,
            oninput: autoGrow,
            onpaste: (e) => {
                const cd = e.clipboardData;
                if (cd && cd.files && cd.files.length) {
                    e.preventDefault();
                    if (onPasteFiles) onPasteFiles(cd.files);
                    else flashComposerNote(e.currentTarget.closest('.chat-composer'), 'images are not supported yet');
                    return;
                }
                const text = cd && cd.getData ? cd.getData('text/plain') : '';
                if (text && text.length > 2000) {
                    flashComposerNote(e.currentTarget.closest('.chat-composer'), 'pasted ' + text.length + ' characters');
                }
            },
            onkeydown: (e) => {
                if (e.key === 'Escape') {
                    if (!busy) { e.currentTarget.blur(); return; }
                    if (onCancel) { e.preventDefault(); onCancel(e); return; }
                }
                if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229 && !isCoarsePointer()) { e.preventDefault(); send(); }
                if (e.key === ';' && e.ctrlKey) { e.preventDefault(); onEmoji && onEmoji(e); }
            } }),
        disabled ? null : h('div', { class: 'chat-composer-hint' }, isCoarsePointer() ? 'Tap Send to send' : 'Enter to send · Shift+Enter for a new line'),
        (busy && streamingSince) ? ChatComposerElapsed({ streamingSince }) : null,
        h('div', { class: 'chat-composer-toolbar' },
            onAttach ? h('input', { ref: attachRef, type: 'file', multiple: true, class: 'chat-composer-attach-input', tabindex: '-1', 'aria-hidden': 'true',
                onchange: (e) => { const files = e.target.files; if (files && files.length) onAttach(files); e.target.value = ''; } }) : null,
            onAttach ? h('button', { type: 'button', class: 'composer-btn', onclick: (e) => { e.preventDefault(); if (attachEl) attachEl.click(); }, 'aria-label': 'attach file', title: 'attach file' }, Icon('paperclip')) : null,
            onEmoji ? h('button', { type: 'button', class: 'composer-btn', onclick: (e) => { e.preventDefault(); onEmoji(e); }, 'aria-label': 'emoji picker', title: 'emoji picker (Ctrl+;)' }, Icon('smile')) : null,
            busy && onCancel
                ? h('button', { type: 'button', class: 'send cancel', onclick: (e) => { e.preventDefault(); onCancel(e); }, 'aria-label': 'stop generating', title: 'stop generating (Esc)' }, Icon('square'))
                : h('button', { type: 'button', class: 'send', disabled: !!disabled, onclick: send,
                    'aria-label': disabled && disabledReason ? 'send message (' + disabledReason + ')' : 'send message',
                    title: disabled && disabledReason ? 'send message (' + disabledReason + ')' : 'send message (Enter)' }, Icon('arrow-up'))
        )
    );
}
