import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg, game3AvInitial, game3Hue } from './game3-hue.js';
import { renderMarkdown } from './game3-markdown.js';
import { Game3ProfileBody } from './game3-profile.js';

const h = webjsx.createElement;

const PRESENCE = [['online', 'Online', '#23a55a'], ['idle', 'Idle', '#f0b232'], ['dnd', 'Do Not Disturb', '#f23f43'], ['invisible', 'Invisible', '#80848e']];
const SWATCHES = ['#c4602f', '#5865f2', '#eb459e', '#9b84ee', '#1abc9c', '#f1c40f', '#57f287', '#2b2d31'];
const DURATIONS = [[0, "Don't clear"], [1800, '30 minutes'], [3600, '1 hour'], [14400, '4 hours'], [86400, '24 hours']];
const DM_POLICY = [['everyone', 'Everyone', 'anyone with your key can message you'], ['known', 'People I know', 'people you have messaged, or who talk in your servers'], ['nobody', 'Nobody new', 'only people you have already messaged can reach you']];
const BIRTHDAY = [['hidden', 'Hidden', 'only you see it'], ['day', 'Day and month', 'people see May 17 but not the year'], ['full', 'Full date', 'people see the year too']];

const ui = { draft: {}, reveal: false, aboutPreview: false, confirm: '', addLink: false, rerender: null, timer: null, rotateCopied: false };

const rr = () => { if (ui.rerender) ui.rerender(); };

const arm = (name) => {
    ui.confirm = name;
    if (ui.timer) clearTimeout(ui.timer);
    ui.timer = setTimeout(() => { ui.confirm = ''; rr(); }, 9000);
    rr();
};

const disarm = () => { ui.confirm = ''; if (ui.timer) { clearTimeout(ui.timer); ui.timer = null; } };

const twoPress = (name, label, armedLabel, onGo, cls) => h('div', {
    key: 'tp-' + name, class: 'ds-g3-evb ' + (cls || 'ds-g3-evb-ghost') + (ui.confirm === name ? ' ds-g3-evb-armed' : ''), role: 'button', tabindex: '0',
    onclick: () => { if (ui.confirm === name) { disarm(); rr(); onGo(); } else arm(name); },
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } },
}, ui.confirm === name ? armedLabel : label);

const btn = (key, label, onClick, cls) => h('div', {
    key, class: 'ds-g3-evb' + (cls ? ' ' + cls : ''), role: 'button', tabindex: '0', onclick: onClick,
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } },
}, label);

