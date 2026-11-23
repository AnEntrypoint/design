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
        body: ({ s, A }) => Game3Modal({ title: 'Discover servers', onClose: () => A.closeSurface && A.closeSurface() },
            DiscoverListings({ listings: s.discoverListings || [], query: s.discoverQuery || '', onQuery: (q) => A.discoverSearch && A.discoverSearch(q), onJoin: (l) => { if (A.joinInvite) A.joinInvite(l.id, l.name); if (A.closeSurface) A.closeSurface(); }, onOpen: (id) => A.switchServer && A.switchServer(id) }),
            h('h6', { key: 'mine', class: 'ds-g3-dsc-sec' }, 'Your servers'),
            DiscoverList({ servers: s.discoverServers || [], emptyText: 'No servers joined yet.', onOpen: (id) => A.switchServer && A.switchServer(id) })),
    },
});
