import { attempt, ignoreFailure } from '../../best-effort.js';

let _cueCtx = null;
function getCueCtx() {
    if (_cueCtx && _cueCtx.state !== 'closed') return _cueCtx;
    try { _cueCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
    return _cueCtx;
}

export function playCompletionCue() {
    const ctx = getCueCtx();
    if (!ctx) return;
    const play = () => {
        attempt(() => { const now = ctx.currentTime; [523.25, 659.25].forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine'; osc.frequency.value = freq; const t = now + i * 0.18; gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.18, t + 0.02); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45); osc.start(t); osc.stop(t + 0.45); }); });
    };
    if (ctx.state === 'suspended') { ctx.resume().then(play).catch(ignoreFailure); return; }
    play();
}