const copyBtn = (key, text, label = 'Copy') => btn(key, label, (e) => {
    const el = e.currentTarget;
    const done = () => { el.textContent = 'Copied'; setTimeout(() => { el.textContent = label; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => { el.textContent = 'Copy failed'; });
});

const fileBtn = (key, label, accept, onFile) => h('label', { key, class: 'ds-g3-evb ds-g3-filebtn' }, label,
    h('input', { type: 'file', accept, class: 'ds-g3-fileinput', 'aria-label': label, onchange: (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) onFile(f); } }));

const noteFor = (a, key) => (a.note && a.note.key === key ? h('div', { key: 'note-' + key, class: 'ds-g3-note ' + (a.note.ok ? 'ds-g3-note-ok' : 'ds-g3-note-err'), role: 'status' }, a.note.text) : null);

const live = (check) => (e) => {
    const msg = check(e.target.value);
    const el = e.target.parentNode.querySelector('.ds-g3-live');
    if (el) el.textContent = msg;
    e.target.classList.toggle('ds-g3-bad', !!msg);
};

const textField = ({ k, label, value, max, placeholder, area, onSave, check, hint }) => h('div', { key: 'f-' + k, class: 'ds-g3-fld' },
    h('h6', null, label),
    area
        ? h('textarea', { class: 'ds-g3-fi', rows: '3', maxlength: String(max), placeholder, value, onkeydown: (e) => e.stopPropagation(), oninput: check ? live(check) : null, onchange: (e) => onSave(e.target.value) })
        : h('input', { class: 'ds-g3-fi', maxlength: String(max), placeholder, value, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') e.target.blur(); }, oninput: check ? live(check) : null, onchange: (e) => onSave(e.target.value) }),
    h('div', { class: 'ds-g3-live', 'aria-live': 'polite' }),
    hint ? h('p', { class: 'ds-g3-hint' }, hint) : null);

const colourRow = (current, onPick, allowClear) => h('div', { class: 'ds-g3-swrow' },
    h('div', { class: 'ds-g3-swatches' },
        ...(allowClear ? [h('i', { key: 'auto', title: 'automatic', class: !current ? 'on' : '', style: 'background:#80848e', role: 'button', tabindex: '0', onclick: () => onPick('') })] : []),
        ...SWATCHES.map((c) => h('i', { key: c, title: c, class: current === c ? 'on' : '', style: 'background:' + c, role: 'button', tabindex: '0', onclick: () => onPick(c) }))),
    h('input', { type: 'color', class: 'ds-g3-colour', value: /^#[0-9a-f]{6}$/i.test(current || '') ? current : '#5865f2', 'aria-label': 'custom colour', onchange: (e) => onPick(e.target.value) }));

const radio = (key, on, label, sub, onClick) => h('div', { key, class: 'ds-g3-radio' + (on ? ' on' : ''), role: 'radio', tabindex: '0', 'aria-checked': on ? 'true' : 'false', onclick: onClick, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } },
    h('i', { 'aria-hidden': 'true' }), h('span', null, label, sub ? h('span', { class: 'ds-g3-radsub' }, ' · ' + sub) : null));

const toggle = (key, on, label, sub, onToggle) => h('div', { key, class: 'ds-g3-tgl' + (on ? ' on' : ''), role: 'switch', tabindex: '0', 'aria-checked': on ? 'true' : 'false', 'aria-label': label, onclick: () => onToggle(!on), onkeydown: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(!on); } } },
    h('div', null, h('div', { class: 'ds-g3-tgl-label' }, label), h('div', { class: 'ds-g3-hint' }, sub)),
    h('div', { class: 'ds-g3-sw2', 'aria-hidden': 'true' }));

const bannerCss = (a) => a.bannerCss || ('oklch(.5 .13 ' + game3Hue(a.pub.name || 'you') + ')');

const clock = (sec) => (sec ? new Date(sec * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');

const nip05Badge = (a) => {
    const n = a.nip05;
    if (!a.pub.nip05) return h('p', { class: 'ds-g3-hint' }, 'a NIP-05 name like you@example.com proves this key belongs to a domain you control. Optional.');
    if (n.id === a.pub.nip05 && n.at) return h('div', { class: 'ds-g3-badge ' + (n.ok ? 'ds-g3-badge-ok' : 'ds-g3-badge-bad') }, n.ok ? '✓ Verified ' + clock(n.at) : '✗ Not verified: ' + n.reason);
    return h('div', { class: 'ds-g3-badge' }, 'Not checked yet. Press Verify.');
};

const avatarBlock = (a, acts, big) => h('div', { class: 'ds-g3-acct-av' + (big ? '' : ' ds-g3-acct-av-sm'), style: 'background:' + game3AvatarBg(a.pub.name || 'You', a.pubkey) }, game3AvInitial(String(a.pub.name || 'Y').slice(0, 1).toUpperCase(), a.pubkey));

const profileMember = (a) => {
    const m = a.meta || {};
    const server = a.server && a.server.nick ? a.server.nick : '';
    const verified = a.nip05 && a.nip05.ok && a.nip05.id === a.pub.nip05;
    return {
        identity: a.pubkey, name: server || a.pub.name || 'You', username: a.pub.username, status: a.status.shown || a.status.status,
        activity: a.status.text ? ((a.status.emoji ? a.status.emoji + ' ' : '') + a.status.text) : '',
        about: a.pub.about, pronouns: a.pub.pronouns, location: a.pub.location, website: a.pub.website, links: a.pub.links,
        banner: a.bannerCss, accent: a.pub.accent, birthday: m.birthday || '', nip05: a.pub.nip05, nip05Verified: verified ? true : (a.nip05 && a.nip05.at && a.nip05.id === a.pub.nip05 ? false : undefined),
    };
};

const accountPane = (a, acts, extra) => {
    const sv = acts;
    return [
        h('h2', { key: 'h' }, 'My Account'),
        h('div', { key: 'acct', class: 'ds-g3-acct' },
            h('div', { class: 'ds-g3-acct-ban', style: 'background:' + bannerCss(a) }),
            h('div', { class: 'ds-g3-acct-row' },
                avatarBlock(a, acts, true),
                h('div', { class: 'ds-g3-acct-id' }, h('h3', null, a.pub.name || 'You'), a.pub.username ? h('div', { class: 'ds-g3-acct-un' }, '@' + a.pub.username) : null,
                    h('div', { class: 'ds-g3-acct-st' }, a.status.text ? ((a.status.emoji ? a.status.emoji + ' ' : '') + a.status.text) : (PRESENCE.find((p) => p[0] === a.status.status) || PRESENCE[0])[1]))),
            h('div', { class: 'ds-g3-acct-note' }, 'this is how your name and picture appear to everyone. Change them below.')),
        h('div', { key: 'stat', class: 'ds-g3-stat' },
            h('div', null, h('b', null, String(extra.level)), h('span', null, 'level')),
            h('div', null, h('b', null, String(extra.xp)), h('span', null, 'xp')),
            h('div', null, h('b', null, String(extra.servers)), h('span', null, 'servers')),
            h('div', null, h('b', null, '0'), h('span', null, 'saved')),
            h('div', null, h('b', null, '0'), h('span', null, 'reminders'))),
        h('h6', { key: 'idh' }, 'Public key'),
        h('div', { key: 'npub', class: 'ds-g3-npub' },
            h('code', { class: 'ds-g3-code', title: a.npub }, a.npub),
            copyBtn('cn', a.npub, 'Copy npub'),
            copyBtn('ch', a.pubkey, 'Copy hex')),
        h('p', { key: 'npubh', class: 'ds-g3-hint' }, 'your npub is your identity: share it freely. Never share your secret key.'),
        textField({ k: 'name', label: 'Display Name', value: a.pub.name, max: 32, placeholder: 'what people see', check: (t) => (t.trim() ? '' : 'Display name cannot be empty'), onSave: (t) => sv.accountSavePublic('name', { name: t }, 'Display name saved') }),
        noteFor(a, 'name'),
        textField({ k: 'username', label: 'Username', value: a.pub.username, max: 24, placeholder: 'letters, numbers, dot, dash, underscore', check: (t) => (t && !/^[a-z0-9_.-]{2,24}$/i.test(t) ? 'Use 2 to 24 of: letters, numbers . - _' : ''), onSave: (t) => sv.accountSavePublic('username', { username: t }, 'Username saved') }),
        noteFor(a, 'username'),
        h('div', { key: 'n5', class: 'ds-g3-fld' },
            h('h6', null, 'NIP-05 Identifier'),
            h('div', { class: 'ds-g3-row2' },
                h('input', { class: 'ds-g3-fi', id: 'g3-nip05', maxlength: '120', placeholder: 'you@example.com', value: a.pub.nip05, onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') sv.accountVerifyNip05(e.target.value); } }),
                btn('vf', 'Verify', () => { const el = document.getElementById('g3-nip05'); sv.accountVerifyNip05(el ? el.value : a.pub.nip05); }, 'ds-g3-evb-on')),
            nip05Badge(a), noteFor(a, 'nip05')),
        h('h6', { key: 'avh' }, 'Avatar'),
        h('div', { key: 'avr', class: 'ds-g3-btnrow' },
            fileBtn('up', 'Upload picture', 'image/png,image/jpeg,image/webp,image/gif', (f) => sv.accountUploadAvatar(f)),
            btn('gen', 'Generate', () => sv.accountGenerateAvatar()),
            ...(a.pub.picture ? [btn('rm', 'Remove', () => sv.accountClearAvatar(), 'ds-g3-evb-ghost')] : [])),
        h('input', { key: 'avu', class: 'ds-g3-fi ds-g3-gap', maxlength: '1900', placeholder: 'or paste an https:// image address', value: /^https:/.test(a.pub.picture || '') ? a.pub.picture : '', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') e.target.blur(); }, onchange: (e) => sv.accountSavePublic('avatar', { picture: e.target.value }, 'Picture saved') }),
        h('p', { key: 'avh2', class: 'ds-g3-hint' }, 'uploads are resized in your browser to 192 px and stored inside your profile, so no third party hosts them.'),
        noteFor(a, 'avatar'),
        h('h6', { key: 'ach' }, 'Account Colour'),
        colourRow(a.pub.accent, (c) => sv.accountSavePublic('accent', { accent: c }, c ? 'Colour saved' : 'Colour cleared'), true),
        h('p', { key: 'ach2', class: 'ds-g3-hint' }, 'tints your avatar when you have no picture, and your banner when it is on automatic.'),
        noteFor(a, 'accent'),
        h('h6', { key: 'st' }, 'Status'),
        ...PRESENCE.map(([k, n, c]) => radio('s' + k, a.status.status === k, [h('span', { key: 'd', style: 'color:' + c }, '●'), ' ' + n], '', () => sv.accountSetStatus({ status: k, text: a.status.text, emoji: a.status.emoji, durationSec: 0 }))),
        h('h6', { key: 'cs' }, 'Custom Status'),
        h('div', { key: 'csb', class: 'ds-g3-cstat' },
            h('div', { class: 'ds-g3-row2' },
                h('input', { class: 'ds-g3-fi ds-g3-emo', 'data-f': 'emoji', maxlength: '8', placeholder: '😀', value: a.status.emoji, 'aria-label': 'status emoji', onkeydown: (e) => e.stopPropagation() }),
                h('input', { class: 'ds-g3-fi', 'data-f': 'text', maxlength: '60', placeholder: 'what are you up to?', value: a.status.text, 'aria-label': 'custom status text', onkeydown: (e) => e.stopPropagation() })),
            h('div', { class: 'ds-g3-row2 ds-g3-gap' },
                h('select', { class: 'ds-g3-langsel', 'data-f': 'dur', 'aria-label': 'clear status after' }, ...DURATIONS.map(([s, l]) => h('option', { key: s, value: String(s) }, l))),
                btn('csv', 'Save status', (e) => { const box = e.currentTarget.closest('.ds-g3-cstat'); sv.accountSetStatus({ status: a.status.status, text: box.querySelector('[data-f=text]').value, emoji: box.querySelector('[data-f=emoji]').value, durationSec: Number(box.querySelector('[data-f=dur]').value) }); }, 'ds-g3-evb-on'),
                ...(a.status.text || a.status.emoji ? [btn('csc', 'Clear', () => sv.accountSetStatus({ status: a.status.status, text: '', emoji: '', durationSec: 0 }), 'ds-g3-evb-ghost')] : []))),
        a.status.expiresAt ? h('p', { key: 'cse', class: 'ds-g3-hint' }, 'clears itself at ' + clock(a.status.expiresAt)) : null,
        noteFor(a, 'status'),
    ].filter(Boolean);
};

const linkRows = (a, acts) => {
    const rows = [...(a.pub.links || []), ...(ui.addLink || !(a.pub.links || []).length ? [{ label: '', url: '' }] : [])];
    const save = (e) => {
        const box = e.target.closest('.ds-g3-links');
        const list = [...box.querySelectorAll('.ds-g3-lrow')].map((r) => ({ label: r.querySelector('[data-f=label]').value.trim(), url: r.querySelector('[data-f=url]').value.trim() })).filter((l) => l.label || l.url);
        ui.addLink = false;
        acts.accountSavePublic('links', { links: list }, 'Links saved');
    };
    return h('div', { key: 'links', class: 'ds-g3-links' },
        ...rows.map((l, i) => h('div', { key: 'l' + i + l.label, class: 'ds-g3-lrow' },
            h('input', { class: 'ds-g3-fi', 'data-f': 'label', maxlength: '24', placeholder: 'label', value: l.label, 'aria-label': 'link label', onkeydown: (e) => e.stopPropagation(), onchange: save }),
            h('input', { class: 'ds-g3-fi', 'data-f': 'url', maxlength: '200', placeholder: 'https://', value: l.url, 'aria-label': 'link address', onkeydown: (e) => e.stopPropagation(), onchange: save }),
            l.label || l.url ? h('span', { class: 'ds-g3-x', role: 'button', tabindex: '0', title: 'Remove link', 'aria-label': 'remove link', onclick: (e) => { const box = e.currentTarget.closest('.ds-g3-links'); const row = e.currentTarget.closest('.ds-g3-lrow'); row.querySelector('[data-f=label]').value = ''; row.querySelector('[data-f=url]').value = ''; save({ target: row.querySelector('[data-f=label]') }); } }, '✕') : null)),
        (a.pub.links || []).length && (a.pub.links || []).length < 5 && !ui.addLink ? btn('addl', 'Add another link', () => { ui.addLink = true; rr(); }) : null);
};

const bannerEditor = (a, acts) => {
    const b = a.pub.banner || { mode: 'auto' };
    const modes = [['auto', 'Automatic'], ['colour', 'Colour'], ['gradient', 'Gradient'], ['image', 'Image']];
    const set = (nb) => acts.accountSavePublic('banner', { banner: nb }, 'Banner saved');
    const current = b.mode === 'colour' ? b.a : '';
    return h('div', { key: 'bn', class: 'ds-g3-banner' },
        h('div', { class: 'ds-g3-swatches' },
            ...['', ...SWATCHES].map((c) => h('i', { key: 'c' + c, title: c || 'automatic', class: (b.mode === 'auto' && !c) || (b.mode === 'colour' && current === c) ? 'on' : '', style: 'background:' + (c || '#80848e'), role: 'button', tabindex: '0', onclick: () => set(c ? { mode: 'colour', a: c } : { mode: 'auto' }) }))),
        h('div', { class: 'ds-g3-seg ds-g3-gap', role: 'radiogroup', 'aria-label': 'banner type' }, ...modes.map(([k, l]) => h('span', { key: k, class: b.mode === k ? 'on' : '', role: 'radio', tabindex: '0', 'aria-checked': b.mode === k ? 'true' : 'false', onclick: () => set(k === 'auto' ? { mode: 'auto' } : k === 'colour' ? { mode: 'colour', a: b.a || '#5865f2' } : k === 'gradient' ? { mode: 'gradient', a: b.a || '#5865f2', b: b.b || '#eb459e', angle: b.angle || 135 } : { mode: 'image', url: b.url || '' }) }, l))),
        b.mode === 'colour' ? h('input', { type: 'color', class: 'ds-g3-colour', value: b.a, 'aria-label': 'custom banner colour', onchange: (e) => set({ mode: 'colour', a: e.target.value }) }) : null,
        b.mode === 'gradient' ? h('div', { class: 'ds-g3-gradrow' },
            h('input', { type: 'color', class: 'ds-g3-colour', value: b.a, 'aria-label': 'gradient start', onchange: (e) => set({ mode: 'gradient', a: e.target.value, b: b.b, angle: b.angle }) }),
            h('input', { type: 'color', class: 'ds-g3-colour', value: b.b, 'aria-label': 'gradient end', onchange: (e) => set({ mode: 'gradient', a: b.a, b: e.target.value, angle: b.angle }) }),
            h('input', { type: 'range', min: '0', max: '360', value: String(b.angle || 135), class: 'ds-g3-range', 'aria-label': 'gradient angle', onchange: (e) => set({ mode: 'gradient', a: b.a, b: b.b, angle: Number(e.target.value) }) }),
            h('span', { class: 'ds-g3-hint' }, (b.angle || 135) + '\u00B0')) : null,
        b.mode === 'image' ? h('div', { class: 'ds-g3-btnrow' }, fileBtn('bup', 'Upload banner', 'image/png,image/jpeg,image/webp,image/gif', (f) => acts.accountUploadBanner(f)), h('input', { class: 'ds-g3-fi', maxlength: '1900', placeholder: 'or an https:// image address', value: /^https:/.test(b.url || '') ? b.url : '', onkeydown: (e) => e.stopPropagation(), onchange: (e) => set({ mode: 'image', url: e.target.value }) })) : null,
        noteFor(a, 'banner'));
};

const profilePane = (a, acts) => {
    const tabs = h('div', { key: 'abt', class: 'ds-g3-seg ds-g3-seg-sm' }, h('span', { class: !ui.aboutPreview ? 'on' : '', role: 'button', tabindex: '0', onclick: () => { ui.aboutPreview = false; rr(); } }, 'Write'), h('span', { class: ui.aboutPreview ? 'on' : '', role: 'button', tabindex: '0', onclick: () => { ui.aboutPreview = true; rr(); } }, 'Preview'));
    return [
        h('h2', { key: 'h' }, 'Profiles'),
        textField({ k: 'pron', label: 'Pronouns', value: a.pub.pronouns, max: 40, placeholder: 'she/her, they/them…', onSave: (t) => acts.accountSavePublic('pronouns', { pronouns: t }, 'Pronouns saved') }),
        noteFor(a, 'pronouns'),
        h('div', { key: 'about', class: 'ds-g3-fld' },
            h('h6', null, 'About Me'), tabs,
            ui.aboutPreview
                ? h('div', { class: 'ds-g3-aboutprev ds-g3-pre' }, ...(a.pub.about ? renderMarkdown(a.pub.about) : [h('span', { class: 'ds-g3-hint' }, 'nothing written yet')]))
                : h('textarea', { class: 'ds-g3-fi', rows: '3', maxlength: '190', placeholder: 'tell people about yourself. markdown works.', value: a.pub.about, onkeydown: (e) => e.stopPropagation(), oninput: (e) => { const c = e.target.parentNode.querySelector('.ds-g3-count'); if (c) c.textContent = e.target.value.length + ' / 190'; }, onchange: (e) => acts.accountSavePublic('about', { about: e.target.value }, 'About me saved') }),
            h('div', { class: 'ds-g3-count' }, (a.pub.about || '').length + ' / 190'),
            h('p', { class: 'ds-g3-hint' }, '**bold**, *italic*, `code`, links and lists render on your card for everyone')),
        noteFor(a, 'about'),
        h('h6', { key: 'lh' }, 'Website and Links'),
        textField({ k: 'web', label: '', value: a.pub.website, max: 200, placeholder: 'https://your.site', check: (t) => { if (!t) return ''; try { const u = new URL(t); return u.protocol === 'https:' || u.protocol === 'http:' ? '' : 'Must start with https://'; } catch { return 'Use a full address like https://example.com'; } }, onSave: (t) => acts.accountSavePublic('website', { website: t }, 'Website saved') }),
        linkRows(a, acts),
        h('p', { key: 'lh2', class: 'ds-g3-hint' }, 'up to 5 links, shown on your card'),
        noteFor(a, 'links'), noteFor(a, 'website'),
        textField({ k: 'loc', label: 'Location', value: a.pub.location, max: 60, placeholder: 'city, country, or anywhere', onSave: (t) => acts.accountSavePublic('location', { location: t }, 'Location saved') }),
        noteFor(a, 'location'),
        h('h6', { key: 'bdh' }, 'Birthday'),
        h('div', { key: 'bd', class: 'ds-g3-row2' },
            h('input', { type: 'date', class: 'ds-g3-fi', value: a.birthday.date, min: '1900-01-01', max: new Date().toISOString().slice(0, 10), 'aria-label': 'birthday', onchange: (e) => acts.accountSetBirthday({ date: e.target.value }) }),
            h('select', { class: 'ds-g3-langsel', 'aria-label': 'who sees your birthday', onchange: (e) => acts.accountSetBirthday({ visibility: e.target.value }) }, ...BIRTHDAY.map(([k, l]) => h('option', { key: k, value: k, selected: a.birthday.visibility === k }, l)))),
        h('p', { key: 'bdp', class: 'ds-g3-hint' }, (BIRTHDAY.find((b) => b[0] === a.birthday.visibility) || BIRTHDAY[0])[2] + '. Your date is kept in your private synced settings either way.'),
        noteFor(a, 'birthday'),
        h('h6', { key: 'bh' }, 'Banner Colour'),
        bannerEditor(a, acts),
        ...(a.server ? [
            h('h6', { key: 'sh' }, 'In ' + (a.server.name || 'this server')),
            h('div', { key: 'sv', class: 'ds-g3-fld' },
                h('div', { class: 'ds-g3-row2' },
                    h('input', { class: 'ds-g3-fi', maxlength: '32', placeholder: 'nickname for this server', value: a.server.nick || '', 'aria-label': 'server nickname', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') e.target.blur(); }, oninput: (e) => { const hits = acts.accountCheckNick(e.target.value); const el = e.target.closest('.ds-g3-fld').querySelector('.ds-g3-nickwarn'); if (el) el.textContent = hits.length ? 'Careful: ' + (hits[0].kind === 'exact' ? 'the same as ' : 'looks a lot like ') + hits[0].name + (hits.length > 1 ? ' and ' + (hits.length - 1) + ' more' : '') + ' in this server.' : ''; }, onchange: (e) => acts.accountSetServerProfile({ nick: e.target.value, avatar: a.server.avatar || '' }) }),
                    fileBtn('sup', 'Server picture', 'image/png,image/jpeg,image/webp,image/gif', (f) => acts.accountUploadServerAvatar(f)),
                    ...(a.server.avatar ? [btn('srm', 'Remove', () => acts.accountSetServerProfile({ nick: a.server.nick || '', avatar: '' }), 'ds-g3-evb-ghost')] : [])),
                h('div', { class: 'ds-g3-nickwarn ds-g3-warn', 'aria-live': 'polite' }),
                h('p', { class: 'ds-g3-hint' }, 'only people in this server see this name and picture. Others still see your normal profile, and anyone can hover your name here to see your real account name.'),
                noteFor(a, 'server'))] : [h('p', { key: 'sh0', class: 'ds-g3-hint' }, 'open a server to set a nickname and picture just for it.')]),
        h('h6', { key: 'ph' }, 'Preview'),
        h('p', { key: 'ph2', class: 'ds-g3-hint' }, 'this is your profile card exactly as people in ' + (a.server && a.server.name ? a.server.name : 'a server') + ' see it.'),
        Game3ProfileBody({ key: 'prev', member: profileMember(a), preview: true, isSelf: true }),
    ].filter(Boolean);
};

const signerBlock = (a, acts) => {
    const sg = a.signer || {};
    const head = h('div', { key: 'n46h', class: 'ds-g3-tgl-label' }, 'Remote signer (NIP-46)');
    if (sg.remote) {
        return [h('div', { key: 'n46', class: 'ds-g3-method' },
            h('div', null, head, h('div', { class: 'ds-g3-hint' }, 'signing through the signer ' + String(sg.remote.remote).slice(0, 12) + '… on ' + (sg.remote.relays || []).join(', ') + '. The key never reaches this page and the session survives reloads.')),
            btn('dsc', 'Disconnect', () => acts.accountDisconnectSigner(), 'ds-g3-evb-ghost')), noteFor(a, 'signer')];
    }
    if (sg.flow && sg.flow.mode === 'qr') {
        return [h('div', { key: 'n46q', class: 'ds-g3-secret' }, head,
            h('p', { class: 'ds-g3-hint' }, 'scan this with a NIP-46 signer app (or paste the address into one), then approve the connection. Waiting for the signer…'),
            h('div', { class: 'ds-g3-qr', role: 'img', 'aria-label': 'connection QR code', innerHTML: sg.flow.svg }),
            h('code', { class: 'ds-g3-code' }, sg.flow.uri),
            h('div', { class: 'ds-g3-btnrow' }, copyBtn('cq', sg.flow.uri, 'Copy address'), btn('cq2', 'Cancel', () => acts.accountCancelQr(), 'ds-g3-evb-ghost'))), noteFor(a, 'signer')];
    }
    const busy = sg.flow && sg.flow.status === 'connecting';
    return [h('div', { key: 'n46', class: 'ds-g3-method ds-g3-method-col' }, head,
        h('div', { class: 'ds-g3-hint' }, 'sign in with a remote signer so the key stays on another device or app. Paste its bunker:// address, or show a QR for the signer to scan. This replaces the identity in this browser.'),
        h('div', { class: 'ds-g3-row2' },
            h('input', { class: 'ds-g3-fi', id: 'g3-bunker', placeholder: 'bunker://… or name@domain', autocomplete: 'off', value: ui.draft.bunker || '', oninput: (e) => { ui.draft.bunker = e.target.value; }, onkeydown: (e) => e.stopPropagation() }),
            busy ? h('div', { class: 'ds-g3-evb ds-g3-evb-ghost' }, 'Connecting…') : twoPress('bunker', 'Connect', 'Press again to replace', () => { const el = document.getElementById('g3-bunker'); acts.accountConnectBunker(el ? el.value : ''); }, 'ds-g3-evb-ghost')),
        h('div', { class: 'ds-g3-btnrow' }, twoPress('qr', 'Show QR to scan', 'Press again: show the QR', () => acts.accountStartQr(), 'ds-g3-evb-ghost'))), noteFor(a, 'signer')];
};

const securityPane = (a, acts) => {
    const nsec = ui.reveal ? acts.accountNsec() : '';
    return [
        h('h2', { key: 'h' }, 'Key & Security'),
        h('h6', { key: 'k1' }, 'Public key'),
        h('div', { key: 'np', class: 'ds-g3-npub' }, h('code', { class: 'ds-g3-code', title: a.npub }, a.npub), copyBtn('cn', a.npub, 'Copy npub')),
        h('h6', { key: 'k2' }, 'Back up your key'),
        a.hasPrivkey
            ? [h('p', { key: 'bp', class: 'ds-g3-hint ds-g3-warn' }, 'your secret key (nsec) is the only way back into this identity. Anyone who has it controls your account. There is no reset.'),
                ui.reveal
                    ? h('div', { key: 'rv', class: 'ds-g3-secret' }, h('code', { class: 'ds-g3-code' }, nsec), h('div', { class: 'ds-g3-btnrow' }, copyBtn('cs', nsec, 'Copy secret key'), btn('hd', 'Hide', () => { ui.reveal = false; rr(); })))
                    : twoPress('reveal', 'Show my secret key', 'Press again: I am in private and want to see it', () => { ui.reveal = true; rr(); }, 'ds-g3-evb-on')]
            : h('p', { key: 'bx', class: 'ds-g3-hint' }, 'this account signs with a browser extension, so the secret key never reaches this page. Back it up inside the extension.'),
        h('h6', { key: 'k3' }, 'Import a key'),
        h('div', { key: 'imp', class: 'ds-g3-row2' },
            h('input', { class: 'ds-g3-fi', id: 'g3-import-key', type: 'password', autocomplete: 'off', placeholder: 'nsec1… or 64 hex characters', value: ui.draft.importKey || '', oninput: (e) => { ui.draft.importKey = e.target.value; }, onkeydown: (e) => e.stopPropagation() }),
            twoPress('import', 'Import', 'Press again to replace', () => { const el = document.getElementById('g3-import-key'); acts.accountImportKey(el ? el.value : ''); }, 'ds-g3-evb-ghost')),
        h('p', { key: 'imph', class: 'ds-g3-hint' }, 'replaces the identity in this browser. The current key is gone unless you backed it up.'),
        h('h6', { key: 'k4' }, 'Rotate to a new key'),
        a.rotated
            ? h('div', { key: 'rot', class: 'ds-g3-secret' },
                h('p', { class: 'ds-g3-hint ds-g3-warn' }, 'You now sign as ' + a.rotated.newNpub.slice(0, 16) + '…. Save your OLD secret key now; it is shown once.'),
                h('code', { class: 'ds-g3-code' }, a.rotated.oldNsec),
                h('div', { class: 'ds-g3-btnrow' }, copyBtn('co', a.rotated.oldNsec, 'Copy old key'), btn('rd', 'I saved it, reload', () => acts.accountDismissRotation(), 'ds-g3-evb-on')))
            : a.hasPrivkey
                ? [h('p', { key: 'rp', class: 'ds-g3-hint' }, 'makes a fresh key and publishes a note signed by your old key saying "I moved to this npub", so people can follow you. Your servers and messages stay under the old key.'),
                    twoPress('rotate', 'Rotate key', 'Press again: publish the move and switch', () => acts.accountRotateKey())]
                : h('p', { key: 'rx', class: 'ds-g3-hint' }, 'rotate the key inside your extension; this page cannot.'),
        noteFor(a, 'key'),
        h('h6', { key: 'k5' }, 'Sign-in methods'),
        h('div', { key: 'ext', class: 'ds-g3-method' }, h('div', null, h('div', { class: 'ds-g3-tgl-label' }, 'Browser extension'), h('div', { class: 'ds-g3-hint' }, a.extensionAvailable ? 'a Nostr extension (NIP-07) was found. Sign in with it and the key never touches this page.' : 'no Nostr extension (NIP-07) detected in this browser.')), a.extensionAvailable ? btn('el', a.signsWithExtension ? 'Signed in with it' : 'Use extension', () => !a.signsWithExtension && acts.accountExtensionLogin(), a.signsWithExtension ? 'ds-g3-evb-ghost' : 'ds-g3-evb-on') : null),
        ...signerBlock(a, acts),
        h('h6', { key: 'k6' }, 'Connected devices'),
        h('p', { key: 'dev', class: 'ds-g3-hint' }, 'there is no server-side session list: every browser that holds your key is a device, and the key cannot be revoked from here. To cut off a lost device, rotate your key. Your synced settings follow the key to any device that signs in with it.'),
        h('h6', { key: 'k7' }, 'Sign out'),
        h('div', { key: 'so', class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: () => acts.accountSignOut() }, 'Sign out of this browser'),
    ].flat();
};

const dot = { connected: '#23a55a', connecting: '#f0b232', error: '#f23f43', closed: '#80848e' };

const relaysPane = (a, acts) => [
    h('h2', { key: 'h' }, 'Relays'),
    h('p', { key: 'p', class: 'ds-g3-hint' }, 'relays carry your messages. Your list is published to them as a NIP-65 relay list (kind 10002) so other clients can find you, and every browser you sign in on loads it.'),
    ...a.relays.map((r) => h('div', { key: r.url, class: 'ds-g3-relay' },
        h('span', { class: 'ds-g3-rdot', style: 'background:' + (dot[r.status] || dot.closed), 'aria-label': r.status }),
        h('div', { class: 'ds-g3-rinfo' }, h('div', { class: 'ds-g3-rurl' }, r.url), h('div', { class: 'ds-g3-hint' }, r.status + (r.latency ? ' · ' + r.latency : ''))),
        r.status !== 'connected' ? btn('rc', 'Retry', () => acts.accountReconnectRelay(r.url)) : null,
        h('span', { class: 'ds-g3-x', role: 'button', tabindex: '0', title: 'Remove relay', 'aria-label': 'remove ' + r.url, onclick: () => acts.accountRemoveRelay(r.url) }, '✕'))),
    h('div', { key: 'add', class: 'ds-g3-row2 ds-g3-gap' },
        h('input', { class: 'ds-g3-fi', id: 'g3-relay-add', maxlength: '200', placeholder: 'wss://relay.example.com', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') { acts.accountAddRelay(e.target.value); e.target.value = ''; } } }),
        btn('ra', 'Add relay', () => { const el = document.getElementById('g3-relay-add'); acts.accountAddRelay(el ? el.value : ''); if (el) el.value = ''; }, 'ds-g3-evb-on')),
    noteFor(a, 'relays'),
    h('div', { key: 'rs', class: 'ds-g3-gap' }, twoPress('relayreset', 'Reset to defaults', 'Press again: replace my list with the ' + a.defaultRelays.length + ' defaults', () => acts.accountResetRelays())),
].filter(Boolean);

const privacyPane = (a, acts) => [
    h('h2', { key: 'h' }, 'Privacy'),
    h('h6', { key: 'dm' }, 'Who can message you'),
    ...DM_POLICY.map(([k, l, s]) => radio('dm' + k, a.privacy.dm === k, l, s, () => acts.accountSetPrivacy({ dm: k }))),
    h('h6', { key: 'vis' }, 'Visibility'),
    toggle('pres', a.privacy.presence, 'Show online presence', 'off: everyone sees you as Invisible, whatever you pick as your status', (v) => acts.accountSetPrivacy({ presence: v })),
    toggle('act', a.privacy.activity, 'Show activity', 'off: your custom status stays private to you', (v) => acts.accountSetPrivacy({ activity: v })),
    toggle('rec', a.privacy.receipts, 'Read receipts in DMs', 'off by default. On: people you message see when you have read their messages. You see "Seen" on yours only when they have it on too', (v) => acts.accountSetPrivacy({ receipts: v })),
    h('h6', { key: 'men' }, 'Mentions'),
    toggle('ev', a.privacy.everyonePings, 'Count @everyone and @here', 'off: those words never ping you or reach your Inbox; your own @name always does', (v) => acts.accountSetPrivacy({ everyonePings: v })),
    noteFor(a, 'privacy'),
    h('h6', { key: 'bl' }, 'Blocked users'),
    ...(a.blocked.length
        ? a.blocked.map((b) => h('div', { key: b.pubkey, class: 'ds-g3-relay' }, h('div', { class: 'ds-g3-rinfo' }, h('div', { class: 'ds-g3-rurl' }, b.name), h('div', { class: 'ds-g3-hint' }, b.pubkey.slice(0, 16) + '…')), btn('ub', 'Unblock', () => acts.accountUnblock(b.pubkey))))
        : [h('div', { key: 'nb', class: 'ds-g3-hint' }, 'nobody blocked. Block someone from their profile, or paste an npub below. Blocked users disappear from your chats and cannot message you.')]),
    h('div', { key: 'bladd', class: 'ds-g3-row2 ds-g3-gap' },
        h('input', { class: 'ds-g3-fi', id: 'g3-block-add', placeholder: 'npub1… or hex key', onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') { acts.accountBlock(e.target.value); e.target.value = ''; } } }),
        btn('bladd', 'Block', () => { const el = document.getElementById('g3-block-add'); acts.accountBlock(el ? el.value : ''); if (el) el.value = ''; }, 'ds-g3-evb-ghost')),
    noteFor(a, 'blocked'),
].filter(Boolean);

const dataPane = (a, acts) => [
    h('h2', { key: 'h' }, 'Data'),
    h('h6', { key: 'ex' }, 'Export'),
    h('p', { key: 'exp', class: 'ds-g3-hint' }, 'a JSON file with your public profile, private settings, relay list and blocked list. It never contains your secret key.'),
    btn('exb', 'Export my data', () => acts.accountExport(), 'ds-g3-evb-on'),
    h('h6', { key: 'im' }, 'Import'),
    h('p', { key: 'imp', class: 'ds-g3-hint' }, 'restore from an export. Fields are checked first; a bad file changes nothing.'),
    fileBtn('imb', 'Choose export file', 'application/json,.json', (f) => acts.accountImport(f)),
    noteFor(a, 'data'),
    h('h6', { key: 'rq' }, 'Request deletion of published events'),
    h('p', { key: 'rqp', class: 'ds-g3-hint' }, 'signs a NIP-09 deletion request (kind 5) for the events your key has published. Relays may honour it, and copies other people kept stay. Your profile and settings are included.'),
    h('input', { key: 'rqr', class: 'ds-g3-fi', id: 'g3-del-reason', maxlength: '200', placeholder: 'reason (optional)', value: ui.draft.delReason || '', oninput: (e) => { ui.draft.delReason = e.target.value; }, onkeydown: (e) => e.stopPropagation() }),
    h('div', { key: 'rqb', class: 'ds-g3-gap' }, twoPress('reqdel', 'Request deletion', 'Press again: ask relays to delete everything I published', () => { const el = document.getElementById('g3-del-reason'); acts.accountRequestDeletion(el ? el.value : ''); })),
    h('h6', { key: 'dl' }, 'Delete local data'),
    h('p', { key: 'dlp', class: 'ds-g3-hint ds-g3-warn' }, 'clears everything this browser stores, including your key. Back up your key first.'),
    twoPress('local', 'Delete local data', 'Press again: erase this browser and reload', () => acts.accountDeleteLocal()),
].filter(Boolean);

const syncPane = (a, acts) => [
    h('h2', { key: 'h' }, 'Sync'),
    h('p', { key: 'p', class: 'ds-g3-hint' }, 'your personalization lives in a private settings event (kind 30078) encrypted to yourself with NIP-44, so only your key can read it. Sign in on another browser and it follows you. Only the public part (name, picture, about, links, banner) goes out as your normal profile (kind 0).'),
    h('div', { key: 'stat', class: 'ds-g3-syncstat' }, h('b', null, a.sync.at ? 'Last synced ' + clock(a.sync.at) : 'Not synced yet'), h('span', null, a.sync.canEncrypt ? 'encryption ready' : 'this sign-in method cannot encrypt to yourself')),
    h('div', { key: 'btns', class: 'ds-g3-btnrow' }, btn('now', 'Sync now', () => acts.accountPushSync(), 'ds-g3-evb-on'), btn('pull', 'Pull from relays', () => acts.accountPullSync())),
    noteFor(a, 'sync'),
    h('h6', { key: 'w' }, 'What syncs'),
    ...[['Privacy choices', 'who can message you, presence, activity, receipts, mentions'], ['Birthday', 'the full date, even when only the day is public'], ['Custom status and expiry', 'text, emoji, and when it clears'], ['Per-server nicknames and pictures', 'kept privately here, and shared with each server'], ['App preferences', 'theme, message display, notification and chat options, muted channels, keyword alerts']].map(([t, s]) => h('div', { key: t, class: 'ds-g3-dev-row' }, h('span', { class: 'ds-g3-dev-k' }, t), h('span', { class: 'ds-g3-hint ds-g3-synchint' }, s))),
].filter(Boolean);

const PANES = { account: accountPane, profile: profilePane, security: securityPane, relays: relaysPane, privacy: privacyPane, data: dataPane, sync: syncPane };

export const ACCOUNT_TABS = [['account', 'My Account'], ['profile', 'Profiles'], ['security', 'Key & Security'], ['relays', 'Relays'], ['privacy', 'Privacy'], ['data', 'Data'], ['sync', 'Sync']];

export function Game3AccountPane(tab, { account, acts, onRender, extra }) {
    ui.rerender = onRender || null;
    if (!account || !account.signedIn) return [h('h2', { key: 'h' }, 'My Account'), h('p', { key: 'p', class: 'ds-g3-hint' }, 'sign in to manage your account.')];
    const out = PANES[tab](account, acts, extra);
    return Array.isArray(out) ? out.flat().filter(Boolean) : [out];
}
