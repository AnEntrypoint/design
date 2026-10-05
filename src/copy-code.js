(function () {
  'use strict';

  const COPY_LABEL = 'copy';
  const COPIED_LABEL = 'copied';
  const FAILED_LABEL = 'copy failed';
  const RESET_MS = 1500;
  const MARK_ATTR = 'data-copy-code-wired';

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function makeButton(codeEl) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-btn';
    btn.textContent = COPY_LABEL;
    btn.setAttribute('aria-label', 'copy code to clipboard');

    let resetTimer = null;
    btn.addEventListener('click', () => {
      copyText(codeEl.textContent || '').then(
        () => setLabel(true),
        () => setLabel(false)
      );
    });

    function setLabel(ok) {
      btn.textContent = ok ? COPIED_LABEL : FAILED_LABEL;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { btn.textContent = COPY_LABEL; }, RESET_MS);
    }

    return btn;
  }

  function wireBlock(codeEl) {
    const pre = codeEl.parentElement;
    if (!pre || pre.tagName !== 'PRE') return;
    if (pre.hasAttribute(MARK_ATTR)) return;
    pre.setAttribute(MARK_ATTR, '1');
    if (!pre.style.position) pre.style.position = 'relative';
    pre.appendChild(makeButton(codeEl));
  }

  function wireAll(root) {
    (root || document).querySelectorAll('pre > code').forEach(wireBlock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wireAll(document));
  } else {
    wireAll(document);
  }

  if (!document.getElementById('copy-code-btn-style')) {
    const style = document.createElement('style');
    style.id = 'copy-code-btn-style';
    style.textContent =
      '.copy-code-btn{position:absolute;top:.5em;right:.5em;font:inherit;' +
      'font-size:.75em;line-height:1;padding:.35em .6em;border:1px solid currentColor;' +
      'border-radius:4px;background:transparent;color:inherit;cursor:pointer;opacity:.6}' +
      '.copy-code-btn:hover{opacity:1}';
    document.head.appendChild(style);
  }
})();
