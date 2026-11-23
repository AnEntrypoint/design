import * as webjsx from '../../vendor/webjsx/index.js';
import { Game3Modal } from './game3-modal.js';

const h = webjsx.createElement;

const SWATCHES = ['#c4602f', '#5865f2', '#eb459e', '#9b84ee', '#1abc9c', '#f1c40f', '#57f287', '#2b2d31'];

const activate = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } };

export const menuKeys = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    const items = [...e.currentTarget.querySelectorAll('[role=menuitem], input, select')].filter((el) => !el.disabled);
    if (!items.length) return;
    e.preventDefault();
    const at = items.indexOf(document.activeElement);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
};

const item = (key, label, onClick, opts = {}) => h('div', { key, role: 'menuitem', tabindex: '0', class: opts.cls || null, 'aria-disabled': opts.disabled ? 'true' : null, onclick: opts.disabled ? null : onClick, onkeydown: activate(onClick) },
    h('span', { class: 'ds-g3-mi-label' }, label), opts.hint ? h('span', { class: 'ds-g3-mi-hint' }, opts.hint) : null);

const noteLine = (note, keys) => (note && keys.includes(note.key) ? h('div', { key: 'note', class: 'ds-g3-mi-note' + (note.ok ? '' : ' ds-g3-mi-err'), role: 'status' }, note.text) : null);

export function Game3AvatarMenu({ hasPicture = false, note = null, onGenerate, onUpload, onUrl, onRemove } = {}) {
    return h('div', { key: 'avmenu', class: 'ds-g3-statusmenu ds-g3-avmenu', role: 'menu', 'aria-label': 'avatar', onkeydown: menuKeys },
        item('gen', 'Generate a picture', () => onGenerate && onGenerate()),
        h('label', { key: 'up', role: 'menuitem', tabindex: '0', class: 'ds-g3-filemi', onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.querySelector('input').click(); } } },
            h('span', { class: 'ds-g3-mi-label' }, 'Upload a picture'),
            h('input', { type: 'file', class: 'ds-g3-fileinput', accept: 'image/png,image/jpeg,image/webp,image/gif', 'aria-label': 'upload a picture', tabindex: '-1', onchange: (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f && onUpload) onUpload(f); } })),
        h('input', { key: 'url', class: 'ds-g3-cst', placeholder: 'or paste an https:// image address', maxlength: '1900', 'aria-label': 'picture address', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter' && onUrl) onUrl(e.target.value); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') menuKeys({ key: e.key, preventDefault: () => e.preventDefault(), currentTarget: e.currentTarget.parentNode }); } }),
        ...(hasPicture ? [item('rm', 'Remove picture', () => onRemove && onRemove())] : []),
        noteLine(note, ['avatar']));
}

