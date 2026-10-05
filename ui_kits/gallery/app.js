import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, Side, AppShell, Heading, Icon } from 'ds/components/shell.js';
import { Panel } from 'ds/components/content.js';
import { Carousel } from 'ds/components/carousel.js';
import { Dialog } from 'ds/components/editor-primitives.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const swatchTokens = [
    { name: 'panel-0',     hint: 'paper · root surface' },
    { name: 'panel-1',     hint: 'one shade up · panel bg' },
    { name: 'panel-2',     hint: 'two shades up · row bg' },
    { name: 'panel-3',     hint: 'three shades up · header strip' },
    { name: 'panel-accent',hint: 'dark neutral fill · primary action' },
    { name: 'panel-select',hint: 'neutral gray · hover and selection' }
];

const items = [
    { id: 'a', label: 'folder',  icon: 'folder',     tone: 'panel-1' },
    { id: 'b', label: 'image',   icon: 'file-image', tone: 'panel-2' },
    { id: 'd', label: 'code',    icon: 'file-code',  tone: 'panel-3' },
    { id: 'g', label: 'package', icon: 'package',    tone: 'panel-1' },
    { id: 'i', label: 'globe',   icon: 'globe',      tone: 'panel-2' },
    { id: 'k', label: 'shield',  icon: 'shield',     tone: 'panel-3' }
];

const state = { open: null, density: 'comfy' };
function TilesBody() {
    return h('div', { class: 'ds-tile-grid' + (state.density === 'tight' ? ' ds-tile-grid--tight' : '') }, ...items.map(Tile));
}

function Tile(it) {
    return h('button', {
        key: it.id,
        onclick: () => { state.open = it.id; kit.render(); },
        class: 'ds-gallery-tile' + (state.density === 'tight' ? ' ds-gallery-tile--tight' : ''),
        'aria-label': it.label,
        style: '--tile-tone:var(--' + it.tone + ')'
    },
        h('div', { class: 'ds-tile-cap', 'aria-hidden': 'true' }, Icon(it.icon, { size: 32 })),
        h('div', { class: 'ds-tile-meta' },
            h('span', { class: 'ds-tile-label' }, it.label),
            h('span', { class: 'ds-tile-glyph', 'aria-hidden': 'true' }, it.tone)
        )
    );
}

function Swatch(t) {
    return h('div', { key: t.name, class: 'ds-swatch-col' },
        h('div', { class: 'ds-gal-swatch', style: '--swatch:var(--' + t.name + ')' }),
        h('div', { class: 'ds-gal-swatch-meta' },
            h('span', { class: 'ds-gal-swatch-name' }, t.name),
            h('span', { class: 'ds-gal-swatch-hint' }, t.hint)
        )
    );
}

function LightboxTile(it) {
    return h('div', { class: 'ds-lightbox-preview', style: '--tile-tone:var(--' + it.tone + ')' },
        h('div', { 'aria-hidden': 'true' }, Icon(it.icon, { size: 64 })),
        h('p', { class: 'ds-m0' }, h('strong', {}, it.label))
    );
}

function Lightbox() {
    if (!state.open) return null;
    const openIndex = items.findIndex((i) => i.id === state.open);
    const close = () => { state.open = null; kit.render(); };
    return Dialog({
        open: true,
        onClose: close,
        dismissible: true,
        ariaLabel: 'tile ' + (openIndex + 1) + ' of ' + items.length,
        children: [
            h('div', { class: 'ds-lightbox-head' },
                h('span', { class: 'ds-lightbox-tag' }, 'tile · ' + (openIndex + 1) + ' of ' + items.length),
                h('button', {
                    class: 'btn', onclick: (e) => {
                        const dialogEl = e.currentTarget.closest('[role="dialog"]');
                        if (dialogEl) dialogEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                        else close();
                    }
                }, 'close')
            ),
            h('div', {
                class: 'ds-lightbox-card--carousel',
                ref: (el) => {
                    if (!el || el._dsLbScrolled === state.open) return;
                    el._dsLbScrolled = state.open;
                    const track = el.querySelector('.ds-carousel-track');
                    const item = track && track.children[openIndex];
                    if (item) item.scrollIntoView({ inline: 'start', behavior: 'instant' });
                }
            }, Carousel({ items, renderItem: LightboxTile, label: 'gallery tiles' })),
            h('p', { class: 'ds-m0 ds-text-2' }, 'use the carousel arrows to browse tiles, esc or click outside to close.')
        ]
    });
}

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'gallery', items: [['index', '../../'], ['source', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'gallery' }),
        side: Side({
            sections: [
                { group: 'density', items: [
                    { glyph: h('span', { class: state.density === 'comfy' ? 'ds-dot ds-dot-on' : 'ds-dot ds-dot-off' }), label: 'comfy', key: 'd1', onClick: (e) => { e.preventDefault(); state.density = 'comfy'; kit.render(); } },
                    { glyph: h('span', { class: state.density === 'tight' ? 'ds-dot ds-dot-on' : 'ds-dot ds-dot-off' }), label: 'tight', key: 'd2', onClick: (e) => { e.preventDefault(); state.density = 'tight'; kit.render(); } }
                ] },
                { group: 'jump', items: [
                    { glyph: Icon('grid', { size: 14 }), label: 'tiles',    key: 'j1', href: '#tiles' },
                    { glyph: Icon('square', { size: 14 }), label: 'swatches', key: 'j2', href: '#swatches' }
                ] }
            ]
        }),
        main: [
            h('div', { class: 'ds-app-surface ds-section ds-section-pad' },
                Heading({ level: 1, children: 'gallery' }),
                Panel({ title: 'tiles', count: items.length, class: 'ds-panel-gap', children: TilesBody() }),
                Panel({ title: 'swatches', count: swatchTokens.length, class: 'ds-panel-gap', children:
                    h('div', { class: 'ds-swatch-grid' }, ...swatchTokens.map(Swatch))
                }),
            ),
            Lightbox()
        ],
        status: Status({
            left: ['gallery', items.length + ' tiles', 'density=' + state.density],
            right: ['sample tiles']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '14 Gallery' });
