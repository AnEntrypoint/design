import { register } from './debug.js';

const PRISM_BASE = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0';
const LANGS = ['markup', 'css', 'clike', 'javascript', 'jsx', 'tsx', 'typescript', 'json', 'bash', 'python'];
let _prism = null;
let _stats = { highlights: 0, errors: 0 };

function injectScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.async = false;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('script failed: ' + src));
        document.head.appendChild(s);
    });
}

let _loadPromise = null;
export function ensurePrism() {
    if (_prism) return Promise.resolve(_prism);
    if (_loadPromise) return _loadPromise;
    _loadPromise = (async () => {
        if (!window.Prism) {
            window.Prism = window.Prism || { manual: true, disableWorkerMessageHandler: true };
            await injectScript(PRISM_BASE + '/prism.min.js');
        }
        for (const lang of LANGS) {
            const has = window.Prism && window.Prism.languages && window.Prism.languages[lang];
            if (has) continue;
            try { await injectScript(`${PRISM_BASE}/components/prism-${lang}.min.js`); }
            catch { _stats.errors += 1; }
        }
        _prism = window.Prism;
        return _prism;
    })();
    return _loadPromise;
}

export async function highlightElement(el) {
    const prism = await ensurePrism();
    if (!el) return;
    prism.highlightElement(el);
    _stats.highlights += 1;
}

export async function highlightAllUnder(root) {
    const prism = await ensurePrism();
    const els = (root || document).querySelectorAll('pre code[class*="lang-"], pre code[class*="language-"]');
    els.forEach((el) => {
        const cls = el.className;
        if (/lang-(\w+)/.test(cls) && !/language-/.test(cls)) {
            const m = cls.match(/lang-(\w+)/);
            if (m) el.classList.add('language-' + m[1]);
        }
        prism.highlightElement(el);
        _stats.highlights += 1;
    });
}

register('highlight', () => ({ loaded: !!_prism, langs: _prism ? Object.keys(_prism.languages || {}) : [], ...(_stats) }));
