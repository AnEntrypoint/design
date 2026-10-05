import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, AppShell, Heading, Lede } from 'ds/components/shell.js';
import { Panel, RowLink } from 'ds/components/content.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const suggestions = [
    { title: 'index', sub: 'design system home', href: '../../' },
    { title: 'search', sub: 'find a component or kit by name', href: '../search/' },
    { title: 'kits', sub: 'every ui kit, rendered', href: '../../#kits' },
    { title: 'previews', sub: 'every primitive, isolated', href: '../../preview/buttons.html' },
    { title: 'readme', sub: 'overview and conventions on github', href: 'https://github.com/AnEntrypoint/design/blob/main/README.md' }
];

const path = (typeof location !== 'undefined' && location.search) ? new URLSearchParams(location.search).get('p') : null;

function App() {
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'not found', items: [['index', '../../']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'not found' }),
        main: [
            h('div', { class: 'ds-app-surface ds-section-pad' },
                Heading({ level: 1, children: 'page not found' }),
                Lede({ children: path
                    ? 'nothing on this site is served at ' + path + '. the page may have moved, or the link may have a typo.'
                    : 'the address you opened does not match any page on this site. the page may have moved, or the link may have a typo.' }),
                Panel({ title: 'pages that do exist', class: 'ds-panel-gap',
                    children: h('div', {}, ...suggestions.map((s, i) => RowLink({ key: 's' + i, title: s.title, sub: s.sub, href: s.href })))
                })
            )
        ],
        status: Status({
            left: ['not found', '- 404', '- ' + (path || 'no path given')],
            right: ['247420 / mmxxvi']
        })
    });
}

mountKit({ root, view: App, screen: '13 404' });
