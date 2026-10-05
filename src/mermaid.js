
let _mermaid = null;
let _ready = null;

const DEFAULT_MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
let _mermaidUrl = DEFAULT_MERMAID_URL;

export function configureMermaidCdn({ url } = {}) {
    _mermaidUrl = url || DEFAULT_MERMAID_URL;
    _mermaid = null;
    _ready = null;
}

export function getMermaidCdnConfig() {
    return { url: _mermaidUrl };
}

export async function ensureMermaid() {
    if (_mermaid) return _mermaid;
    if (_ready) return _ready;
    _ready = (async () => {
        try {
            const mod = await import(_mermaidUrl);
            const mermaid = mod.default || mod;
            if (!mermaid || typeof mermaid.render !== 'function') throw new Error('mermaid module missing render()');
            mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true });
            _mermaid = mermaid;
            return _mermaid;
        } catch (err) {
            console.warn('[247420] mermaid loader failed:', err);
            _mermaid = null;
            _ready = null;
            return null;
        }
    })();
    return _ready;
}

let _seq = 0;
export async function renderMermaid(code) {
    const mermaid = await ensureMermaid();
    if (!mermaid) return null;
    try {
        const id = 'ds-mermaid-' + Date.now().toString(36) + '-' + (_seq++);
        const ok = mermaid.parse ? await mermaid.parse(code, { suppressErrors: true }) : true;
        if (!ok) return null;
        const { svg } = await mermaid.render(id, code);
        return svg;
    } catch (err) {
        console.warn('[247420] mermaid render failed:', err);
        return null;
    }
}

export async function renderMermaidBlocksUnder(root) {
    if (!root || !root.querySelectorAll) return;
    const blocks = root.querySelectorAll('code.language-mermaid, code.lang-mermaid');
    for (const codeEl of blocks) {
        const pre = codeEl.closest('pre');
        if (!pre || pre.dataset.mermaidWired === '1') continue;
        pre.dataset.mermaidWired = '1';
        const code = codeEl.textContent || '';
        const svg = await renderMermaid(code);
        if (!svg) { delete pre.dataset.mermaidWired; continue; }
        const wrap = document.createElement('div');
        wrap.className = 'ds-mermaid-block';
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'ds-mermaid-toggle';
        toggle.textContent = 'source';
        const diagram = document.createElement('div');
        diagram.className = 'ds-mermaid-diagram';
        diagram.innerHTML = svg;
        let showingSource = false;
        toggle.addEventListener('click', () => {
            showingSource = !showingSource;
            diagram.style.display = showingSource ? 'none' : '';
            pre.style.display = showingSource ? '' : 'none';
            toggle.textContent = showingSource ? 'diagram' : 'source';
        });
        wrap.appendChild(diagram);
        wrap.appendChild(toggle);
        pre.style.display = 'none';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
    }
}
