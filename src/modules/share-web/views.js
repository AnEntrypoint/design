import * as webjsx from '../../../vendor/webjsx/index.js';
import { Game3Modal } from '../../components/game3-modal.js';

const h = webjsx.createElement;

const press = (fn) => ({ role: 'button', tabindex: '0', onclick: fn, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } } });

export const PAGE_WARNING = 'The page opens inside your browser for everyone in the room. Only open pages from people you trust. If a site refuses to be shown here, use Open in a new tab.';

const httpsOnly = (url) => { try { return new URL(url).protocol === 'https:' ? url : ''; } catch { return ''; } };

export function SharedPagePanel({ page, onHide, onStop }) {
    const url = httpsOnly(page.url);
    return h('div', { key: 'shpage', class: 'ds-g3-shpage', role: 'region', 'aria-label': 'shared page' },
        h('div', { class: 'ds-g3-shhead' },
            h('b', null, page.mine ? 'You are sharing a page' : page.byName + ' is sharing a page'),
            h('span', { class: 'ds-g3-shstate connected' }, url ? new URL(url).hostname : ''),
            h('a', { class: 'ds-g3-evb', href: url || '#', target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'open in a new tab' }, 'Open in a new tab'),
            page.mine ? h('span', { ...press(onStop), class: 'ds-g3-evb ds-g3-evb-ghost' }, 'Stop sharing') : null,
            h('span', { ...press(onHide), class: 'ds-g3-evx', 'aria-label': 'hide shared page', title: 'Hide' }, '✕')),
        h('div', { class: 'ds-g3-shwho' }, PAGE_WARNING),
        url ? h('iframe', { key: 'frame', class: 'ds-g3-shframe', src: url, title: 'shared page', sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups', referrerpolicy: 'no-referrer', loading: 'lazy' }) : null);
}

export function SharePageDialog({ onClose, onStart }) {
    return h('div', { key: 'shpagedlg', class: 'ds-g3-scrim', role: 'presentation', onclick: (e) => { if (e.target === e.currentTarget) onClose(); } },
        Game3Modal({ title: 'Share a page', onClose },
            h('div', { class: 'ds-g3-shwarn' }, PAGE_WARNING),
            h('div', { class: 'ds-g3-row2 ds-g3-gap' },
                h('input', { class: 'ds-g3-fi', id: 'sh-page-url', placeholder: 'https://example.com/page', maxlength: '1000', 'aria-label': 'page address', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') onStart(e.target.value); } }),
                h('span', { ...press(() => onStart(document.getElementById('sh-page-url').value)), class: 'ds-g3-evb ds-g3-evb-on' }, 'Share')),
            h('p', { class: 'ds-g3-hint' }, 'You control the address while you share. Everyone in this voice room sees it beside the conversation.')));
}

export function ShareWebRail({ inVoice, screen, page, onPage, onScreen, onStop }) {
    if (!inVoice && !screen && !(page && page.mine)) return [];
    return [
        h('a', { key: 'shpagerow', href: '#', class: 'ds-g3-shrow', onclick: (e) => { e.preventDefault(); if (page && page.mine) onStop(); else onPage(); } }, h('span', { class: 'ds-g3-shname' }, page && page.mine ? 'Stop sharing a page' : 'Share a page')),
        h('a', { key: 'shscreenrow', href: '#', class: 'ds-g3-shrow', onclick: (e) => { e.preventDefault(); onScreen(); } }, h('span', { class: 'ds-g3-shname' }, screen ? 'Stop sharing your screen' : 'Share a screen')),
    ].filter(Boolean);
}
