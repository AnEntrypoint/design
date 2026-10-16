import * as webjsx from '../../../../vendor/webjsx/index.js';
import { AgentChat } from '../../agent-chat.js';
import { WorkspaceShell, WorkspaceRail } from '../../shell/workspace-shell.js';
import { ConversationList } from '../../sessions/conversation-list.js';
import { noteAlert } from '../shared.js';

const h = webjsx.createElement;

export function createChatView(ctx, { files, lifecycle, sender, panels, search }) {
    return () => {
        const st = ctx.state;
        const attachRow = h('div', { class: 'fd-chat-attach-row' },
            h('label', { class: 'fd-chat-attach', title: 'attach files to the next message' },
                'attach',
                h('input', { type: 'file', multiple: true, style: 'display:none', onchange: (e) => { files.attachFiles(e.target.files); e.target.value = ''; } })),
            ...st.staged.map((f, i) => h('span', { key: 'st' + i, class: 'fd-chat-staged' },
                f.name,
                h('button', { type: 'button', class: 'fd-chat-staged-x', 'aria-label': 'remove ' + f.name, onclick: () => { st.staged = st.staged.filter((_, j) => j !== i); ctx.rerender(); } }, '×'))));
        return WorkspaceShell({
            stableFrame: true,
            rail: WorkspaceRail({
                brand: 'freddie',
                action: { label: 'Sessions', icon: 'thread', onClick: () => { location.hash = '#fd-sessions'; } },
                items: [{ key: 'chat', label: 'Chat', icon: 'forum', active: true }],
            }),
            sessions: ConversationList({
                sessions: st.sessions.map(row => ({ sid: row.id, title: row.title, time: row.time, rail: row.needsInput ? 'flame' : null })),
                selected: st.sessionId,
                onSelect: (row) => lifecycle.switchSession(row.sid),
onNew: () => lifecycle.startNewSession(false),
                newLabel: 'New chat',
                emptyText: 'No conversations yet',
            }),
            main: [
                search.messageSearchOverlay(),
                attachRow,
                AgentChat({
                    messages: st.messages,
                    busy: st.busy,
                    draft: st.draft,
                    status: st.busy ? 'streaming…' : (st.conn === 'open' ? 'ready' : 'connecting…'),
                    agentName: 'freddie',
                    selectedAgent: 'freddie',
                    models: st.models,
                    selectedModel: st.model,
                    onSelectModel: (v) => { st.model = v; ctx.rerender(); },
                    cwd: st.cwd,
                    cwdEditing: st.cwdEditing,
                    cwdDraft: st.cwdDraft,
                    onCwdEdit: () => { st.cwdEditing = true; st.cwdDraft = st.cwd; ctx.rerender(); },
                    onCwdDraft: (v) => { st.cwdDraft = v; },
                    onCwdSave: () => { st.cwd = (st.cwdDraft || '').trim(); st.cwdEditing = false; ctx.rerender(); },
                    onCwdCancel: () => { st.cwdEditing = false; ctx.rerender(); },
                    onCwdClear: () => { st.cwd = ''; st.cwdEditing = false; ctx.rerender(); },
                    placeholder: st.busy ? 'queue a follow-up… (or stop)' : 'message…',
                    mentionFiles: st.workspaceFiles,
                    showMinimap: true,
                    banners: st.error ? [noteAlert({ kind: 'error', msg: st.error })] : [],
                    onInput: (v) => { st.draft = v; },
                    onSend: sender.send,
                    onStop: sender.stop,
onNewChat: () => lifecycle.startNewSession(true),
                }),
            ],
            pane: panels.sessionMuxPanel(),
            paneLabel: 'session mux',
        });
    };
}
