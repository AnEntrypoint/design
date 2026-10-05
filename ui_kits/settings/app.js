import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, Side, AppShell, Heading, Lede, Icon } from 'ds/components/shell.js';
import { Panel, Row } from 'ds/components/content.js';
import { Toggle as DsToggle, Field as DsField, useFormValidation } from 'ds/components/form-primitives.js';
import { toast } from 'ds/components/editor-primitives.js';
import { Modal, ConfirmDialog } from 'ds/components/files-modals.js';
import { mountKit } from 'ds/bootstrap.js';
import { shortUid } from 'ds/uid.js';
const h = webjsx.createElement;

const root = document.getElementById('root');

const state = {
    section: 'profile',
    name: 'sample user',
    email: 'sample@example.test',
    handle: '@sample-user',
    bio: 'maintainer. reviews pull requests and publishes releases.',
    theme: 'auto',
    motion: true,
    notify: { mentions: true, releases: true, marketing: false },
    api_key: 'ds-live-*******-c2a',
    dirty: false,
    lastSaved: null,
    draft: null,
    showConfirmDiscard: false,
    showConfirmDelete: false,
    showRestorePrompt: false
};

const profileValidation = useFormValidation({
    name:  [{ rule: 'required', message: 'name is required.' }],
    email: [{ rule: 'required', message: 'email is required.' }, { rule: 'email', message: 'enter a valid email address.' }]
});

const sections = [
    { id: 'profile',   label: 'profile',      icon: 'user' },
    { id: 'theme',     label: 'theme',        icon: 'settings' },
    { id: 'notify',    label: 'notifications',icon: 'megaphone' },
    { id: 'api',       label: 'api keys',     icon: 'lock' },
    { id: 'danger',    label: 'danger zone',  icon: 'warn' }
];

function saveDraft() {
    const draft = {
        name: state.name,
        email: state.email,
        handle: state.handle,
        bio: state.bio,
        theme: state.theme,
        motion: state.motion,
        notify: { ...state.notify },
        timestamp: Date.now()
    };
    localStorage.setItem('settings-draft', JSON.stringify(draft));
    state.draft = draft;
}

function loadDraft() {
    const stored = localStorage.getItem('settings-draft');
    if (stored) {
        try {
            const draft = JSON.parse(stored);
            state.draft = draft;
            return draft;
        } catch (e) {
            return null;
        }
    }
    return null;
}

function restoreDraft(draft) {
    if (draft) {
        state.name = draft.name;
        state.email = draft.email;
        state.handle = draft.handle;
        state.bio = draft.bio;
        state.theme = draft.theme;
        state.motion = draft.motion;
        state.notify = { ...draft.notify };
    }
}

function clearDraft() {
    localStorage.removeItem('settings-draft');
    state.draft = null;
}

function DiscardConfirmModal({ onConfirm, onCancel }) {
    const draft = state.draft;
    const timestamp = draft?.timestamp ? new Date(draft.timestamp).toLocaleString() : 'an unknown time';
    return Modal({
        onClose: onCancel,
        kind: 'small',
        head: 'discard unsaved changes?',
        bodyClass: 'ds-modal-body ds-modal-body-form',
        body: [
            h('p', { class: 'ds-modal-note' }, 'you have unsaved changes. a draft was saved at ' + timestamp + '.'),
            h('div', { class: 'ds-draft-preview' },
                'name: ' + state.name, h('br'), 'email: ' + state.email, h('br'),
                draft && draft.theme && draft.theme !== 'auto' ? ['theme: ' + draft.theme, h('br')] : null
            )
        ],
        actions: [
            h('button', { class: 'btn', onclick: () => { restoreDraft(draft); onCancel(); } }, 'restore draft'),
            h('button', { class: 'btn btn-primary danger ds-btn-warn', onclick: onConfirm }, 'discard and continue')
        ]
    });
}

function RestoreDraftModal({ onRestore, onDismiss }) {
    const draft = state.draft;
    const timestamp = draft?.timestamp ? new Date(draft.timestamp).toLocaleString() : 'an unknown time';
    return Modal({
        onClose: onDismiss,
        kind: 'small',
        head: 'restore unsaved draft?',
        bodyClass: 'ds-modal-body ds-modal-body-form',
        body: [
            h('p', { class: 'ds-modal-note' }, 'a draft from a previous session was saved at ' + timestamp + '.'),
            h('div', { class: 'ds-draft-preview' },
                'name: ' + (draft?.name ?? '') , h('br'), 'email: ' + (draft?.email ?? '')
            )
        ],
        actions: [
            h('button', { class: 'btn', onclick: onDismiss }, 'discard draft'),
            h('button', { class: 'btn btn-primary', onclick: onRestore }, 'restore draft')
        ]
    });
}

