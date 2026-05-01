import { STYLESHEET } from './deck-stage-style.js';
import { buildOverlay, buildTapzones, handleDeckKey } from './deck-stage-overlay.js';

const DESIGN_W_DEFAULT = 1920;
const DESIGN_H_DEFAULT = 1080;
const STORAGE_PREFIX = 'deck-stage:slide:';
const OVERLAY_HIDE_MS = 1800;
const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
const pad2 = (n) => String(n).padStart(2, '0');

class DeckStage extends HTMLElement {
    static get observedAttributes() { return ['width', 'height', 'noscale']; }

    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
        this._index = 0;
        this._slides = [];
        this._notes = [];
        this._hideTimer = null;
        this._mouseIdleTimer = null;
        this._storageKey = STORAGE_PREFIX + (location.pathname || '/');
        this._onKey = this._onKey.bind(this);
        this._onResize = this._onResize.bind(this);
        this._onSlotChange = this._onSlotChange.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
    }

    get designWidth()  { return parseInt(this.getAttribute('width'), 10)  || DESIGN_W_DEFAULT; }
    get designHeight() { return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT; }

    connectedCallback() {
        this._render();
        this._loadNotes();
        this._syncPrintPageRule();
        window.addEventListener('keydown', this._onKey);
        window.addEventListener('resize', this._onResize);
        window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this._onKey);
        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('mousemove', this._onMouseMove);
        if (this._hideTimer) clearTimeout(this._hideTimer);
        if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
    }

    attributeChangedCallback() {
        if (!this._canvas) return;
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        this._fit();
        this._syncPrintPageRule();
    }

    _render() {
        const style = document.createElement('style');
        style.textContent = STYLESHEET;
        const stage = document.createElement('div');
        stage.className = 'stage';
        const canvas = document.createElement('div');
        canvas.className = 'canvas';
        canvas.style.width = this.designWidth + 'px';
        canvas.style.height = this.designHeight + 'px';
        canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        const slot = document.createElement('slot');
        slot.addEventListener('slotchange', this._onSlotChange);
        canvas.appendChild(slot);
        stage.appendChild(canvas);

        const tapzones = buildTapzones({
            onBack: (e) => { e.preventDefault(); this._go(this._index - 1, 'tap'); },
            onForward: (e) => { e.preventDefault(); this._go(this._index + 1, 'tap'); }
        });
        const overlay = buildOverlay({
            onPrev: () => this._go(this._index - 1, 'click'),
            onNext: () => this._go(this._index + 1, 'click'),
            onReset: () => this._go(0, 'click')
        });

        this._root.append(style, stage, tapzones, overlay);
        this._canvas = canvas;
        this._slot = slot;
        this._overlay = overlay;
        this._countEl = overlay.querySelector('.current');
        this._totalEl = overlay.querySelector('.total');
    }

    _syncPrintPageRule() {
        const id = 'deck-stage-print-page';
        let tag = document.getElementById(id);
        if (!tag) {
            tag = document.createElement('style');
            tag.id = id;
            document.head.appendChild(tag);
        }
        tag.textContent =
            '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' +
            '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' +
            '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }

    _onSlotChange() {
        this._collectSlides();
        this._restoreIndex();
        this._applyIndex({ showOverlay: false, broadcast: true, reason: 'init' });
        this._fit();
    }

    _collectSlides() {
        const assigned = this._slot.assignedElements({ flatten: true });
        this._slides = assigned.filter((el) => {
            const tag = el.tagName;
            return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
        });
        this._slides.forEach((slide, i) => {
            const n = i + 1;
            let label = slide.getAttribute('data-label');
            if (!label) {
                const existing = slide.getAttribute('data-screen-label');
                if (existing) label = existing.replace(/^\s*\d+\s*/, '').trim() || existing;
            }
            if (!label) {
                const heading = slide.querySelector('h1, h2, h3, [data-title]');
                if (heading) label = (heading.textContent || '').trim().slice(0, 40);
            }
            if (!label) label = 'Slide';
            slide.setAttribute('data-screen-label', `${pad2(n)} ${label}`);
            if (!slide.hasAttribute('data-om-validate')) slide.setAttribute('data-om-validate', VALIDATE_ATTR);
            slide.setAttribute('data-deck-slide', String(i));
        });
        if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
        if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
    }

    _loadNotes() {
        const tag = document.getElementById('speaker-notes');
        if (!tag) { this._notes = []; return; }
        try {
            const parsed = JSON.parse(tag.textContent || '[]');
            if (Array.isArray(parsed)) this._notes = parsed;
        } catch (e) {
            console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
            this._notes = [];
        }
    }

    _restoreIndex() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (raw == null) return;
            const n = parseInt(raw, 10);
            if (Number.isFinite(n) && n >= 0 && n < this._slides.length) this._index = n;
        } catch (e) { /* ignore */ }
    }

    _persistIndex() { try { localStorage.setItem(this._storageKey, String(this._index)); } catch (e) {} }

    _applyIndex({ showOverlay = true, broadcast = true, reason = 'init' } = {}) {
        if (!this._slides.length) return;
        const prev = this._prevIndex == null ? -1 : this._prevIndex;
        const curr = this._index;
        this._slides.forEach((s, i) => {
            if (i === curr) s.setAttribute('data-deck-active', '');
            else s.removeAttribute('data-deck-active');
        });
        if (this._countEl) this._countEl.textContent = String(curr + 1);
        this._persistIndex();
        if (broadcast) {
            try { window.postMessage({ slideIndexChanged: curr }, '*'); } catch (e) {}
            this.dispatchEvent(new CustomEvent('slidechange', {
                detail: {
                    index: curr, previousIndex: prev, total: this._slides.length,
                    slide: this._slides[curr] || null,
                    previousSlide: prev >= 0 ? (this._slides[prev] || null) : null,
                    reason
                },
                bubbles: true, composed: true
            }));
        }
        this._prevIndex = curr;
        if (showOverlay) this._flashOverlay();
    }

    _flashOverlay() {
        if (!this._overlay) return;
        this._overlay.setAttribute('data-visible', '');
        if (this._hideTimer) clearTimeout(this._hideTimer);
        this._hideTimer = setTimeout(() => this._overlay.removeAttribute('data-visible'), OVERLAY_HIDE_MS);
    }

    _fit() {
        if (!this._canvas) return;
        if (this.hasAttribute('noscale')) { this._canvas.style.transform = 'none'; return; }
        const s = Math.min(window.innerWidth / this.designWidth, window.innerHeight / this.designHeight);
        this._canvas.style.transform = `scale(${s})`;
    }

    _onResize() { this._fit(); }
    _onMouseMove() { this._flashOverlay(); }
    _onKey(e) { if (handleDeckKey(this, e)) { e.preventDefault(); this._flashOverlay(); } }

    _go(i, reason = 'api') {
        if (!this._slides.length) return;
        const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
        if (clamped === this._index) { this._flashOverlay(); return; }
        this._index = clamped;
        this._applyIndex({ showOverlay: true, broadcast: true, reason });
    }

    get index() { return this._index; }
    get length() { return this._slides.length; }
    goTo(i) { this._go(i, 'api'); }
    next()   { this._go(this._index + 1, 'api'); }
    prev()   { this._go(this._index - 1, 'api'); }
    reset()  { this._go(0, 'api'); }
}

if (typeof customElements !== 'undefined' && !customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
}

export { DeckStage };
