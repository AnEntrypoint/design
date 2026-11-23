import { registerModule } from '../registry.js';
import { PinList } from '../../components/game3-social.js';

registerModule({
    id: 'surface-pins', kind: 'surface',
    surface: { id: 'pins', placement: 'popover', title: 'Pinned Messages', body: ({ s, A }) => PinList({ pins: s.pins || [], emptyText: "This channel doesn't have any pinned messages... yet.", onJump: (id) => A.jumpToMessage && A.jumpToMessage(id) }) },
});
