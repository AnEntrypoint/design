import { registerModule } from '../registry.js';
import { Game3Modal } from '../../components/game3-modal.js';
import { DiscoverList } from '../../components/game3-social.js';

registerModule({
    id: 'surface-discover', kind: 'surface',
    surface: { id: 'discover', placement: 'modal', body: ({ s, A }) => Game3Modal({ title: 'Discover servers', onClose: () => A.closeSurface && A.closeSurface() }, DiscoverList({ servers: s.discoverServers || [], emptyText: 'No servers joined yet.', onOpen: (id) => A.switchServer && A.switchServer(id) })) },
});
