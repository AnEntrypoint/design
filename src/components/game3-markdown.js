import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

const INLINE = /(`[^`\n]+`|\*\*.+?\*\*|__.+?__|\*.+?\*|(?<=^|\s)_.+?_(?=\s|$)|~~.+?~~|\|\|.+?\|\||https?:\/\/[^\s<]+|(?<=^|\s)@[\w.\-']+)/g;

const copyBlock = (e) => {
    const el = e.currentTarget;
    if (navigator.clipboard) navigator.clipboard.writeText(el.innerText).catch(() => {});
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 900);
};

function token(t, key) {
    if (t[0] === '`') return h('code', { key }, t.slice(1, -1));
    if (t.startsWith('**')) return h('b', { key }, ...inline(t.slice(2, -2), key));
    if (t.startsWith('__')) return h('u', { key }, ...inline(t.slice(2, -2), key));
    if (t[0] === '*' || t[0] === '_') return h('i', { key }, ...inline(t.slice(1, -1), key));
    if (t.startsWith('~~')) return h('s', { key }, ...inline(t.slice(2, -2), key));
    if (t.startsWith('||')) return h('span', { key, class: 'ds-g3-spoil', role: 'button', tabindex: '0', onclick: (e) => e.currentTarget.classList.add('shown') }, ...inline(t.slice(2, -2), key));
    if (t.startsWith('http')) return h('a', { key, href: t, target: '_blank', rel: 'noopener noreferrer' }, t);
    return h('span', { key, class: 'ds-g3-mention' }, t);
}

function inline(text, key) {
    const out = [];
    let last = 0;
    let i = 0;
    for (const m of text.matchAll(INLINE)) {
        if (m.index > last) out.push(text.slice(last, m.index));
        out.push(token(m[0], key + '.' + i++));
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

function line(l, key) {
    if (l.startsWith('> ')) return h('div', { key, class: 'ds-g3-quote' }, ...inline(l.slice(2), key));
    if (l.startsWith('### ')) return h('h3', { key }, ...inline(l.slice(4), key));
    if (l.startsWith('## ')) return h('h2', { key }, ...inline(l.slice(3), key));
    if (l.startsWith('# ')) return h('h1', { key }, ...inline(l.slice(2), key));
    if (/^[-*] /.test(l)) return h('div', { key, class: 'ds-g3-li' }, '\u2022 ', ...inline(l.slice(2), key));
    return inline(l, key);
}

export function renderMarkdown(raw) {
    const parts = String(raw || '').split(/```([\s\S]+?)```[ \t]*\n?/g);
    const out = [];
    parts.forEach((part, pi) => {
        if (pi % 2 === 1) {
            out.push(h('pre', { key: 'cb' + pi, class: 'ds-g3-cb', title: 'click to copy', onclick: copyBlock }, part.replace(/^\n/, '')));
            return;
        }
        part.split('\n').forEach((l, li) => {
            if (li > 0) out.push('\n');
            const node = line(l, 'l' + pi + '-' + li);
            if (Array.isArray(node)) out.push(...node); else out.push(node);
        });
    });
    return out;
}
