import { icons } from './icons.js';

let _announcer = null;
function getAnnouncer() {
    if (_announcer && _announcer.isConnected) return _announcer;
    _announcer = document.getElementById('wm-announcer');
    if (_announcer) return _announcer;
    _announcer = document.createElement('div');
    _announcer.id = 'wm-announcer';
    _announcer.setAttribute('aria-live', 'polite');
    _announcer.setAttribute('aria-atomic', 'true');
    _announcer.className = 'sr-only';
    _announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(_announcer);
    return _announcer;
}
function announce(text) {
    const a = getAnnouncer();
    a.textContent = '';
    requestAnimationFrame(() => { a.textContent = text; });
}

export function renderWindow(opts = {}) {
    const {
        title = 'window',
        body = null,
        bounds = { x: 60, y: 60, w: 480, h: 320 },
        focused = false,
        maximized = false,
        minimized = false,
        instanceId = '',
        kind = 'div',
        callbacks = {},
    } = opts;

    const MIN_VISIBLE = 60;
    const BAR_H = 36;
    function clampBounds(b, p) {
        const pw = p ? p.clientWidth : window.innerWidth;
        const ph = p ? p.clientHeight : window.innerHeight;
        const out = { ...b };
        if (typeof out.w === 'number') out.w = Math.min(out.w, pw);
        if (typeof out.h === 'number') out.h = Math.min(out.h, ph);
        if (typeof out.x === 'number') {
            const w = typeof out.w === 'number' ? out.w : MIN_VISIBLE;
            out.x = Math.max(MIN_VISIBLE - w, Math.min(out.x, pw - MIN_VISIBLE));
        }
        if (typeof out.y === 'number') out.y = Math.max(0, Math.min(out.y, ph - BAR_H));
        return out;
    }

    const el = document.createElement('div');
    el.className = 'wm-win';
    el.dataset.kind = kind;
    if (instanceId) el.dataset.instanceId = instanceId;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', title);
    const b0 = clampBounds(bounds, null);
    el.style.left = b0.x + 'px';
    el.style.top = b0.y + 'px';
    el.style.width = b0.w + 'px';
    el.style.height = b0.h + 'px';

    const bar = document.createElement('div');
    bar.className = 'wm-bar';
    const titleEl = document.createElement('span');
    titleEl.className = 'wm-title';
    titleEl.textContent = title;
    const btns = document.createElement('div');
    btns.className = 'wm-btns';
    const minBtn = mkBtn(icons.minimize, 'minimize');
    const maxBtn = mkBtn(icons.maximize, 'maximize');
    const closeBtn = mkBtn(icons.close, 'close');
    btns.append(minBtn, maxBtn, closeBtn);
    bar.append(titleEl, btns);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'wm-body';
    setBodyContent(bodyEl, body);

    const ORIENT = { n: 'horizontal', s: 'horizontal', ne: 'horizontal', nw: 'horizontal', se: 'horizontal', sw: 'horizontal', e: 'vertical', w: 'vertical' };
    const DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    const grips = DIRS.map(dir => {
        const g = document.createElement('div');
        g.className = dir === 'se' ? 'wm-resize' : 'wm-edge';
        g.dataset.dir = dir;
        g.setAttribute('role', 'separator');
        g.setAttribute('aria-orientation', ORIENT[dir] || 'horizontal');
        g.setAttribute('aria-label', 'resize ' + dir + ' (pointer only)');
        return g;
    });

    el.append(bar, bodyEl, ...grips);

    minBtn.addEventListener('click', e => { e.stopPropagation(); callbacks.onMinimize && callbacks.onMinimize(); });
    maxBtn.addEventListener('click', e => { e.stopPropagation(); callbacks.onMaximize && callbacks.onMaximize(); });

    let closeArmed = false;
    let closeArmTimer = null;
    function disarmClose() {
        closeArmed = false;
        if (closeArmTimer) { clearTimeout(closeArmTimer); closeArmTimer = null; }
        closeBtn.classList.remove('confirm');
        closeBtn.setAttribute('aria-label', 'close');
    }
    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (!closeArmed) {
            closeArmed = true;
            closeBtn.classList.add('confirm');
            closeBtn.setAttribute('aria-label', 'confirm close');
            closeArmTimer = setTimeout(disarmClose, 3000);
            return;
        }
        disarmClose();
        announce('closed ' + titleEl.textContent);
        callbacks.onClose && callbacks.onClose();
    });
    closeBtn.addEventListener('blur', disarmClose);

    const focus = () => {
        if (!el.classList.contains('wm-focused')) announce(titleEl.textContent + ' focused');
        callbacks.onFocus && callbacks.onFocus();
    };

    el.addEventListener('pointerdown', () => focus());

    el.addEventListener('keydown', e => {
        if (e.key !== 'Tab' || !el.classList.contains('wm-focused')) return;
        const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    bar.addEventListener('pointerdown', e => {
        if (e.target.closest('.wm-btn')) return;
        e.stopPropagation();
        focus();
        if (callbacks.onDragStart) callbacks.onDragStart(e, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    });

    grips.forEach(g => g.addEventListener('pointerdown', e => {
        e.stopPropagation();
        focus();
        if (callbacks.onResizeStart) callbacks.onResizeStart(e, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, dir: g.dataset.dir });
    }));

    applyFocused(el, focused);
    applyMaximized(el, maximized);
    applyMinimized(el, minimized);
    announce('opened ' + title);

    return {
        el,
        setTitle(t) { titleEl.textContent = t; },
        setBody(b) { setBodyContent(bodyEl, b); },
        setBounds(b) {
            const c = clampBounds({
                ...b,
                w: typeof b.w === 'number' ? b.w : el.offsetWidth,
            }, el.offsetParent);
            if (typeof c.x === 'number') el.style.left = c.x + 'px';
            if (typeof c.y === 'number') el.style.top = c.y + 'px';
            if (typeof b.w === 'number') el.style.width = c.w + 'px';
            if (typeof b.h === 'number') el.style.height = c.h + 'px';
        },
        setFocused(v) { applyFocused(el, v); },
        setMaximized(v) { applyMaximized(el, v); },
        setMinimized(v) { animateMinimize(el, v); },
        setInstanceId(id) { if (id) el.dataset.instanceId = id; else delete el.dataset.instanceId; },
        setZIndex(z) { el.style.zIndex = String(z); },
        getBounds() { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; },
        dispose() { if (closeArmTimer) clearTimeout(closeArmTimer); animateClose(el); },
    };
}

function mkBtn(svg, ttl) {
    const b = document.createElement('button');
    b.className = 'wm-btn';
    b.innerHTML = svg;
    b.title = ttl;
    b.setAttribute('aria-label', ttl);
    return b;
}

function setBodyContent(host, body) {
    while (host.firstChild) host.removeChild(host.firstChild);
    if (body instanceof Node) host.appendChild(body);
    else if (typeof body === 'string') host.innerHTML = body;
}

function applyFocused(el, v) { el.classList.toggle('wm-focused', !!v); }
function applyMaximized(el, v) { el.classList.toggle('wm-max', !!v); }
function applyMinimized(el, v) { el.classList.toggle('wm-min', !!v); }

function reducedMotion() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateMinimize(el, v) {
    if (reducedMotion()) { applyMinimized(el, v); return; }
    if (v) {
        el.classList.add('wm-minimizing');
        const done = () => { el.classList.remove('wm-minimizing'); applyMinimized(el, true); };
        el.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 220);
    } else {
        applyMinimized(el, false);
        el.classList.add('wm-restoring');
        setTimeout(() => el.classList.remove('wm-restoring'), 220);
    }
}

function animateClose(el) {
    if (!el.isConnected) return;
    if (reducedMotion()) { el.remove(); return; }
    el.classList.add('wm-closing');
    const done = () => el.remove();
    el.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 220);
}
