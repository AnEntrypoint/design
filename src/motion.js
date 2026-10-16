
export function installMotion() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('ds-247420-motion')) return;
    const style = document.createElement('style');
    style.id = 'ds-247420-motion';
    style.textContent = `
@media (prefers-reduced-motion: no-preference) {
  .ds-247420 [data-anim="in"] {
    opacity: 0; transform: translateY(14px);
    transition: opacity var(--dur-reveal, 560ms) var(--ease, cubic-bezier(.2,0,0,1)),
                transform var(--dur-reveal, 560ms) var(--ease-spring, cubic-bezier(0.34,1.56,0.64,1));
  }
  .ds-247420 [data-anim="ready"] {
    opacity: 1; transform: translateY(0);
  }
}
:root[data-motion="reduced"] .ds-247420 [data-anim="in"],
.ds-247420[data-motion="reduced"] [data-anim="in"] {
  opacity: 1 !important; transform: translateY(0) !important;
  transition: none !important;
}
:root[data-motion="reduced"] .ds-247420 [data-anim="ready"],
.ds-247420[data-motion="reduced"] [data-anim="ready"] {
  transition: none !important;
}`.trim();
    document.head.appendChild(style);
}

export function animateTree(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const targets = root.querySelectorAll('.ds-hero,.panel,.ds-section,.app-main > *');
    targets.forEach((el, i) => {
        if (el.dataset.anim === 'ready') return;
        el.dataset.anim = 'in';
        const delay = Math.min(i, 6) * 30;
        setTimeout(() => { el.dataset.anim = 'ready'; }, delay);
    });
}
