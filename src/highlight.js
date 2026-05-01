import { register } from './debug.js';

let _stats = { highlights: 0 };

export function ensurePrism() {
    return Promise.resolve(null);
}

export async function highlightElement(el) {
    _stats.highlights += 1;
}

export async function highlightAllUnder(root) {
    const els = (root || document).querySelectorAll('pre code[class*="lang-"], pre code[class*="language-"]');
    _stats.highlights += els.length;
}

register('highlight', () => ({ loaded: false, ...(_stats) }));
