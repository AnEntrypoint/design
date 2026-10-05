
export function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
}

const LINE_SEP_RE = new RegExp(String.fromCharCode(0x2028), 'g');
const PARA_SEP_RE = new RegExp(String.fromCharCode(0x2029), 'g');

export function escapeJson(obj) {
    return JSON.stringify(obj)
        .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
        .replace(LINE_SEP_RE, '\\u2028').replace(PARA_SEP_RE, '\\u2029');
}
