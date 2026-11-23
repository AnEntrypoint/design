import { registerModule } from '../registry.js';
import { Game3AccountPane, ACCOUNT_TABS } from '../../components/game3-account.js';

ACCOUNT_TABS.forEach(([id, label], i) => registerModule({
    id: 'settings-' + id, kind: 'settingsPane',
    settingsPane: {
        id, label, group: 'User Settings', order: 10 + i,
        mount: ({ account, acts, onRender, level = 0, xp = 0, servers = 0 }) => Game3AccountPane(id, { account, acts, onRender, extra: { level, xp, servers } }),
    },
}));
