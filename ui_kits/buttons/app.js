import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, AppShell, Heading, Lede, Btn } from 'ds/components/shell.js';
import { Panel } from 'ds/components/content.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const state = { loading: false };

function VariantRow() {
    return Panel({ title: 'variants', children:
        h('div', { class: 'ds-btn-row' },
            Btn({ variant: 'primary', children: 'save changes' }),
            Btn({ variant: 'default', children: 'cancel' }),
            Btn({ variant: 'ghost', children: 'preview' }),
            Btn({ variant: 'link', href: '#', children: 'view full log' }),
            Btn({ variant: 'danger', children: 'delete project' })
        )
    });
}

function SizeRow() {
    return Panel({ title: 'sizes', children:
        h('div', { class: 'ds-btn-size-row' },
            h('div', { class: 'ds-btn-size-col' },
                h('span', { class: 'ds-hint-sm' }, 'small'),
                Btn({ variant: 'primary', size: 'sm', children: 'save' })),
            h('div', { class: 'ds-btn-size-col' },
                h('span', { class: 'ds-hint-sm' }, 'medium (default)'),
                Btn({ variant: 'primary', size: 'md', children: 'save' })),
            h('div', { class: 'ds-btn-size-col' },
                h('span', { class: 'ds-hint-sm' }, 'large'),
                Btn({ variant: 'primary', size: 'lg', children: 'save' }))
        )
    });
}

function StateRow() {
    return Panel({ title: 'states', children:
        h('div', { class: 'ds-btn-row' },
            Btn({ variant: 'primary', children: 'default' }),
            Btn({ variant: 'primary', disabled: true, children: 'disabled' }),
            h('button', {
                type: 'button',
                class: 'btn btn-primary' + (state.loading ? ' loading' : ''),
                'aria-busy': state.loading ? 'true' : null,
                disabled: state.loading ? true : null,
                onclick: () => { state.loading = true; kit.render(); setTimeout(() => { state.loading = false; kit.render(); }, 1600); }
            }, state.loading ? 'saving…' : 'click to simulate loading')
        )
    });
}

function ConfirmPairRow() {
    return Panel({ title: 'destructive confirm pairing', children:
        h('div', { class: 'ds-btn-row' },
            Btn({ variant: 'default', children: 'cancel' }),
            Btn({ variant: 'danger', children: 'delete account' })
        )
    });
}

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'buttons', items: [['index', '../../'], ['source', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'buttons' }),
        main: [
            h('div', { class: 'ds-app-surface ds-section-pad' },
                Heading({ level: 1, children: 'buttons' }),
                Lede({ children: 'every Btn() variant, size and state: primary, secondary, ghost, link, danger, loading, disabled.' }),
                VariantRow(),
                SizeRow(),
                StateRow(),
                ConfirmPairRow()
            )
        ],
        status: Status({ left: ['buttons', '- 5 variants', '- 3 sizes'], right: ['static demo'] })
    });
}

const kit = mountKit({ root, view: App, screen: '17 Buttons' });
