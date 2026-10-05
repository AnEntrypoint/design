(function () {
  function reduced() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function installMotionStyle() {
    if (document.getElementById('preview-motion-vars')) return;
    var style = document.createElement('style');
    style.id = 'preview-motion-vars';
    style.textContent = [
      '@media (prefers-reduced-motion: no-preference){',
      '[data-anim="in"]{opacity:0;transform:translateY(10px);',
      'transition:opacity var(--dur-reveal,560ms) var(--ease,cubic-bezier(.2,0,0,1)) var(--anim-delay,0ms),',
      'transform var(--dur-reveal,560ms) var(--ease-spring,cubic-bezier(.34,1.56,.64,1)) var(--anim-delay,0ms);}',
      '[data-anim="ready"]{opacity:1;transform:translateY(0);}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  var STAGGER_MS = 40;
  var STAGGER_MAX = 8;

  function animateEntry(el, cfg, i) {
    if (!el || !el.dataset) return;
    if (el.dataset.anim) return;
    if (cfg.stagger) {
      el.style.setProperty('--anim-delay', (Math.min(i, STAGGER_MAX) * STAGGER_MS) + 'ms');
    }
    el.dataset.anim = 'in';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.dataset.anim = 'ready'; });
    });
  }

  function runList(selector, cfg) {
    Array.prototype.slice.call(document.querySelectorAll(selector))
      .forEach(function (el, i) { animateEntry(el, cfg, i); });
  }

  function runAllChildren(cfg) {
    var n = 0;
    Array.prototype.slice.call(document.body.children || []).forEach(function (el) {
      if (!el || !el.tagName) return;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;
      animateEntry(el, cfg, n);
      n += 1;
    });
  }

  function presetForPage(file) {
    var presets = {
      'buttons.html': ['button, .btn, .btn-primary, .btn-ghost'],
      'colors-core.html': ['.sw'],
      'colors-lore.html': ['body > div:nth-of-type(2) > div'],
      'colors-semantic.html': ['body > div:nth-of-type(2) > div'],
      'dateline.html': ['.dateline'],
      'header.html': ['.app-topbar', '.app-crumb'],
      'icons-unicode.html': ['body > div:nth-of-type(2) > div'],
      'index-row.html': ['.row'],
      'inputs.html': ['.input, .t-label'],
      'manifesto.html': ['.prin'],
      'rules.html': ['.rule, .rule-double, .rule-dotted'],
      'spacing.html': ['body > div:nth-of-type(2) > div'],
      'stamps-lore.html': ['.stamp, .btn-stamp'],
      'stamps.html': ['.stamp'],
      'theme-ink.html': ['body > *'],
      'type-display.html': ['.t-hero, .t-h1'],
      'type-mono.html': ['body > div:nth-of-type(2) > div'],
      'type-prose.html': ['.prose p'],
      'type-scale.html': ['body > div:nth-of-type(2) > div'],
      'wordmarks.html': ['body > div:nth-of-type(2) > div']
    };
    return presets[file] || null;
  }

  function applyDefaults() {
    if (reduced()) return;

    var file = (window.location.pathname.split('/').pop() || '').toLowerCase();
    var preset = presetForPage(file);

    if (!preset) {
      runAllChildren({ stagger: true });
      return;
    }

    preset.forEach(function (selector) {
      runList(selector, { stagger: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    installMotionStyle();
    applyDefaults();
  }, { once: true });
})();
