export function renderBrowserPane(opts = {}) {
    const { initialUrl = 'about:blank', callbacks = {} } = opts;
    const node = document.createElement('div');
    node.className = 'app-pane browser-app';
    node.dataset.component = 'browser-app';

    const bar = document.createElement('div');
    bar.className = 'browser-app-bar';

    const mkBtn = (label, role) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'browser-app-btn';
        b.dataset.role = role;
        b.textContent = label;
        return b;
    };
    const backBtn = mkBtn('<', 'back');
    backBtn.setAttribute('aria-label', 'Back');
    const fwdBtn = mkBtn('>', 'forward');
    fwdBtn.setAttribute('aria-label', 'Forward');
    const reloadBtn = mkBtn('reload', 'reload');
    reloadBtn.setAttribute('aria-label', 'Reload');
    backBtn.disabled = true;
    fwdBtn.disabled = true;

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'browser-app-url';
    urlInput.value = initialUrl;
    urlInput.spellcheck = false;
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && callbacks.onNavigate) callbacks.onNavigate(urlInput.value);
    });
    backBtn.addEventListener('click', () => callbacks.onBack && callbacks.onBack());
    fwdBtn.addEventListener('click', () => callbacks.onForward && callbacks.onForward());
    reloadBtn.addEventListener('click', () => callbacks.onReload && callbacks.onReload());

    bar.append(backBtn, fwdBtn, reloadBtn, urlInput);

    const slot = document.createElement('div');
    slot.className = 'browser-app-slot';
    slot.dataset.role = 'iframe-mount';

    const status = document.createElement('div');
    status.className = 'browser-app-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = '';

    node.append(bar, slot, status);

    return {
        node,
        get slot() { return slot; },
        setUrl(u) { urlInput.value = u; },
        setStatus(s) { status.textContent = s; },
        setNav({ canBack = false, canForward = false } = {}) {
            backBtn.disabled = !canBack;
            fwdBtn.disabled = !canForward;
        },
        setLoading(on) {
            node.classList.toggle('browser-app-loading', !!on);
            if (on) { node.removeAttribute('data-error'); status.textContent = 'loading...'; }
        },
        setError(msg) {
            node.classList.remove('browser-app-loading');
            if (msg) { node.setAttribute('data-error', '1'); status.textContent = msg; }
            else { node.removeAttribute('data-error'); }
        },
        dispose() {},
    };
}
