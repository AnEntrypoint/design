import { registerModule } from '../registry.js';
import { Game3VoiceThread } from './thread-view.js';

const acts = (A) => ({
    onJoin: () => A.voiceThreadJoin && A.voiceThreadJoin(),
    onLeave: () => A.voiceThreadLeave && A.voiceThreadLeave(),
    onPlay: (seq) => A.voiceThreadPlay && A.voiceThreadPlay(seq),
    onReplay: (seq) => A.voiceThreadReplay && A.voiceThreadReplay(seq),
    onSkip: () => A.voiceThreadSkip && A.voiceThreadSkip(),
    onPause: () => A.voiceThreadPause && A.voiceThreadPause(),
    onVadProfile: (id) => A.voiceThreadVadProfile && A.voiceThreadVadProfile(id),
    onKeep: (on) => A.voiceThreadKeep && A.voiceThreadKeep(on),
});

registerModule({
    id: 'voice-thread',
    kind: 'channelType',
    channelType: {
        type: 'voice-thread',
        label: 'Voice thread',
        icon: 'ref-speaker',
        railIcon: 'ref-thread',
        railGroup: 'voice',
        headerSub: 'voice thread',
        searchGlyph: 'voice',
        traits: { members: true },
        body: ({ s, A }) => Game3VoiceThread({ thread: s.voiceThread, acts: acts(A) }),
    },
});