function Field({ label, hint, children }) {
    return DsField({ label, hint, children });
}

function Toggle({ on, onChange, label }) {
    return DsToggle({
        checked: on,
        label,
        onChange: (v) => { onChange(v); state.dirty = true; kit.render(); }
    });
}

function validateProfileField(name, value) {
    profileValidation.validateField(name, value);
    kit.render();
}

function onSaveClick() {
    const { valid } = profileValidation.validate({ name: state.name, email: state.email });
    if (!valid) {
        state.section = 'profile';
        toast({ message: 'could not save. fix the highlighted fields.', kind: 'error' });
        kit.render();
        return;
    }
    saveDraft();
    state.dirty = false;
    state.lastSaved = Date.now();
    toast({ message: 'settings saved.', kind: 'success' });
    kit.render();
}

function autoGrowBio(el) {
    if (!el) return;
    requestAnimationFrame(() => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    });
}

function Profile() {
    return Panel({ title: 'profile', class: 'ds-panel-gap', children: h('div', { class: 'ds-settings-body' },
        DsField({ label: 'name', hint: profileValidation.errors.name ? null : 'shown on commits and PRs.', error: profileValidation.errors.name, required: true, children:
            h('input', { class: 'input', value: state.name,
                oninput: (e) => { state.name = e.target.value; state.dirty = true; saveDraft(); kit.render(); },
                onblur: (e) => validateProfileField('name', e.target.value) }) }),
        DsField({ label: 'email', hint: profileValidation.errors.email ? null : 'used for git identity. never mailed.', error: profileValidation.errors.email, required: true, children:
            h('input', { class: 'input', type: 'email', value: state.email,
                oninput: (e) => { state.email = e.target.value; state.dirty = true; saveDraft(); kit.render(); },
                onblur: (e) => validateProfileField('email', e.target.value) }) }),
        Field({ label: 'handle', children:
            h('input', { class: 'input', value: state.handle, oninput: (e) => { state.handle = e.target.value; state.dirty = true; saveDraft(); kit.render(); } }) }),
        Field({ label: 'bio', hint: 'one sentence. plain text.', children:
            h('textarea', { class: 'input ds-bio-input', rows: 2,
                ref: autoGrowBio,
                oninput: (e) => { state.bio = e.target.value; state.dirty = true; saveDraft(); autoGrowBio(e.target); kit.render(); } }, state.bio) })
    ) });
}

function Theme() {
    const opts = [['auto', 'auto'], ['light', 'light'], ['dark', 'dark']];
    return Panel({ title: 'theme', class: 'ds-panel-gap', children: h('div', { class: 'ds-settings-body' },
        Field({ label: 'mode', children: h('div', { class: 'ds-btn-row ds-btn-row-tight' },
            ...opts.map(([k, l]) => h('button', { key: k,
                class: state.theme === k ? 'btn btn-primary' : 'btn',
                onclick: () => { state.theme = k; state.dirty = true; kit.render(); } }, l))
        ) }),
        Field({ label: 'motion', hint: 'honour prefers-reduced-motion regardless.', children:
            Toggle({ on: state.motion, onChange: (v) => state.motion = v, label: state.motion ? 'animations on' : 'animations off' }) })
    ) });
}

function Notify() {
    return Panel({ title: 'notifications', class: 'ds-panel-gap', children: [
        Row({ key: 'n1', title: 'mentions',  sub: 'when someone @s you',        meta: Toggle({ on: state.notify.mentions,  onChange: (v) => state.notify.mentions = v }) }),
        Row({ key: 'n2', title: 'releases',  sub: 'on every tagged build',      meta: Toggle({ on: state.notify.releases,  onChange: (v) => state.notify.releases = v }) }),
        Row({ key: 'n3', title: 'marketing', sub: 'occasional product updates', meta: Toggle({ on: state.notify.marketing, onChange: (v) => state.notify.marketing = v }) })
    ] });
}

