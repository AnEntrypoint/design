import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
const h = webjsx.createElement;
const applyDiff = webjsx.applyDiff;

let fdPageRootElementDefined = false;
function ensureFdPageRootElementDefined() {
    if (fdPageRootElementDefined || typeof customElements === 'undefined') return;
    if (customElements.get('fd-page-root')) { fdPageRootElementDefined = true; return; }
    customElements.define('fd-page-root', class extends HTMLElement {
        disconnectedCallback() { if (this._fdOnDisconnect) this._fdOnDisconnect(); }
    });
    fdPageRootElementDefined = true;
}
ensureFdPageRootElementDefined();

export async function api(path, opts = {}) {
    const res = await fetch(path, {
        headers: { 'content-type': 'application/json', ...(opts.headers || {}) },
        ...opts,
        body: opts.body != null && typeof opts.body !== 'string' ? JSON.stringify(opts.body) : opts.body,
    });
    let json = null;
    const text = await res.text();
    try { json = text ? JSON.parse(text) : null; } catch { json = { _raw: text }; }
    if (!res.ok) {
        const msg = (json && (json.error?.message || json.error || json.message)) || text || ('HTTP ' + res.status);
        const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        err.status = res.status;
        err.body = json;
        throw err;
    }
    return json;
}

export function makePage(setup, { initial = {} } = {}) {
    return function pageRenderer(host) {
        const state = { loading: true, error: null, ...initial };
        const timers = [];
        const cleanupFns = [];
        let elRef = null;
        let render = () => h('div', {});
        const ctx = {
            state, host, api,
            set(patch) { Object.assign(state, patch); ctx.rerender(); },
            failLoad(e) { ctx.set({ loading: false, error: e }); },
            failError(e) { ctx.set({ error: e }); },
            failNote(e, extra = {}) { ctx.set({ note: { kind: 'error', msg: String(e.message || e) }, ...extra }); },
            rerender() { if (elRef) { try { applyDiff(elRef, wrap()); } catch (e) { console.warn('[freddie page rerender]', e); } } },
            interval(fn, ms) { const id = setInterval(fn, ms); timers.push(id); return id; },
            onCleanup(fn) { cleanupFns.push(fn); },
            cleanup() {
                for (const id of timers) clearInterval(id); timers.length = 0;
                for (const fn of cleanupFns) { try { fn(); } catch (e) { console.warn('[freddie page cleanup]', e); } }
                cleanupFns.length = 0;
            },
        };
        function wrap() {
            let body;
            try { body = render(); }
            catch (e) {
                body = h('div', { class: 'ds-alert ds-alert-error', role: 'alert' },
                    h('span', { class: 'ds-alert-icon' }, Icon('x')),
                    h('div', { class: 'ds-alert-content' },
                        h('div', { class: 'ds-alert-title' }, 'page render error'),
                        h('pre', { class: 'fd-pre' }, String(e && e.stack || e))));
            }
            return h('div', { class: 'fd-page-inner' }, ...(Array.isArray(body) ? body : [body]));
        }
        const ref = (el) => {
            if (!el) { ctx.cleanup(); return; }
            if (elRef === el) return;
            elRef = el;
            el._fdOnDisconnect = () => ctx.cleanup();
            const r = setup(ctx);
            if (typeof r === 'function') render = r;
            ctx.rerender();
            Promise.resolve().then(() => ctx.rerender());
        };
        return h('fd-page-root', { class: 'fd-page-root', ref });
    };
}

export function loadingState(label = 'loading…') {
    return h('div', { class: 'fd-loading', role: 'status', 'aria-live': 'polite' },
        h('div', { class: 'ds-spinner tone-accent', 'aria-hidden': 'true' },
            h('span'), h('span'), h('span')),
        h('span', { class: 'dim' }, label));
}

export function errorState(err, onRetry) {
    const msg = String(err && err.message || err);
    return h('div', { class: 'ds-alert ds-alert-error', role: 'alert' },
        h('span', { class: 'ds-alert-icon' }, Icon('x')),
        h('div', { class: 'ds-alert-content' },
            h('div', { class: 'ds-alert-title' }, 'failed to load'),
            h('div', { class: 'ds-alert-message' }, msg),
            onRetry ? h('button', { type: 'button', class: 'btn ds-alert-retry', onclick: onRetry }, 'retry') : null));
}

export function emptyState(text = 'nothing here yet', glyph = Icon('circle')) {
    return h('div', { class: 'fd-empty', role: 'status' },
        h('div', { class: 'fd-empty-glyph', 'aria-hidden': 'true' }, glyph),
        h('div', { class: 'dim' }, text));
}

export function refreshError(err) {
    if (!err) return null;
    return h('div', { class: 'ds-alert ds-alert-warn', role: 'status', 'aria-live': 'polite' },
        h('span', { class: 'ds-alert-icon' }, '!'),
        h('div', { class: 'ds-alert-content' }, 'refresh failed: ' + String(err.message || err)));
}
