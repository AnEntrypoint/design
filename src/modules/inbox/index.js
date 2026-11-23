import { registerModule } from '../registry.js';
import { Game3InboxPanel, Game3InboxTabs } from '../../components/game3-inbox.js';

registerModule({
    id: 'surface-inbox', kind: 'surface',
    surface: {
        id: 'inbox', placement: 'popover', title: 'Inbox',
        head: ({ s, A }) => Game3InboxTabs({ tab: s.inboxTab || 'mentions', onTab: (t) => A.setInboxTab && A.setInboxTab(t), savedCount: (s.savedMessages || []).length }),
        body: ({ s }) => Game3InboxPanel({ tab: s.inboxTab || 'mentions', rows: s.mentions || [], saved: s.savedMessages || [] }),
    },
});