export function Game3UserMenu({ npub = '', identities = [], sub = '', note = null, setupLeft = 0, onSub, onEdit, onCopyNpub, onCopyLink, onSwitch, onForget, onImport, onNew, onBackup, onSignOut, onSettings, onSetup } = {}) {
    const short = npub ? npub.slice(0, 10) + '…' + npub.slice(-4) : '';
    const rows = sub === 'identity'
        ? [
            h('div', { key: 'sh', class: 'ds-g3-mi-head' }, 'Switch identity'),
            ...identities.map((i) => h('div', { key: 'id' + i.pubkey, role: 'menuitem', tabindex: '0', class: 'ds-g3-idrow', onclick: () => onSwitch && onSwitch(i.pubkey), onkeydown: activate(() => onSwitch && onSwitch(i.pubkey)) },
                h('span', { class: 'ds-g3-mi-label' }, i.name || i.npub.slice(0, 12) + '…', h('span', { class: 'ds-g3-mi-hint' }, ' ' + (i.kind === 'bunker' ? 'remote signer' : i.npub.slice(0, 10) + '…'))),
                h('span', { class: 'ds-g3-x', role: 'button', tabindex: '0', title: 'Forget this identity', 'aria-label': 'forget ' + (i.name || i.npub.slice(0, 10)), onclick: (e) => { e.stopPropagation(); onForget && onForget(i.pubkey); }, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') onForget && onForget(i.pubkey); } }, '✕'))),
            ...(identities.length ? [] : [h('div', { key: 'none', class: 'ds-g3-mi-hint ds-g3-mi-pad' }, 'no other identities stored in this browser yet')]),
            h('input', { key: 'imp', class: 'ds-g3-cst', type: 'password', autocomplete: 'off', placeholder: 'import a key: nsec1… or hex, Enter', 'aria-label': 'import a key', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter' && onImport) onImport(e.target.value); } }),
            item('new', 'New throwaway identity', () => onNew && onNew()),
            item('back', 'Back', () => onSub && onSub('')),
            h('div', { key: 'sn', class: 'ds-g3-mi-hint ds-g3-mi-pad' }, 'the identity you leave stays stored here so you can switch back'),
        ]
        : [
            item('edit', 'Edit profile', () => onEdit && onEdit()),
            ...(setupLeft ? [item('setup', 'Set up your profile', () => onSetup && onSetup(), { hint: setupLeft + ' left' })] : []),
            h('hr', { key: 'h1' }),
            item('cn', 'Copy npub', () => onCopyNpub && onCopyNpub()),
            item('cl', 'Copy profile link', () => onCopyLink && onCopyLink()),
            h('hr', { key: 'h2' }),
            item('sw', 'Switch identity', () => onSub && onSub('identity'), { hint: '›' }),
            item('bk', 'Back up key', () => onBackup && onBackup()),
            item('st', 'Open settings', () => onSettings && onSettings(), { hint: 'My Account' }),
            h('hr', { key: 'h3' }),
            item('so', 'Sign out', () => onSignOut && onSignOut(), { cls: 'ds-g3-mi-danger' }),
        ];
    return h('div', { key: 'usermenu', class: 'ds-g3-statusmenu ds-g3-usermenu', role: 'menu', 'aria-label': 'account menu', onkeydown: menuKeys }, ...rows, noteLine(note, ['copy', 'identity']));
}

const setupUi = { open: '', draft: {}, confirm: '', rerender: null, reveal: false };
const rr = () => { if (setupUi.rerender) setupUi.rerender(); };

export function setupProgress(a, setup) {
    const pub = a.pub || {};
    const items = [
        ['name', 'Choose a display name', !!pub.name],
        ['avatar', 'Add a picture', !!pub.picture],
        ['about', 'Write an about me', !!pub.about],
        ['pronouns', 'Add your pronouns', !!pub.pronouns],
        ['accent', 'Pick an account colour', !!pub.accent],
        ['banner', 'Style your banner', !!(pub.banner && pub.banner.mode && pub.banner.mode !== 'auto')],
        ['backup', 'Back up your key', !!setup.backedUp || !a.hasPrivkey],
    ];
    return { items: items.map(([key, label, done]) => ({ key, label, done })), done: items.filter((i) => i[2]).length, total: items.length };
}

const field = (k, ph, max, value, onSave, area) => h('div', { class: 'ds-g3-row2' },
    area ? h('textarea', { class: 'ds-g3-fi', rows: '3', maxlength: String(max), placeholder: ph, value: setupUi.draft[k] !== undefined ? setupUi.draft[k] : value, 'aria-label': ph, oninput: (e) => { setupUi.draft[k] = e.target.value; }, onkeydown: (e) => e.stopPropagation() })
        : h('input', { class: 'ds-g3-fi', maxlength: String(max), placeholder: ph, value: setupUi.draft[k] !== undefined ? setupUi.draft[k] : value, 'aria-label': ph, oninput: (e) => { setupUi.draft[k] = e.target.value; }, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') onSave(); } }),
    h('div', { class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: onSave, onkeydown: activate(onSave) }, 'Save'));

const swatchRow = (current, onPick) => h('div', { class: 'ds-g3-swatches' }, ...SWATCHES.map((c) => h('i', { key: c, title: c, class: current === c ? 'on' : '', style: 'background:' + c, role: 'button', tabindex: '0', onclick: () => onPick(c), onkeydown: activate(() => onPick(c)) })));

const stepBody = (key, a, acts) => {
    const pub = a.pub;
    if (key === 'name') return field('name', 'display name', 32, pub.name || '', () => acts.accountRename(setupUi.draft.name !== undefined ? setupUi.draft.name : pub.name || ''));
    if (key === 'about') return field('about', 'tell people about yourself', 190, pub.about || '', () => acts.accountSavePublic('setup', { about: setupUi.draft.about !== undefined ? setupUi.draft.about : pub.about || '' }, 'About me saved'), true);
    if (key === 'pronouns') return field('pronouns', 'she/her, they/them…', 40, pub.pronouns || '', () => acts.accountSavePublic('setup', { pronouns: setupUi.draft.pronouns !== undefined ? setupUi.draft.pronouns : pub.pronouns || '' }, 'Pronouns saved'));
    if (key === 'accent') return swatchRow(pub.accent, (c) => acts.accountSavePublic('setup', { accent: c }, 'Colour saved'));
    if (key === 'banner') return swatchRow(pub.banner && pub.banner.mode === 'colour' ? pub.banner.a : '', (c) => acts.accountSavePublic('setup', { banner: { mode: 'colour', a: c } }, 'Banner saved'));
    if (key === 'avatar') return h('div', { class: 'ds-g3-btnrow' },
        h('div', { class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: () => acts.accountGenerateAvatar(), onkeydown: activate(() => acts.accountGenerateAvatar()) }, 'Generate'),
        h('label', { class: 'ds-g3-evb ds-g3-filebtn' }, 'Upload', h('input', { type: 'file', class: 'ds-g3-fileinput', accept: 'image/png,image/jpeg,image/webp,image/gif', 'aria-label': 'upload a picture', onchange: (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) acts.accountUploadAvatar(f); } })),
        h('input', { class: 'ds-g3-fi', placeholder: 'or paste an https:// image address', maxlength: '1900', 'aria-label': 'picture address', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') acts.accountSavePublic('setup', { picture: e.target.value }, 'Picture saved'); } }));
    if (key === 'backup') {
        const nsec = setupUi.reveal ? acts.accountNsec() : '';
        if (!a.hasPrivkey) return h('p', { class: 'ds-g3-hint' }, 'your key lives in your signer, so there is nothing to back up here.');
        return h('div', { class: 'ds-g3-secret' },
            h('p', { class: 'ds-g3-hint ds-g3-warn' }, 'your secret key is the only way back into this identity. Save it somewhere private.'),
            setupUi.reveal
                ? [h('code', { key: 'c', class: 'ds-g3-code' }, nsec), h('div', { key: 'b', class: 'ds-g3-btnrow' },
                    h('div', { class: 'ds-g3-evb', role: 'button', tabindex: '0', onclick: () => { acts.accountCopyText(nsec, 'Secret key copied'); acts.setupMarkBackedUp(); }, onkeydown: activate(() => { acts.accountCopyText(nsec, 'Secret key copied'); acts.setupMarkBackedUp(); }) }, 'Copy and mark saved'),
                    h('div', { class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: () => { setupUi.reveal = false; acts.setupMarkBackedUp(); }, onkeydown: activate(() => { setupUi.reveal = false; acts.setupMarkBackedUp(); }) }, 'I saved it')) ]
                : h('div', { class: 'ds-g3-evb ds-g3-evb-ghost' + (setupUi.confirm === 'reveal' ? ' ds-g3-evb-armed' : ''), role: 'button', tabindex: '0', onclick: () => { if (setupUi.confirm === 'reveal') { setupUi.confirm = ''; setupUi.reveal = true; rr(); } else { setupUi.confirm = 'reveal'; rr(); setTimeout(() => { setupUi.confirm = ''; rr(); }, 9000); } }, onkeydown: activate((e) => e.currentTarget.click()) }, setupUi.confirm === 'reveal' ? 'Press again: I am in private' : 'Show my secret key'));
    }
    return null;
};

export function Game3SetupPanel({ account, setup, acts, onRender, onClose } = {}) {
    setupUi.rerender = onRender || null;
    if (!setupUi.open && setup.focus) setupUi.open = setup.focus;
    const p = setupProgress(account, setup);
    const note = account.note && (account.note.key === 'setup' || account.note.key === 'rename' || account.note.key === 'avatar') ? account.note : null;
    return Game3Modal({ title: 'Set up your profile', onClose },
        h('div', { key: 'prog', class: 'ds-g3-prog' },
            h('div', { class: 'ds-g3-progbar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(p.total), 'aria-valuenow': String(p.done), 'aria-label': 'profile setup progress' }, h('i', { style: '--ds-g3-prog:' + Math.round(p.done * 100 / p.total) + '%' })),
            h('span', { class: 'ds-g3-hint' }, p.done + ' of ' + p.total + ' done')),
        ...p.items.map((it) => h('div', { key: it.key, class: 'ds-g3-step' + (it.done ? ' done' : '') + (setupUi.open === it.key ? ' open' : '') },
            h('div', { class: 'ds-g3-stephead', role: 'button', tabindex: '0', 'aria-expanded': setupUi.open === it.key ? 'true' : 'false', onclick: () => { setupUi.open = setupUi.open === it.key ? '' : it.key; rr(); }, onkeydown: activate(() => { setupUi.open = setupUi.open === it.key ? '' : it.key; rr(); }) },
                h('span', { class: 'ds-g3-stepck', 'aria-hidden': 'true' }, it.done ? '✓' : ''),
                h('span', { class: 'ds-g3-steplbl' }, it.label)),
            setupUi.open === it.key ? h('div', { class: 'ds-g3-stepbody' }, stepBody(it.key, account, acts)) : null)),
        note ? h('div', { key: 'sn', class: 'ds-g3-note ' + (note.ok ? 'ds-g3-note-ok' : 'ds-g3-note-err'), role: 'status' }, note.text) : null,
        h('div', { key: 'foot', class: 'ds-g3-btnrow ds-g3-gap' },
            h('div', { class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: onClose, onkeydown: activate(() => onClose && onClose()) }, p.done === p.total ? 'Done' : 'Skip for now'),
            ...(p.done === p.total ? [] : [h('div', { class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: () => acts.setupDismissForever(), onkeydown: activate(() => acts.setupDismissForever()) }, "Don't show again")])));
}
