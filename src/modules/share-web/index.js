import { registerModule } from '../registry.js';
import { SharedPagePanel, SharePageDialog, ShareWebRail } from './views.js';

const state = (s) => s.shareWeb || { inVoice: false, page: null, dialog: false, hidden: false, screen: false, videos: [] };

registerModule({
    id: 'share-web-panel', kind: 'popover',
    popover: {
        id: 'share-web-panel',
        close: ({ s, A }) => { if (state(s).dialog) A.sharePageClose(); },
        mount: ({ s, A }) => {
            const sw = state(s);
            if (sw.dialog) return SharePageDialog({ onClose: () => A.sharePageClose(), onStart: (url) => A.sharePageStart(url) });
            if (sw.page && !sw.hidden) return SharedPagePanel({ page: sw.page, onHide: () => A.sharePageHide(true), onStop: () => A.sharePageStop() });
            return null;
        },
    },
});

registerModule({
    id: 'share-web-rail', kind: 'railSection',
    railSection: {
        id: 'share-web-rail', order: 51,
        mount: ({ s, A }) => { const sw = state(s); return ShareWebRail({ inVoice: sw.inVoice, screen: sw.screen, page: sw.page, onPage: () => A.sharePageOpen(), onScreen: () => A.shareScreenToggle(), onStop: () => A.sharePageStop() }); },
    },
});