function ApiKeys() {
    return Panel({ title: 'api keys', count: 1, class: 'ds-panel-gap', children: h('div', { class: 'ds-settings-body' },
        Field({ label: 'production key', hint: 'rotate quarterly.', children:
            h('div', { class: 'ds-btn-row' },
                h('input', { class: 'input ds-key-input', value: state.api_key, readonly: true }),
                h('button', { class: 'btn', onclick: () => { navigator.clipboard?.writeText(state.api_key); } }, 'copy'),
                h('button', { class: 'btn', onclick: () => { state.api_key = 'ds-live-' + shortUid(8) + '-' + shortUid(5); state.dirty = true; kit.render(); } }, 'rotate')
            ) })
    ) });
}

function Danger() {
    return Panel({ title: 'danger zone', kind: 'danger', class: 'ds-panel-gap', children: h('div', { class: 'ds-settings-body ds-settings-body-stack' },
        h('p', { class: 'ds-note-quiet' }, 'these actions are permanent.'),
        h('div', { class: 'ds-btn-row' },
            h('button', { class: 'btn' }, 'export account'),
            h('button', { class: 'btn ds-btn-warn', onclick: () => { state.showConfirmDelete = true; kit.render(); } }, 'delete account')
        )
    ) });
}

function DeleteConfirmModal({ onConfirm, onCancel }) {
    return ConfirmDialog({
        title: 'delete account?',
        message: 'this permanently deletes your account and cannot be undone. there is no recovery.',
        confirmLabel: 'delete account',
        destructive: true,
        onConfirm,
        onCancel
    });
}

function App() {
    const view = { profile: Profile, theme: Theme, notify: Notify, api: ApiKeys, danger: Danger }[state.section]();
    return AppShell({
        topbar: Topbar({ brand: '247420', leaf: 'settings', items: [['index', '../../'], ['source', 'https://github.com/AnEntrypoint/design']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: 'settings · ' + state.section }),
        side: Side({
            sections: [
                { group: 'sections', items: sections.map((s) => ({
                    glyph: Icon(s.icon, { size: 14 }), label: s.label,
                    href: '#' + s.id, active: state.section === s.id, key: s.id,
                    onClick: (e) => { e.preventDefault(); state.section = s.id; kit.render(); }
                })) }
            ]
        }),
        main: [
            h('div', { class: 'ds-settings-main' },
              h('div', { class: 'ds-app-surface ds-settings-scroll' },
                Heading({ level: 1, children: 'settings' }),
                Lede({ children: 'account preferences for ' + state.name + '.' }),
                view),
                state.showRestorePrompt ? RestoreDraftModal({
                    onDismiss: () => { clearDraft(); state.showRestorePrompt = false; kit.render(); },
                    onRestore: () => { restoreDraft(state.draft); state.dirty = true; state.showRestorePrompt = false; kit.render(); }
                }) : null,
                state.showConfirmDiscard ? DiscardConfirmModal({
                    onCancel: () => { state.showConfirmDiscard = false; kit.render(); },
                    onConfirm: () => { state.dirty = false; clearDraft(); state.showConfirmDiscard = false; kit.render(); }
                }) : null,
                state.showConfirmDelete ? DeleteConfirmModal({
                    onCancel: () => { state.showConfirmDelete = false; kit.render(); },
                    onConfirm: () => { state.showConfirmDelete = false; state.section = 'profile'; kit.render(); }
                }) : null,
                h('div', { class: 'ds-savebar' },
                    h('span', { class: 'ds-savebar-note', role: 'status' }, state.dirty ? 'unsaved changes · draft auto-saved' : (state.lastSaved ? 'saved at ' + new Date(state.lastSaved).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'no unsaved changes')),
                    h('button', { class: 'btn', disabled: !state.dirty, onclick: () => { state.showConfirmDiscard = true; kit.render(); } }, 'discard'),
                    h('button', { class: 'btn btn-primary', disabled: !state.dirty, onclick: onSaveClick }, 'save')
                )
            )
        ],
        status: Status({
            left: ['settings', state.section, state.dirty ? 'unsaved changes' : (state.lastSaved ? 'saved' : 'no changes')],
            right: ['sample data']
        })
    });
}

if (loadDraft()) state.showRestorePrompt = true;

const kit = mountKit({ root, view: App, screen: '10 Settings' });
