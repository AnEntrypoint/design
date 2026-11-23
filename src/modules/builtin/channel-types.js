import { registerModule, registerGroup } from '../registry.js';
import { forumBody, pageBody } from './page-surfaces.js';

registerGroup({ id: 'info', label: 'Information', order: 1, voice: false, createType: null, always: true });
registerGroup({ id: 'text', label: 'Text Channels', order: 2, voice: false, createType: 'text', always: true });
registerGroup({ id: 'voice', label: 'Voice Channels', order: 3, voice: true, createType: 'voice', always: true });

const def = (type, label, icon, group, extra = {}) => registerModule({ id: 'type-' + type, kind: 'channelType', channelType: { type, label, icon, railGroup: group, headerSub: type, traits: {}, ...extra } });

def('text', 'Text', 'ref-hash', 'text', { headerSub: 'public', searchGlyph: '#', traits: { composer: 'standard', members: true, split: true, mentions: true } });
def('voice', 'Voice', 'ref-speaker', 'voice', { searchGlyph: 'voice', traits: { voice: true, members: false }, body: ({ s, views }) => views.voice(s) });
def('announcement', 'Announcement', 'ref-mega', 'info', { welcomeGlyph: 'megaphone', traits: { composer: 'standard', members: true } });
def('threaded', 'Threaded', 'ref-thread', 'voice', { headerSub: 'public', railIcon: 'circle-dot', traits: { composer: 'standard', members: true } });
def('forum', 'Forum', 'ref-forum', 'text', { traits: { members: true }, body: forumBody });
def('page', 'Page', 'ref-rules', 'info', { traits: { members: true }, body: pageBody });
