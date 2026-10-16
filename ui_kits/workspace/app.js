import * as webjsx from 'webjsx';
import { WorkspaceShell, WorkspaceRail, Status } from 'ds/components/shell.js';
import { ConversationList, SessionDashboard } from 'ds/components/sessions.js';
import { AgentChat } from 'ds/components/agent-chat.js';
import { PresenceBar } from 'ds/components/collab.js';
import { mountKit } from 'ds/bootstrap.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const sessions = [
    { sid: 's1', title: 'refactor auth middleware', project: 'kit', time: '2m', rail: 'green' },
    { sid: 's2', title: 'debug flaky upload test', project: 'agentgui', time: '18m' },
    { sid: 's3', title: 'draft release notes', project: 'kit', time: '1h' },
    { sid: 's4', title: 'investigate CI timeout', project: 'agentgui', time: '3h', rail: 'flame' },
];

let liveSessions = [
    { sid: 's1', agentName: 'claude', model: 'sonnet', cwd: 'kit', status: 'running', startedAt: Date.now() - 120000 },
    { sid: 's4', agentName: 'codex', model: 'gpt-5', cwd: 'agentgui', status: 'error', startedAt: Date.now() - 900000 },
];

const state = {
    tab: 'chat',
    selectedSid: 's1',
    draft: '',
    busy: false,
    agent: 'claude',
    model: 'sonnet',
    cwd: 'kit',
    cwdEditing: false,
    cwdDraft: '',
    messages: [
        { role: 'user', content: 'on the auth middleware refactor: where should the session-token check live?' },
        { role: 'assistant', parts: [{ kind: 'md', text: 'move it into a single `verifySession(req)` helper called from the route guard, not scattered per-route. two call sites currently duplicate the check, and that is the bug risk.' }] },
    ],
};

const AGENTS = [
    { id: 'claude', name: 'claude' },
    { id: 'codex', name: 'codex' },
];
const MODELS = [
    { id: 'sonnet', name: 'sonnet' },
    { id: 'opus', name: 'opus' },
    { id: 'gpt-5', name: 'gpt-5' },
];

function ChatTab() {
    return AgentChat({
        agents: AGENTS,
        title: 'workspace',
        selectedAgent: state.agent,
        models: MODELS,
        selectedModel: state.model,
        onSelectAgent: (id) => { state.agent = id; render(); },
        onSelectModel: (id) => { state.model = id; render(); },
        messages: state.messages,
        busy: state.busy,
        draft: state.draft,
        cwd: state.cwd,
        cwdEditing: state.cwdEditing,
        cwdDraft: state.cwdDraft,
        onCwdEdit: () => { state.cwdEditing = true; state.cwdDraft = state.cwd; render(); },
        onCwdDraft: (v) => { state.cwdDraft = v; },
        onCwdSave: () => { state.cwd = (state.cwdDraft || '').trim(); state.cwdEditing = false; render(); },
        onCwdCancel: () => { state.cwdEditing = false; state.cwdDraft = ''; render(); },
        onCwdClear: () => { state.cwd = ''; state.cwdEditing = false; render(); },
        onInput: (v) => { state.draft = v; },
        onSend: () => {
            if (!state.draft.trim()) return;
            state.messages.push({ role: 'user', content: state.draft });
            state.draft = '';
            render();
        },
        onNewChat: () => { state.messages = []; render(); },
        canSend: true,
    });
}

function liveSessionsAsPresence() {
    return liveSessions.map((s) => ({
        userId: s.sid,
        label: s.agentName + ' · ' + s.model,
        status: s.status === 'running' ? 'active' : (s.status === 'error' ? 'offline' : 'idle'),
    }));
}

function LiveTab() {
    return h('div', { class: 'ds-workspace-live' },
        PresenceBar({ users: liveSessionsAsPresence() }),
        SessionDashboard({
            sessions: liveSessions,
            streamState: 'connected',
            emptyText: 'no agents running. start one from the chat tab.',
            activeSid: state.selectedSid,
            onStop: (s) => {
                liveSessions = liveSessions.filter((x) => x.sid !== s.sid);
                render();
            },
            onStopAll: () => { liveSessions = []; render(); },
            onOpen: (s) => {
                state.selectedSid = s.sid;
                state.tab = 'chat';
                render();
            },
            onView: (s) => { state.selectedSid = s.sid; render(); },
        })
    );
}

function App() {
    return WorkspaceShell({
        rail: WorkspaceRail({
            brand: '247420',
            items: [
                { label: 'chat', key: 'chat', active: state.tab === 'chat', count: sessions.length,
                  onClick: () => { state.tab = 'chat'; render(); } },
                { label: 'live', key: 'live', active: state.tab === 'live', count: liveSessions.length,
                  rail: liveSessions.some((s) => s.status === 'error') ? 'flame' : null,
                  onClick: () => { state.tab = 'live'; render(); } },
            ],
        }),
        sessions: ConversationList({
            sessions: sessions,
            emptyText: 'no conversations yet. select new chat to start one.',
            selected: state.selectedSid,
            onSelect: (s) => { state.selectedSid = s.sid; render(); },
            onNew: () => {
                state.messages = [];
                state.draft = '';
                state.selectedSid = null;
                state.tab = 'chat';
                render();
            },
        }),
        main: state.tab === 'chat' ? ChatTab() : LiveTab(),
        status: Status({
            left: ['workspace', (sessions.length) + ' conversations', (liveSessions.length) + ' live'],
            right: ['sample data'],
        }),
        stableFrame: true,
    });
}

const kit = mountKit({ root, view: App, screen: 'workspace' });
const render = kit.render;
