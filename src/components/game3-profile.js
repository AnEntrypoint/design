import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg, game3AvInitial, game3Hue } from './game3-hue.js';
import { renderMarkdown } from './game3-markdown.js';
import { STATUS } from '../game3-data.js';

const h = webjsx.createElement;

const COLOUR_RE = /^#[0-9a-f]{6}$/i;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const birthdayText = (b) => {
    const m = /^(?:(\d{4})-)?(\d{2})-(\d{2})$/.exec(String(b || ''));
    if (!m) return '';
    const month = MONTHS[Number(m[2]) - 1];
    return month ? month + ' ' + Number(m[3]) + (m[1] ? ', ' + m[1] : '') : '';
};

const safeHref = (u) => { try { const x = new URL(String(u)); return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : ''; } catch { return ''; } };

export function Game3ProfileBody({ member, isSelf = false, devMode = false, onMessage, onSettings, preview = false, key } = {}) {
    const name = member.name || member.identity || 'user';
    const status = member.status || 'online';
    const [statusName, dot] = STATUS[status] || STATUS.online;
    const roles = (member.roles || []).map((r) => (typeof r === 'string' ? { name: r, color: '#949ba4' } : r));
    const lbl = (text, value, k) => [h('div', { key: 'l' + k, class: 'ds-g3-pc-lbl' }, text), h('div', { key: 'v' + k, class: 'ds-g3-pc-val' }, value)];
    const about = member.about || member.bio || '';
    const links = (member.links || []).map((l) => ({ label: l.label, href: safeHref(l.url) })).filter((l) => l.href);
    const site = safeHref(member.website);
    const banner = member.banner || (COLOUR_RE.test(member.accent || '') ? member.accent : 'oklch(.5 .13 ' + game3Hue(name) + ')');
    const bday = birthdayText(member.birthday);
    return h('div', { key, class: 'ds-g3-pcard' + (preview ? ' ds-g3-pcard-prev' : '') },
        h('div', { class: 'ds-g3-pc-ban', style: 'background:' + banner }),
        h('div', { class: 'ds-g3-pc-cb' },
            h('div', { class: 'ds-g3-dmav ds-g3-dmav-big ds-g3-pc-av', style: '--ds-g3-av-color:' + game3AvatarBg(name, member.identity) },
                game3AvInitial(String(name).trim().slice(0, 1).toUpperCase(), member.identity),
                h('span', { class: 'ds-g3-mdot', style: '--ds-g3-dot-color:' + dot, 'aria-label': status })),
            h('div', { class: 'ds-g3-pc-inner' },
                h('h2', {}, name),
                member.accountName ? h('div', { class: 'ds-g3-pc-user' }, 'Account name: ' + member.accountName) : null,
                member.username ? h('div', { class: 'ds-g3-pc-user' }, '@' + member.username) : null,
                h('div', { class: 'ds-g3-pc-status' }, statusName + (member.activity ? ' · ' + member.activity : '')),
                member.pronouns ? h('div', { class: 'ds-g3-pc-pron' }, member.pronouns) : null,
                member.moved ? h('div', { class: 'ds-g3-pc-moved' }, 'Moved to a new key: ' + String(member.moved).slice(0, 16) + '…') : null,
                ...(about ? [h('div', { key: 'la', class: 'ds-g3-pc-lbl' }, 'About Me'), h('div', { key: 'va', class: 'ds-g3-pc-val ds-g3-pre' }, ...renderMarkdown(about))] : []),
                ...(member.location ? lbl('Location', member.location, 'loc') : []),
                ...(bday ? lbl('Birthday', bday, 'bd') : []),
                ...(site || links.length ? [h('div', { key: 'll', class: 'ds-g3-pc-lbl' }, 'Links'), h('div', { key: 'vl', class: 'ds-g3-pc-val' },
                    ...(site ? [h('a', { key: 'site', class: 'ds-g3-pc-link', href: site, target: '_blank', rel: 'noopener noreferrer nofollow' }, site.replace(/^https?:\/\//, ''))] : []),
                    ...links.map((l, i) => h('a', { key: 'k' + i, class: 'ds-g3-pc-link', href: l.href, target: '_blank', rel: 'noopener noreferrer nofollow' }, l.label)))] : []),
                ...(member.nip05 ? lbl('NIP-05', (member.nip05Verified ? '✓ ' : '') + member.nip05 + (member.nip05Verified ? '' : member.nip05Verified === false ? ' (not verified)' : ' (not checked)'), 'n5') : []),
                ...(member.joinedAt ? lbl('Member Since', new Date(member.joinedAt).toLocaleDateString(), 'm') : []),
                h('div', { key: 'lr', class: 'ds-g3-pc-lbl' }, 'Roles'),
                h('div', { key: 'rr' }, ...roles.map((r, i) => h('span', { key: 'r' + i, class: 'ds-g3-role' }, h('i', { style: 'background:' + (r.color || '#949ba4') }), r.name)), h('span', { class: 'ds-g3-role' }, h('i', { style: 'background:#949ba4' }), 'member')),
                preview ? null : isSelf
                    ? h('div', { class: 'ds-g3-btnp', role: 'button', tabindex: '0', onclick: () => onSettings && onSettings() }, 'Edit settings')
                    : h('div', { class: 'ds-g3-btnp', role: 'button', tabindex: '0', onclick: () => onMessage && onMessage(member) }, 'Message @' + name),
                ...(!preview && devMode && member.identity ? [h('div', { class: 'ds-g3-btnp ds-g3-btnp-alt', role: 'button', tabindex: '0', onclick: () => navigator.clipboard && navigator.clipboard.writeText(member.identity) }, 'Copy User ID')] : []))));
}

export function Game3ProfileCard({ member, isSelf = false, devMode = false, onClose, onMessage, onSettings, key } = {}) {
    if (!member) return null;
    const name = member.name || member.identity || 'user';
    return h('div', { key, class: 'ds-g3-scrim', role: 'dialog', 'aria-modal': 'true', 'aria-label': name + ' profile', onclick: (e) => { if (e.target === e.currentTarget && onClose) onClose(); } },
        Game3ProfileBody({ member, isSelf, devMode, onMessage, onSettings }));
}
