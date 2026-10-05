import { makeThreadAutoScroll } from '../chat.js';

const baseAutoScroll = (msgCount) => makeThreadAutoScroll(() => msgCount);

const NEAR_BOTTOM_PX = 80;

export const MESSAGE_CAP = 100;
export const STREAM_TAIL_THRESHOLD = 20000;
export const STREAM_TAIL_WINDOW = 4000;

export const threadRef = (msgCount) => {
  const auto = baseAutoScroll(msgCount);
  return (el) => {
    if (!el) return;
    const disposeAuto = auto(el);
    const jumpBtn = () => el.parentElement && el.parentElement.querySelector('.agentchat-jump');
    const update = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
      const btn = jumpBtn();
      if (btn) btn.classList.toggle('show', !atBottom);
    };
    el.addEventListener('scroll', update, { passive: true });
    requestAnimationFrame(update);
    return () => { el.removeEventListener('scroll', update); if (typeof disposeAuto === 'function') disposeAuto(); };
  };
};

export function scrollThreadToBottom(btn) {
  const wrap = btn.closest('.agentchat-thread-wrap');
  const thread = wrap && wrap.querySelector('.agentchat-thread');
  if (thread) thread.scrollTop = thread.scrollHeight;
}
