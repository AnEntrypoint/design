import * as webjsx from 'webjsx';
import { Topbar, Crumb, Heading, Lede, Status, AppShell } from 'ds/components/shell.js';
import { Panel } from 'ds/components/content.js';
import { mountKit } from 'ds/bootstrap.js';
import { dynamicAccentStyleVars } from 'ds/theme/dynamic-accent.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const SOURCES = [
    { label: 'neutral', hex: '#262626' },
    { label: 'red', hex: '#d64545' },
    { label: 'green', hex: '#2f9e44' },
    { label: 'blue', hex: '#2f6fdf' },
    { label: 'amber', hex: '#d99a00' },
    { label: 'violet', hex: '#7a4fd8' },
];

function Swatch(source, dark) {
    const vars = dynamicAccentStyleVars(source.hex, dark);
    const style = Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
    return h('div', { class: 'ds-dyn-swatch', style },
        h('div', { class: 'ds-dyn-swatch-head' }, source.label, h('code', {}, source.hex)),
        h('div', {
            class: 'ds-dyn-swatch-primary',
            style: 'background:var(--dyn-accent);color:var(--dyn-accent-fg)'
        }, 'primary / on-primary'),
        h('div', {
            class: 'ds-dyn-swatch-container',
            style: 'background:var(--dyn-accent-container);color:var(--dyn-accent-container-fg)'
        }, 'container / on-container')
    );
}

function SwatchGrid(dark) {
    return Panel({
        title: dark ? 'dark tones' : 'light tones', children:
            h('div', { class: 'ds-dyn-grid' }, ...SOURCES.map(s => Swatch(s, dark)))
    });
}

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'dynamic accent', items: [['index', '../../'], ['source', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'dynamic accent' }),
        main: [
            h('div', { class: 'ds-app-surface ds-section-pad' },
                Heading({ level: 1, children: 'dynamic accent' }),
                Lede({ children: 'HCT hue+chroma extracted from a source color, rendered at fixed M3-role tones so contrast holds regardless of the source. Additive to --accent/--accent-ink; never a global token rewrite. See src/theme/dynamic-accent.js.' }),
                SwatchGrid(false),
                SwatchGrid(true)
            )
        ],
        status: Status({ left: ['dynamic accent', '- 6 source hues', '- light + dark'], right: ['static demo'] })
    });
}

mountKit({ root, view: App, screen: 'Dynamic Accent' });
