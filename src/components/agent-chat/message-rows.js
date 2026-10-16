import { ChatMessage } from '../chat.js';
import { STREAM_TAIL_THRESHOLD, STREAM_TAIL_WINDOW } from './thread-behaviour.js';

export const msgHasBody = (m) => !!(m.content || m.error || (Array.isArray(m.parts) && m.parts.length));

export function buildMessageRows({ messages, msgStart, lastIdx, busy, name, avatar,
                                   onCopyMessage, onRetryMessage, onEditMessage, confirmEdit, onArmEdit }) {
  return messages.slice(msgStart).map((m, wi) => {
    const i = wi + msgStart;
    const isAssistant = m.role === 'assistant';
    const isStreaming = busy && i === lastIdx && isAssistant;
    const hasParts = Array.isArray(m.parts) && m.parts.length > 0;
    const emptyStreaming = isStreaming && !msgHasBody(m);
    if (!isStreaming && isAssistant && !msgHasBody(m)) return null;
    const parts = [];
    if (hasParts) {
      for (const p of m.parts) {
        const part = (p && typeof p === 'object' && p.kind) ? p : { kind: 'text', text: String(p) };
        if (isStreaming && part.kind === 'md') {
          const txt = part.text || '';
          if (txt.length > STREAM_TAIL_THRESHOLD) {
            parts.push({ kind: 'text', mdShell: true, preShell: true,
              text: txt.slice(-STREAM_TAIL_WINDOW),
              streamHead: 'streaming · ' + Math.round(txt.length / 1024) + ' KB so far' });
            continue;
          }
          if (part.text && part.text.indexOf('```') !== -1) parts.push({ kind: 'text', text: part.text, mdShell: true, preShell: true });
          else parts.push({ kind: 'text', text: part.text, mdShell: true });
        }
        else if (!isStreaming && part.kind === 'thinking') parts.push({ kind: 'thinking', settled: true, text: part.text });
        else parts.push(part);
      }
    }
    const partsHaveProse = parts.some(p => p.kind === 'md' || p.kind === 'text');
    if (m.content && !partsHaveProse) parts.unshift({ kind: isAssistant ? 'md' : 'text', text: m.content });
    const streaming = isStreaming && msgHasBody(m);
    if (streaming && parts.length) {
      const lastPart = parts[parts.length - 1];
      if (lastPart && (lastPart.kind === 'text' || lastPart.kind === 'md')) {
        parts[parts.length - 1] = { ...lastPart, streamingCaret: true };
      }
    }
    let actions;
    if (!isStreaming && msgHasBody(m)) {
      const built = [];
      if (onCopyMessage) built.push({ label: 'copy', icon: 'copy', title: 'copy message', onClick: () => onCopyMessage(m) });
      if (isAssistant && onRetryMessage) built.push({ label: 'retry', icon: 'refresh', title: 'retry this turn', onClick: () => onRetryMessage(m) });
      if (!isAssistant && onRetryMessage && i === lastIdx) built.push({ label: 'retry', icon: 'refresh', title: 'retry', onClick: () => onRetryMessage(m) });
      if (!isAssistant && onEditMessage) built.push({ label: 'edit', icon: 'pencil', title: 'edit and resend',
        onClick: () => (confirmEdit && onArmEdit) ? onArmEdit(m) : onEditMessage(m) });
      if (built.length) actions = built;
    }
    return ChatMessage({
      key: m.id || String(i),
      id: m.id ? 'msg-' + m.id : undefined,
      role: isAssistant ? 'assistant' : 'user',
      flat: true,
      aicat: false,
      avatar: isAssistant ? (m.avatar != null ? m.avatar : avatar) : undefined,
      name: isAssistant ? name : 'you',
      time: m.time || '',
      typing: emptyStreaming,
      streaming,
      actions,
      stopped: m.stopped,
      incomplete: m.incomplete,
      error: i === lastIdx ? m.error : undefined,
      onRetry: (i === lastIdx && m.error && onRetryMessage) ? () => onRetryMessage(m) : undefined,
      parts: emptyStreaming ? undefined : (parts.length ? parts : [{ kind: 'text', text: '' }]),
    });
  });
}
