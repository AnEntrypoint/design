
let _prism = null;
let _ready = null;

const DEFAULT_PRISM_BASE = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/';
let _prismBase = DEFAULT_PRISM_BASE;

export function configurePrismCdn({ baseUrl } = {}) {
    _prismBase = baseUrl || DEFAULT_PRISM_BASE;
    _prism = null;
    _ready = null;
}

export function getPrismCdnConfig() {
    return { baseUrl: _prismBase };
}

const PRISM_TIERS = [
    ['prism-markup.min.js', 'prism-css.min.js', 'prism-clike.min.js'],
    ['prism-javascript.min.js', 'prism-json.min.js', 'prism-bash.min.js', 'prism-yaml.min.js',
     'prism-markdown.min.js', 'prism-python.min.js', 'prism-rust.min.js', 'prism-go.min.js',
     'prism-diff.min.js', 'prism-sql.min.js', 'prism-toml.min.js'],
    ['prism-typescript.min.js', 'prism-jsx.min.js'],
    ['prism-tsx.min.js'],
];

function loadScript(url) {
    return new Promise((resolve) => {
        const existing = document.querySelector('script[src="' + url + '"]');
        if (existing) { resolve(); return; }
        const s = document.createElement('script');
        s.src = url;
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = () => { console.warn('[247420] prism part failed:', url); resolve(); };
        document.head.appendChild(s);
    });
}

export async function ensurePrism() {
    if (_prism) return _prism;
    if (_ready) return _ready;
    _ready = (async () => {
        try {
            await loadScript(_prismBase + 'prism-core.min.js');
            _prism = window.Prism || null;
            if (_prism) {
                for (const tier of PRISM_TIERS) {
                    await Promise.all(tier.map(f => loadScript(_prismBase + f)));
                }
            }
            return _prism;
        } catch (err) {
            console.warn('[247420] prism loader failed:', err);
            return null;
        }
    })();
    return _ready;
}

export async function highlightAllUnder(root) {
    const Prism = await ensurePrism();
    if (!Prism || !root) return;
    if (typeof Prism.highlightAllUnder === 'function') Prism.highlightAllUnder(root);
}
