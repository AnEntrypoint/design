import * as webjsx from '../../vendor/webjsx/index.js';
import { groupOf } from '../modules/index.js';
import { Game3VoiceView } from '../components/game3-voice.js';

const h = webjsx.createElement;

export function createVoiceView(app, { rail }) {
    const { root, get, A, initial, formatTime, st } = app;
    const render = () => app.render();
    const { railOrder } = rail;

    const voiceView = (s) => {
        const participants = s.voiceParticipants || [];
        const textChannel = railOrder(s).find(c => groupOf(c) === 'text');
        return h('div', { class: 'vx-view' },
            Game3VoiceView({
                participants: participants.map((p, i) => ({ id: p.identity || p.id || String(i), name: p.name || p.identity || 'user', speaking: !!p.speaking, muted: !!p.muted, videoKey: p.videoKey || null, isLocal: !!p.isLocal })),
                micMuted: !!s.micMuted,
                camera: !!s.cameraOn,
                onCamera: () => A.toggleCamera && A.toggleCamera(),
                textName: textChannel ? textChannel.name : 'general',
                onText: () => { if (textChannel && A.switchChannel) A.switchChannel(textChannel); },
                onMic: () => A.toggleMic && A.toggleMic(),
                onLeave: () => A.leaveVoice && A.leaveVoice(),
                sounds: s.soundboard || [],
                voiceName: s.voiceChannelName || (s.currentChannel && s.currentChannel.name) || '',
                soundToast: st.soundToast,
                onSound: (id) => { const snd = (s.soundboard || []).find((x) => x.id === id); if (snd) { st.soundToast = { e: snd.e, name: snd.name, who: 'You' }; setTimeout(() => { st.soundToast = null; render(); }, 3000); } if (A.playSound) A.playSound(id); render(); },
            }),
        );
    };

    return { voiceView };
}
