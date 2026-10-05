import { escapeHtml } from '../markdown.js';
export const escape = escapeHtml;

export function inlineMd(s) {
    return s
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function slugify(s) {
    return String(s || '').trim().toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
}

export function renderMarkdown(md) {
    const lines = String(md || '').split('\n');
    const out = [];
    let inCode = false, inList = false, inRawHtml = false;
    for (const line of lines) {
        if (line.trim() === '```html') { if (!inCode) { inRawHtml = true; continue; } }
        if (line.startsWith('```')) {
            if (inRawHtml) { inRawHtml = false; continue; }
            if (inCode) { out.push('</pre>'); inCode = false; } else { out.push('<pre>'); inCode = true; }
            continue;
        }
        if (inRawHtml) { out.push(line); continue; }
        if (inCode) { out.push(escape(line)); continue; }
        if (line.startsWith('# ')) { const t = line.slice(2); out.push(`<h1 id="${slugify(t)}">${escape(t)}</h1>`); }
        else if (line.startsWith('## ')) { const t = line.slice(3); out.push(`<h2 id="${slugify(t)}">${escape(t)}</h2>`); }
        else if (line.startsWith('### ')) { const t = line.slice(4); out.push(`<h3 id="${slugify(t)}">${escape(t)}</h3>`); }
        else if (line.startsWith('- ')) { if (!inList) { out.push('<ul>'); inList = true; } out.push(`<li>${inlineMd(escape(line.slice(2)))}</li>`); }
        else { if (inList) { out.push('</ul>'); inList = false; } if (line.trim()) out.push(`<p>${inlineMd(escape(line))}</p>`); }
    }
    if (inList) out.push('</ul>');
    if (inCode) out.push('</pre>');
    return out.join('\n');
}

export function joinHref(basePath, href) {
    if (!href) return '#';
    const h = String(href);
    if (/^([a-z]+:|#|\/\/)/i.test(h)) return h;
    if (!basePath) return h;
    const base = basePath.replace(/\/+$/, '');
    if (h.startsWith('/')) return base + h;
    return base + '/' + h.replace(/^\.?\//, '');
}
