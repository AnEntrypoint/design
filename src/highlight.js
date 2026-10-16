
let _prism = null;
let _ready = null;
let _languageLoads = new Map();

const DEFAULT_PRISM_BASE = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/';
let _prismBase = DEFAULT_PRISM_BASE;

export function configurePrismCdn({ baseUrl } = {}) {
    _prismBase = baseUrl || DEFAULT_PRISM_BASE;
    _prism = null;
    _ready = null;
    _languageLoads = new Map();
}

export function getPrismCdnConfig() {
    return { baseUrl: _prismBase };
}

const LANGUAGE_REQUIRES = {
    markup: [], css: [], clike: [],
    javascript: ['clike'], json: [], bash: [], yaml: [],
    markdown: ['markup'], python: [], rust: [], go: ['clike'],
    diff: [], sql: [], toml: [],
    typescript: ['javascript'], jsx: ['markup', 'javascript'], tsx: ['jsx', 'typescript'],
};

const LANGUAGE_ALIASES = {
    html: 'markup', xml: 'markup', svg: 'markup', mathml: 'markup',
    js: 'javascript', ts: 'typescript',
    sh: 'bash', shell: 'bash', zsh: 'bash',
    yml: 'yaml', md: 'markdown', py: 'python', rs: 'rust',
};

const LANGUAGE_CLASS = /(?:^|\s)lang(?:uage)?-([\w-]+)/;

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

function loadLanguage(name) {
    if (!_languageLoads.has(name)) {
        const requires = LANGUAGE_REQUIRES[name].map(loadLanguage);
        _languageLoads.set(name, Promise.all(requires).then(() => loadScript(_prismBase + 'prism-' + name + '.min.js')));
    }
    return _languageLoads.get(name);
}

async function loadPrismCore() {
    if (_prism) return _prism;
    if (!_ready) {
        _ready = (async () => {
            try {
                await loadScript(_prismBase + 'prism-core.min.js');
                _prism = window.Prism || null;
                return _prism;
            } catch (err) {
                console.warn('[247420] prism loader failed:', err);
                return null;
            }
        })();
    }
    return _ready;
}

export async function ensurePrism() {
    const Prism = await loadPrismCore();
    if (Prism) await Promise.all(Object.keys(LANGUAGE_REQUIRES).map(loadLanguage));
    return Prism;
}

function languagesUnder(root) {
    const found = new Set();
    root.querySelectorAll('[class*="lang"]').forEach((el) => {
        const match = LANGUAGE_CLASS.exec(el.getAttribute('class') || '');
        if (!match) return;
        const name = LANGUAGE_ALIASES[match[1]] || match[1];
        if (name in LANGUAGE_REQUIRES) found.add(name);
    });
    return found;
}

export async function highlightAllUnder(root) {
    if (!root) return;
    const Prism = await loadPrismCore();
    if (!Prism) return;
    await Promise.all([...languagesUnder(root)].map(loadLanguage));
    if (typeof Prism.highlightAllUnder === 'function') Prism.highlightAllUnder(root);
}
