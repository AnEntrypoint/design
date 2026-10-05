import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function flashComposerNote(composerEl, text) {
    if (!composerEl) return;
    let note = composerEl.querySelector('.chat-composer-note');
    if (!note) {
        note = document.createElement('div');
        note.className = 'chat-composer-note';
        note.setAttribute('role', 'status');
        note.setAttribute('aria-live', 'polite');
        composerEl.appendChild(note);
    }
    note._dsNoteQueue = note._dsNoteQueue || [];
    note._dsNoteQueue.push(text);
    if (note._dsNoteTimer) return;
    const showNext = () => {
        const next = note._dsNoteQueue.shift();
        if (next === undefined) { note.remove(); note._dsNoteTimer = null; return; }
        note.textContent = next;
        note._dsNoteTimer = setTimeout(showNext, 2600);
    };
    showNext();
}

let _coarsePointerCache = null;
export function isCoarsePointer() {
    if (_coarsePointerCache != null) return _coarsePointerCache;
    _coarsePointerCache = !!(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    return _coarsePointerCache;
}

function fmtElapsedMs(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ':' + String(s).padStart(2, '0');
}

export function ChatComposerElapsed({ streamingSince }) {
    return h('span', {
        class: 'chat-composer-elapsed', role: 'status', 'aria-live': 'off',
        ref: (el) => {
            if (!el) return;
            if (el._dsElapsedTimer && el._dsElapsedSince === streamingSince) return;
            if (el._dsElapsedTimer) clearInterval(el._dsElapsedTimer);
            el._dsElapsedSince = streamingSince;
            const tick = () => { el.textContent = fmtElapsedMs(Date.now() - streamingSince); };
            tick();
            el._dsElapsedTimer = setInterval(tick, 1000);
        },
    });
}

export function TypingIndicator({ users } = {}) {
    const list = (users || []).filter(Boolean);
    if (!list.length) return null;
    const shown = list.slice(0, 5);
    const avatars = h('div', { class: 'chat-typing-avatars' },
        ...shown.map((u, i) => h('span', {
            key: 'ta' + (u.id || i), class: 'chat-typing-avatar',
            style: u.color ? `background:${u.color}` : null,
        }, u.avatar || (u.name || '?').slice(0, 1).toUpperCase())));
    let label;
    if (list.length === 1) label = `${list[0].name || 'Someone'} is typing…`;
    else if (list.length < 5) {
        const names = list.map((u) => u.name || 'Someone');
        label = `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are typing…`;
    } else label = 'Several people are typing…';
    return h('div', { class: 'chat-typing-bar', role: 'status', 'aria-live': 'polite' },
        avatars,
        h('span', { class: 'chat-typing-bar-label' }, label));
}

export function updateDetectedBadge(composerEl, text, detectAttachment) {
    if (!composerEl) return;
    let badge = composerEl.querySelector('.chat-composer-detected-badge');
    const detected = (text && detectAttachment) ? detectAttachment(text) : null;
    if (!detected) {
        if (badge) badge.remove();
        composerEl._dsDetectedId = null;
        return;
    }
    if (composerEl._dsDismissedId === detected.id) return;
    if (composerEl._dsDetectedId === detected.id && badge) return;
    composerEl._dsDetectedId = detected.id;
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'chat-composer-detected-badge';
        badge.setAttribute('role', 'status');
        composerEl.insertBefore(badge, composerEl.firstChild);
    }
    badge.textContent = '';
    const label = document.createElement('span');
    label.className = 'chat-composer-detected-label';
    label.textContent = detected.label;
    badge.appendChild(label);
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'chat-composer-detected-dismiss';
    dismiss.setAttribute('aria-label', 'dismiss ' + detected.label);
    dismiss.textContent = 'x';
    dismiss.onclick = (e) => { e.preventDefault(); composerEl._dsDismissedId = detected.id; badge.remove(); };
    badge.appendChild(dismiss);
}
