import { ignoreFailure } from './best-effort.js';

export const scope = '.ds-247420';

let _cssPromise = null;

export function loadCss() {
    if (_cssPromise) return _cssPromise;
    _cssPromise = (async () => {
        const url = new URL('../dist/247420.css', import.meta.url);
        const res = await fetch(url);
        if (!res.ok) throw new Error('247420: failed to load css ' + res.status);
        return await res.text();
    })();
    return _cssPromise;
}

export let css = '';
loadCss().then((s) => { css = s; }).catch(ignoreFailure);
