import { registerModule } from '../registry.js';
import { Game3Modal } from '../../components/game3-modal.js';
import { DiscoverList } from '../../components/game3-social.js';
import { DiscoverListings } from '../../components/game3-discovery.js';
import * as webjsx from '../../../vendor/webjsx/index.js';

const h = webjsx.createElement;

registerModule({
    id: 'surface-discover', kind: 'surface',
    surface: {
        id: 'discover', placement: 'modal',
        body: ({ s, A }) => {
            const listings = s.discoverListings || [];
            const mine = (s.discoverServers || []).filter((sv) => !listings.some((l) => l.id === sv.id));
            const open = (id) => A.switchServer && A.switchServer(id);
            return Game3Modal({ title: 'Discover servers', onClose: () => A.closeSurface && A.closeSurface() },
                listings.length ? DiscoverListings({ listings, query: s.discoverQuery || '', onQuery: (q) => A.discoverSearch && A.discoverSearch(q), onJoin: (l) => { if (A.joinInvite) A.joinInvite(l.id, l.name); if (A.closeSurface) A.closeSurface(); }, onOpen: open }) : null,
                mine.length || !listings.length ? DiscoverList({ servers: mine, emptyText: 'no servers yet. make the first one.', onOpen: open }) : null,
                A.openServerCreate ? h('div', { key: 'mk', class: 'ds-g3-evb ds-g3-evb-on ds-g3-evb-big', role: 'button', tabindex: '0', onclick: () => { if (A.closeSurface) A.closeSurface(); A.openServerCreate(); } }, '＋ Create your own') : null);
        },
    },
});
