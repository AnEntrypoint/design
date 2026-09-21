// Tooltip — single shared bubble appended to <body>. One module-scope
// element and one module-scope scroll listener serve every trigger on the
// page (per-trigger bubbles/listeners leaked one per element).

import * as webjsx from '../../../vendor/webjsx/index.js';
import { useFloating, useLongPress, FLOAT_OFFSET_TOOLTIP, kids } from './floating.js';

let _tipEl = null, _tipFloat = null, _tipTimer = null, _tipId = 0;
// The trigger currently pointed at the shared bubble, plus whatever
// aria-describedby it already carried. Tracked because the describedby
// reference MUST come off again when the bubble hides: a hidden bubble is
// still in the DOM, so a screen reader following a stale reference announces
// a description for a tooltip that is no longer showing, and the trigger
// claims a description it no longer has. One bubble serves every trigger, so
// the attribute also has to be released from the PREVIOUS trigger when a new
// one takes the bubble over.
let _tipTrigger = null, _tipPrevDescribedBy = null;
function _releaseTrigger() {
    if (!_tipTrigger) return;
    // A caller's own aria-describedby (a form hint, an error node) is restored
    // rather than removed -- the tooltip borrowed the attribute, it does not
    // own it.
    if (_tipPrevDescribedBy) _tipTrigger.setAttribute('aria-describedby', _tipPrevDescribedBy);
    else _tipTrigger.removeAttribute('aria-describedby');
    _tipTrigger = null; _tipPrevDescribedBy = null;
}
function _hideTip() {
    if (_tipTimer) { clearTimeout(_tipTimer); _tipTimer = null; }
    if (_tipFloat) { _tipFloat.dispose(); _tipFloat = null; }
    _releaseTrigger();
    if (_tipEl) { _tipEl.hidden = true; _tipEl.className = 'ds-tooltip'; }
}
// One module-scope scroll listener hides the shared bubble on any scroll —
// registered once, never per-trigger (per-trigger leaked a listener per element).
if (typeof window !== 'undefined' && !window.__dsTipScrollBound) {
    window.__dsTipScrollBound = true;
    window.addEventListener('scroll', _hideTip, true);
}
function _showTip(trigger, label, placement, kind) {
    if (typeof document === 'undefined') return;
    if (!_tipEl || !document.body.contains(_tipEl)) {
        _tipEl = document.createElement('div');
        _tipEl.className = 'ds-tooltip';
        _tipEl.setAttribute('role', 'tooltip');
        document.body.appendChild(_tipEl);
    }
    _tipEl.textContent = label;
    _tipEl.className = 'ds-tooltip kind-' + (kind || 'default');
    _tipEl.hidden = false;
    _tipEl.id = 'ds-tip-' + (++_tipId);
    if (_tipTrigger !== trigger) {
        _releaseTrigger();
        _tipTrigger = trigger;
        _tipPrevDescribedBy = trigger.getAttribute('aria-describedby');
    }
    trigger.setAttribute('aria-describedby', _tipEl.id);
    if (_tipFloat) _tipFloat.dispose();
    _tipFloat = useFloating(trigger, _tipEl, { placement, offset: FLOAT_OFFSET_TOOLTIP });
}

export function Tooltip({ children, label, placement = 'top', delay = 350, kind = 'default' } = {}) {
    const child = kids(children)[0];
    if (!child || !label) return child || null;
    const refFn = (el) => {
        if (!el || el._dsTip) return;
        el._dsTip = true;
        const schedule = () => { if (_tipTimer) clearTimeout(_tipTimer); _tipTimer = setTimeout(() => _showTip(el, label, placement, kind), delay); };
        const show = () => _showTip(el, label, placement, kind);
        el.addEventListener('pointerenter', schedule);
        el.addEventListener('pointerleave', _hideTip);
        el.addEventListener('focus', show);
        el.addEventListener('blur', _hideTip);
        el.addEventListener('keydown', (e) => { if (e.key === 'Escape') _hideTip(); });
        useLongPress(el, show, { ms: 500 });
    };
    const prevRef = child.props && child.props.ref;
    const wrap = (el) => { refFn(el); if (typeof prevRef === 'function') prevRef(el); };
    return webjsx.createElement(child.type, { ...(child.props || {}), ref: wrap }, ...(child.children || []));
}
