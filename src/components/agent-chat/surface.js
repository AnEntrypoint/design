import * as webjsx from '../../../vendor/webjsx/index.js';
import { ChatComposer } from '../chat.js';
import { Icon } from '../shell.js';
import { SplitPanel } from '../editor-primitives.js';
import { initializeCachesEagerly } from '../../markdown-cache.js';
import { ChatMinimap } from '../chat-minimap.js';
import { threadRef, scrollThreadToBottom, MESSAGE_CAP } from './thread-behaviour.js';
import { AgentControls, CwdBar } from './controls.js';
import { buildMessageRows, msgHasBody } from './message-rows.js';
import { AgentEmptyState, FollowupRow } from './empty-state.js';

const h = webjsx.createElement;

export function AgentChat(props = {}) {
  const {
    agents = [], selectedAgent = '', models = [], selectedModel = '', modelsLoading = false, agentsLoading = false,
    messages = [], busy = false, draft = '', status, banners = [],
    cwd = '', cwdEditing = false, cwdDraft, cwdError, cwdChecking = false,
    cwdRoots, cwdRecent, cwdBrowse, defaultCwd,
    agentName, title, placeholder,
    onSelectAgent, onSelectModel, onSend, onStop, onNewChat, onInput,
    onCwdEdit, onCwdSave, onCwdCancel, onCwdClear, onCwdDraft,
    onCwdBrowseToggle, onCwdBrowseCrumb, onCwdBrowseEnter, onCwdBrowsePick,
    canSend = true,
    suggestions = [], onSuggestionClick,
    onCopyMessage, onRetryMessage, onEditMessage,
    confirmEdit = false, onArmEdit,
    avatar, composerContext,
    followups = [], onFollowupClick,
    installHint, exportActions = [],
    onPasteFiles, onDropFiles, onEmoji,
    shownMessages, onShowEarlier,
    streamingSince, detectAttachment,
    mentionFiles,
    showMinimap = false,
    sidePanel, sidePanelTitle = 'preview', onCloseSidePanel,
  } = props;

  initializeCachesEagerly().catch((err) => console.warn('[247420] cache init error:', err));

  const name = agentName || (agents.find((a) => a.id === selectedAgent)?.name) || selectedAgent || 'agent';
  const lastIdx = messages.length - 1;
  const lastMsg = messages[lastIdx];
  const msgLimit = shownMessages != null ? shownMessages : MESSAGE_CAP;
  const msgStart = Math.max(0, messages.length - msgLimit);
  const lastMsgLastPart = lastMsg && Array.isArray(lastMsg.parts) && lastMsg.parts.length ? lastMsg.parts[lastMsg.parts.length - 1] : null;
  const showWorkingTail = busy && lastMsg && lastMsg.role === 'assistant' && msgHasBody(lastMsg)
    && lastMsgLastPart && lastMsgLastPart.kind === 'tool' && lastMsgLastPart.status === 'running';
  const rows = buildMessageRows({ messages, msgStart, lastIdx, busy, name, avatar,
                                 onCopyMessage, onRetryMessage, onEditMessage, confirmEdit, onArmEdit });
  const earlierRow = msgStart > 0
    ? h('div', { key: '_earlier', class: 'agentchat-earlier' },
        h('span', { class: 'agentchat-earlier-count', role: 'status', 'aria-live': 'polite' },
          'showing ' + (messages.length - msgStart) + ' of ' + messages.length + ' turns'),
        onShowEarlier ? h('button', { type: 'button', class: 'agentchat-earlier-btn',
          onclick: () => onShowEarlier(Math.min(messages.length, msgLimit + MESSAGE_CAP)) },
          'show ' + Math.min(MESSAGE_CAP, msgStart) + ' earlier turns') : null)
    : null;

  const composer = ChatComposer({
    value: draft,
    disabled: !canSend,
    busy,
    placeholder: placeholder || (selectedAgent ? 'message…' : 'choose an agent first'),
    onInput: (v) => onInput && onInput(v),
    onSend: (v) => onSend && onSend(v),
    onCancel: busy && onStop ? () => onStop() : undefined,
    context: composerContext,
    onPasteFiles,
    onDropFiles,
    onEmoji,
    streamingSince,
    detectAttachment,
    mentionFiles,
  });

  const followupRow = (!busy && followups && followups.length && lastMsg && lastMsg.role === 'assistant' && msgHasBody(lastMsg))
    ? FollowupRow({ followups, onFollowupClick, onSuggestionClick })
    : null;

  const emptyState = (messages.length === 0)
    ? AgentEmptyState({ name, selectedAgent, suggestions, onSuggestionClick, installHint })
    : null;

  const threadElHolder = { el: null };
  const combinedThreadRef = (el) => {
    threadElHolder.el = el;
    const dispose = threadRef(messages.length)(el);
    return dispose;
  };

  const threadBody = h('div', { class: 'agentchat-thread-wrap' },
    h('div', { class: 'agentchat-thread', ref: combinedThreadRef, role: 'log', 'aria-label': 'conversation', 'aria-live': 'polite', 'aria-relevant': 'additions' },
      emptyState,
      earlierRow,
      ...rows.filter(Boolean),
      showWorkingTail
        ? h('div', { key: '_working', class: 'agentchat-working', role: 'status', 'aria-live': 'polite' },
            h('span', { class: 'chat-thinking-dots', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')),
            h('span', { class: 'agentchat-working-text' }, 'working…'))
        : null,
      followupRow),
    h('button', { class: 'agentchat-jump', type: 'button', 'aria-label': 'jump to latest', title: 'jump to latest',
      onclick: (e) => scrollThreadToBottom(e.currentTarget) },
      Icon('arrow-down', { size: 16 }), h('span', { class: 'agentchat-jump-label' }, 'latest')),
    showMinimap
      ? ChatMinimap({ messages, getThreadEl: () => threadElHolder.el })
      : null);

  const mainColumn = h('div', { class: 'agentchat-main-col' },
    h('div', { class: 'agentchat-head' },
      h('h1', { class: 'agentchat-title' }, title || name + (selectedModel ? ' · ' + selectedModel : '')),
      h('span', { class: 'agentchat-sub', 'aria-hidden': busy ? 'true' : null },
        busy ? (status || 'streaming…') : (messages.length ? messages.length + (messages.length === 1 ? ' message' : ' messages') : ''))),
    threadBody,
    composer);

  const body = sidePanel
    ? SplitPanel({ orientation: 'horizontal', initial: '55%', min: 320,
        children: [
          mainColumn,
          h('div', { class: 'agentchat-side-panel' },
            h('div', { class: 'agentchat-side-panel-head' },
              h('span', { class: 'agentchat-side-panel-title' }, sidePanelTitle),
              onCloseSidePanel
                ? h('button', { type: 'button', class: 'agentchat-side-panel-close', 'aria-label': 'close preview', title: 'close preview', onclick: onCloseSidePanel }, Icon('x', { size: 14 }))
                : null),
            h('div', { class: 'agentchat-side-panel-body' }, sidePanel)),
        ] })
    : mainColumn;

  return h('div', { class: 'agentchat' + (sidePanel ? ' has-side-panel' : '') },
    AgentControls({ agents, selectedAgent, models, selectedModel, busy, status, modelsLoading, agentsLoading,
                    onSelectAgent, onSelectModel, onNewChat, onStop, exportActions }),
    CwdBar({ cwd, editing: cwdEditing, draft: cwdDraft, error: cwdError, checking: cwdChecking,
             roots: cwdRoots, recent: cwdRecent, browse: cwdBrowse, defaultCwd,
             onEdit: onCwdEdit, onSave: onCwdSave, onCancel: onCwdCancel, onClear: onCwdClear, onDraft: onCwdDraft,
             onBrowseToggle: onCwdBrowseToggle, onBrowseCrumb: onCwdBrowseCrumb, onBrowseEnter: onCwdBrowseEnter, onBrowsePick: onCwdBrowsePick }),
    ...(banners || []).filter(Boolean),
    body,
  );
}
