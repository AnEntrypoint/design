import { makePage, api, loadingState, emptyState } from '../runtime.js';
import { Table, PageHeader } from '../../content.js';
import { Chip } from '../../shell.js';
import { section } from '../shared.js';

export const voice = makePage((ctx) => {
    async function load() {
        try { const v = await api('/api/voice/status').catch(() => null); ctx.set({ loading: false, voice: v, error: null }); }
        catch (e) { ctx.failLoad(e); }
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading voice config…');
        const v = s.voice;
        const tts = v && v.tts;
        const stt = v && v.stt;
        const enabled = !!((tts && tts.available) || (stt && stt.available));
        return [
            PageHeader({ title: 'voice', lede: 'voice surfaces', right: enabled ? Chip({ tone: 'ok', children: 'enabled' }) : Chip({ tone: 'neutral', children: 'not configured' }) }),
            enabled
                ? section('backends', Table({
                    headers: ['capability', 'status', 'provider'],
                    rows: [
                        ['transcription (stt)', stt && stt.available ? Chip({ tone: 'ok', children: 'on' }) : Chip({ tone: 'neutral', children: 'off' }), (stt && stt.provider) || 'none'],
                        ['speech (tts)', tts && tts.available ? Chip({ tone: 'ok', children: 'on' }) : Chip({ tone: 'neutral', children: 'off' }), (tts && tts.provider) || 'none'],
                    ],
                }))
                : section('status', emptyState('no voice backend wired in this build. set OPENAI_API_KEY or ELEVENLABS_API_KEY to enable.')),
        ];
    };
});
