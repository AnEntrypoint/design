import { registerModule } from '../registry.js';
import { Game3DiscoveryPane } from '../../components/game3-discovery.js';

registerModule({
    id: 'servers-discovery', kind: 'settingsPane',
    settingsPane: {
        id: 'discovery', label: 'Discovery', group: 'Server Settings', order: 5,
        when: (s) => !!s.discovery && !!s.canManage,
        mount: ({ discovery, acts }) => Game3DiscoveryPane({ discovery, acts }),
    },
});
