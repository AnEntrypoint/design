export const SMALL_VIEWPORT_W = 768;

export function scaleSpawnSize(sz, vw, vh) {
    const targetW = Math.round(vw * 0.42);
    const targetH = Math.round(vh * 0.52);
    const w = Math.max(sz.w, Math.min(targetW, sz.w * 2, vw));
    const h = Math.max(sz.h, Math.min(targetH, sz.h * 2, vh));
    return { w, h };
}

export function computeSpawnRect(sz, openCount) {
    const host = document.querySelector('.wm-root');
    const vw = host ? host.clientWidth : window.innerWidth;
    const vh = host ? host.clientHeight : window.innerHeight;
    const small = vw < SMALL_VIEWPORT_W;
    const scaled = small ? sz : scaleSpawnSize(sz, vw, vh);
    const w = Math.min(scaled.w, vw);
    const h = Math.min(scaled.h, vh);
    const x = Math.max(0, Math.min(100 + (openCount * 36) % 288, vw - w));
    const y = Math.max(0, Math.min(80 + (openCount * 28) % 224, vh - h));
    return { w, h, x, y, maximized: small };
}

export function reflowWindows(wm) {
    for (const w of wm.list()) {
        const el = document.querySelector('.wm-win[data-id="' + w.id + '"]');
        if (!el) continue;
        const p = el.offsetParent;
        if (!p) continue;
        const nx = Math.min(el.offsetLeft, Math.max(0, p.clientWidth - 60));
        const ny = Math.min(el.offsetTop, Math.max(0, p.clientHeight - 36));
        if (nx === el.offsetLeft && ny === el.offsetTop) continue;
        if (typeof wm.setBounds === 'function') wm.setBounds(w.id, { x: nx, y: ny });
        else if (w.handle && typeof w.handle.setBounds === 'function') w.handle.setBounds({ x: nx, y: ny });
    }
}
