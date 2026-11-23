import { registerModule } from '../registry.js';
import { Game3RecapPanel } from '../../components/game3-recap.js';

registerModule({ id: 'surface-recap', kind: 'surface', surface: { id: 'recap', body: ({ s }) => Game3RecapPanel({ items: s.recap || [], emptyText: "nothing new from anyone since you got here. you're all caught up." }) } });
