import * as webjsx from '../../../vendor/webjsx/index.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

export function pre(obj) {
    return h('pre', { class: 'fd-pre' }, typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
}

export function form(opts) {
    const { fields = [], submit = 'submit', onSubmit } = opts;
    return h('form', { class: 'row-form', onsubmit: (ev) => { ev.preventDefault(); onSubmit && onSubmit(ev); } },
        ...fields.map(f => f.kind === 'textarea'
            ? h('textarea', { name: f.name, placeholder: f.placeholder || '', rows: f.rows || 4 })
            : h('input', { name: f.name, type: f.type || 'text', placeholder: f.placeholder || '', value: f.value || '', required: f.required ? 'true' : null })),
        h('button', { type: 'submit', class: 'btn-primary' }, submit));
}

const SKILL_SLUG_LABELS = {
    transcribe: 'transcribe',
    summarize:  'summarize',
    translate:  'translate',
    extract:    'extract',
    classify:   'classify',
};

export function skillLabel(input) {
    if (input && typeof input === 'object') {
        if (input.shortName) return input.shortName;
        const n = input.name || '';
        return n.replace(/^gm:/, '').replace(/^software-development$/, 'software dev').replace(/-/g, ' ');
    }
    return SKILL_SLUG_LABELS[input] || input;
}

const RECENT_KEY = 'fd_recent_cwds';
const RECENT_CAP = 5;

export function getRecentPaths() {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
}

export function saveRecentPath(path) {
    if (typeof localStorage === 'undefined' || !path) return;
    const list = getRecentPaths().filter(p => p !== path);
    list.unshift(path);
    attempt(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_CAP))); });
}

export function renderChatMessages(messages = [], opts = {}) {
    return import('../chat.js').then(({ ChatMessage }) =>
        messages.map((m, i) => ChatMessage({ ...m, key: m.key != null ? m.key : i, ...opts }))
    );
}
