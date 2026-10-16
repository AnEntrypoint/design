import * as webjsx from '../../../vendor/webjsx/index.js';
import { Panel } from '../content.js';
import { Btn, Icon } from '../shell.js';

const h = webjsx.createElement;

export const section = (title, ...children) => Panel({ title, children: children.flat().filter(Boolean) });
export const noteAlert = (note) => note ? h('div', { class: 'ds-alert ds-alert-' + note.kind, role: 'alert' },
    h('span', { class: 'ds-alert-icon' }, '!'),
    h('div', { class: 'ds-alert-content' }, note.msg)) : null;
export const refreshBtn = (onClick, busy) => Btn({ children: busy ? 'refreshing…' : [Icon('refresh'), ' refresh'], disabled: !!busy, onClick, 'aria-label': 'refresh' });
export const liveRegion = (msg) => h('div', { class: 'fd-sr-live', role: 'status', 'aria-live': 'polite' }, msg || '');
export const trunc = (s, n = 90) => { const str = String(s || ''); return str.length > n ? { text: str.slice(0, n) + '…', title: str } : { text: str, title: null }; };
export const TRUNC_TITLE = 60;
export const TRUNC_SUB = 80;
export const TRUNC_OUTPUT = 70;
export const TRUNC_DESC = 90;
export const TRUNC_PROMPT = 50;
export const truncSpan = (s, n) => { const t = trunc(s, n); return h('span', { title: t.title }, t.text); };
export const truncJson = (v, n = TRUNC_TITLE) => truncSpan(JSON.stringify(v), n);
