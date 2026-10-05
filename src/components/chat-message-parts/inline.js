import * as webjsx from '../../../vendor/webjsx/index.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

export function safeUrl(url) {
    const s = String(url == null ? '' : url).trim();
    if (!s) return null;
    if (/^(\/|\.|#|\?)/.test(s) || s.startsWith('//')) return s;
    const scheme = (s.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/) || [])[1];
    if (!scheme) return s;
    return /^(https?|mailto|tel)$/i.test(scheme) ? s : null;
}

function spoilerToggle(e) {
    e.currentTarget.classList.add('is-revealed');
}
function renderSpoilerSpan(key, text) {
    return h('span', {
        key, class: 'chat-spoiler', tabindex: '0', role: 'button',
        'aria-label': 'spoiler, click to reveal',
        onclick: spoilerToggle,
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spoilerToggle(e); } },
    }, text);
}

export function renderInline(text) {
    if (text == null) return [];
    const out = [];
    const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\|\|([^|]+)\|\|)/g;
    let last = 0; let m; let i = 0;
    const push = (n) => out.push(n);
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) push(h('span', { key: 's' + i + 'a' }, text.slice(last, m.index)));
        if (m[2] != null) push(h('strong', { key: 's' + i }, m[2]));
        else if (m[3] != null) push(h('em', { key: 's' + i }, m[3]));
        else if (m[4] != null) push(h('code', { key: 's' + i, class: 'chat-tick' }, m[4]));
        else if (m[5] != null) {
            const safe = safeUrl(m[6]);
            if (safe) push(h('a', { key: 's' + i, href: safe, target: '_blank', rel: 'noopener noreferrer' }, m[5]));
            else push(h('span', { key: 's' + i }, m[5]));
        }
        else if (m[7] != null) push(renderSpoilerSpan('s' + i, m[7]));
        last = m.index + m[0].length; i += 1;
    }
    if (last < text.length) push(h('span', { key: 's' + i + 'a' }, text.slice(last)));
    return out;
}

const FILE_ICONS = { pdf: 'file-pdf', zip: 'file-zip', tar: 'file-zip', gz: 'file-zip', mp4: 'file-video', mov: 'file-video', mp3: 'file-audio', wav: 'file-audio', csv: 'file-sheet', json: 'file-code', js: 'file-code', ts: 'file-code', md: 'file-text', txt: 'file-text' };
export function fileIconName(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    return FILE_ICONS[ext] || 'file';
}

function execCommandCopy(text) {
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select();
    document.execCommand('copy'); document.body.removeChild(t);
}
export function copyToClipboardWithFeedback(text, btn) {
    const done = () => {
        btn.textContent = 'copied';
        btn.classList.add('is-copied');
        setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('is-copied'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => { attempt(() => { execCommandCopy(text); done(); }); });
    } else {
        attempt(() => { execCommandCopy(text); done(); });
    }
}

export function injectCodeCopy(container) {
    if (!container) return;
    container.querySelectorAll('pre').forEach((pre) => {
        if (pre.dataset.copyWired === '1') return;
        pre.dataset.copyWired = '1';
        const shell = document.createElement('div');
        shell.className = 'chat-code-block';
        pre.parentNode.insertBefore(shell, pre);
        shell.appendChild(pre);
        const codeEl = pre.querySelector('code');
        const langCls = codeEl && (codeEl.className || '').match(/(?:language|lang)-([a-z0-9+#]+)/i);
        if (langCls && langCls[1]) {
            const lang = document.createElement('span');
            lang.className = 'chat-code-lang';
            lang.setAttribute('aria-hidden', 'true');
            lang.textContent = langCls[1];
            shell.appendChild(lang);
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-code-copy';
        btn.setAttribute('aria-label', 'copy code');
        btn.textContent = 'copy';
        btn.addEventListener('click', () => copyToClipboardWithFeedback(pre.innerText, btn));
        shell.appendChild(btn);
    });
}
