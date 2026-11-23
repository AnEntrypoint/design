import { registerModule } from '../registry.js';
import { AnnouncementList } from '../../components/game3-social.js';

registerModule({ id: 'surface-announcements', kind: 'surface', surface: { id: 'announcements', placement: 'popover', title: 'Announcements', menu: { label: 'Announcements', icon: 'ref-mega', order: 20 }, body: ({ s }) => AnnouncementList({ items: s.announcements || [], emptyText: 'No announcements in this channel yet.' }) } });
