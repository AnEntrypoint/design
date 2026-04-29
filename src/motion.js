const ANIMATE_CSS_ID = 'animate-style-cdn';
const ANIMATE_CSS_HREF = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
const MOTION_STYLE_ID = 'ds-247420-motion';

function hasDom() {
    return typeof document !== 'undefined';
}

export function shouldReduceMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function installMotion() {
    if (!hasDom()) return;

    if (!document.getElementById(ANIMATE_CSS_ID)) {
        const link = document.createElement('link');
        link.id = ANIMATE_CSS_ID;
        link.rel = 'stylesheet';
        link.href = ANIMATE_CSS_HREF;
        document.head.appendChild(link);
    }

    if (!document.getElementById(MOTION_STYLE_ID)) {
        const style = document.createElement('style');
        style.id = MOTION_STYLE_ID;
        style.textContent = `
:root {
  --motion-fast: 220ms;
  --motion-base: 420ms;
  --motion-slow: 720ms;
}

@media (prefers-reduced-motion: reduce) {
  .animate__animated {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
`.trim();
        document.head.appendChild(style);
    }
}

export function animateElement(el, name, {
    duration = null,
    delay = null,
    speedClass = '',
    repeat = null,
    cleanup = true
} = {}) {
    if (!el || !name || shouldReduceMotion()) return Promise.resolve(false);

    const classes = ['animate__animated', `animate__${name}`];
    if (speedClass) classes.push(`animate__${speedClass}`);

    el.classList.remove(...classes);
    void el.offsetWidth;
    el.classList.add(...classes);

    if (duration) el.style.setProperty('--animate-duration', duration);
    if (delay) el.style.setProperty('--animate-delay', delay);
    if (repeat != null) el.style.setProperty('--animate-repeat', String(repeat));

    return new Promise((resolve) => {
        const onEnd = () => {
            if (cleanup) {
                el.classList.remove(...classes);
            }
            if (duration) el.style.removeProperty('--animate-duration');
            if (delay) el.style.removeProperty('--animate-delay');
            if (repeat != null) el.style.removeProperty('--animate-repeat');
            resolve(true);
        };
        el.addEventListener('animationend', onEnd, { once: true });
    });
}

export function animateSelector(selector, name, opts = {}) {
    if (!hasDom()) return Promise.resolve(false);
    const el = document.querySelector(selector);
    return animateElement(el, name, opts);
}

function defaultEffectFor(el) {
    const tag = String(el.tagName || '').toLowerCase();
    if (tag === 'aside') return 'fadeInLeft';
    if (tag === 'header') return 'fadeInDown';
    if (tag === 'footer') return 'fadeInUp';
    if (tag === 'main' || tag === 'section' || tag === 'article') return 'fadeIn';
    if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea' || tag === 'select') return 'fadeInUp';
    return 'fadeIn';
}

export function animateTree(root, {
    selector = '*',
    baseDelayMs = 14,
    duration = 'var(--motion-base)'
} = {}) {
    if (!hasDom() || !root || shouldReduceMotion()) return 0;

    const nodes = Array.from(root.querySelectorAll(selector));
    let animated = 0;

    nodes.forEach((el) => {
        if (!el || !el.classList) return;
        if (el.matches('script,style,link,meta,title')) return;
        if (el.hasAttribute('data-no-motion')) return;
        if (el.dataset.motionApplied === '1') return;

        const effect = el.dataset.motionEffect || defaultEffectFor(el);
        el.classList.add('animate__animated', `animate__${effect}`);
        el.style.setProperty('--animate-duration', duration);
        el.style.setProperty('--animate-delay', `${animated * baseDelayMs}ms`);
        el.dataset.motionApplied = '1';
        animated += 1;
    });

    return animated;
}
