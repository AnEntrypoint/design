
import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
import { SearchInput } from './content.js';
const h = webjsx.createElement;

const CATEGORY_ORDER = ['software-development', 'ops', 'data', 'planning', 'creative'];

function deriveCategory(skill) {
    if (skill.category) return skill.category;
    const file = skill.file || '';
    const parts = file.split(/[/\\]/).filter(Boolean);
    const idx = parts.lastIndexOf('skills');
    if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
    return 'other';
}

function statusTone(skill) {
    return skill.enabled === false ? 'neutral' : 'add';
}

function statusLabel(skill) {
    return skill.enabled === false ? 'disabled' : 'enabled';
}

function matchesQuery(skill, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (skill.name || '').toLowerCase().includes(q) ||
        (skill.description || '').toLowerCase().includes(q);
}

function SkillSidebarRow({ key, skill, active, busy, onSelect }) {
    return h('button', {
        key,
        type: 'button',
        class: 'ds-plugins-row' + (active ? ' active' : ''),
        onclick: () => onSelect(skill.name),
        'aria-pressed': active ? 'true' : 'false',
        'aria-label': skill.name + ': ' + statusLabel(skill),
    },
        h('span', { class: 'ds-plugins-dot tone-' + statusTone(skill), 'aria-hidden': 'true' }),
        h('span', { class: 'ds-plugins-row-body' },
            h('span', { class: 'ds-plugins-row-name' }, skill.name),
            skill.description
                ? h('span', { class: 'ds-plugins-row-meta' }, skill.description)
                : null),
        busy ? h('span', { class: 'ds-plugins-row-busy' }, '…') : null);
}

function SkillDetail({ skill, busy, onToggle }) {
    if (!skill) {
        return h('div', { class: 'ds-plugins-empty', role: 'status' },
            h('span', { 'aria-hidden': 'true' }, Icon('circle-dot', { size: 22 })),
            h('span', {}, 'Select a skill'));
    }
    const platforms = Array.isArray(skill.platforms) ? skill.platforms : [];
    return h('div', { class: 'ds-plugins-detail' },
        h('div', { class: 'ds-plugins-detail-head' },
            h('div', { class: 'ds-plugins-detail-title' },
                h('span', { class: 'ds-plugins-dot tone-' + statusTone(skill), 'aria-hidden': 'true' }),
                h('span', { class: 'name' }, skill.name)),
            onToggle
                ? h('button', {
                    type: 'button',
                    class: 'ds-plugins-toggle' + (skill.enabled !== false ? ' on' : ''),
                    disabled: busy ? true : null,
                    onclick: () => onToggle(skill),
                    'aria-pressed': skill.enabled !== false ? 'true' : 'false',
                    'aria-label': skill.enabled !== false ? 'Disable skill' : 'Enable skill',
                }, h('span', { class: 'ds-plugins-toggle-knob' }))
                : null),
        skill.description
            ? h('div', { class: 'ds-skills-description' }, skill.description)
            : null,
        h('div', { class: 'ds-plugins-fact-grid' },
            h('div', { class: 'ds-plugins-fact-label' }, 'status'),
            h('div', { class: 'ds-plugins-fact-value tone-text-' + statusTone(skill) }, statusLabel(skill)),
            h('div', { class: 'ds-plugins-fact-label' }, 'category'),
            h('div', { class: 'ds-plugins-fact-value' }, deriveCategory(skill)),
            skill.file ? h('div', { class: 'ds-plugins-fact-label' }, 'path') : null,
            skill.file ? h('div', { class: 'ds-plugins-fact-value ds-plugins-mono' }, skill.file) : null),
        h('div', { class: 'ds-plugins-requires' },
            h('div', { class: 'ds-plugins-group-label' }, 'platforms'),
            platforms.length
                ? h('div', { class: 'ds-plugins-requires-list' },
                    ...platforms.map((p) => h('span', { key: p, class: 'ds-plugins-chip' }, p)))
                : h('div', { class: 'ds-plugins-requires-empty' }, 'all platforms')),
        skill.body
            ? h('div', { class: 'ds-skills-body-group' },
                h('div', { class: 'ds-plugins-group-label' }, 'body preview'),
                h('pre', { class: 'ds-skills-body-preview' }, skill.body.slice(0, 2000)))
            : null);
}

export function SkillsConfig({
    skills = [],
    selected = null,
    loading = false,
    error = null,
    busyName = null,
    query = '',
    onQuery,
    onSelect,
    onToggle,
    onClose,
} = {}) {
    const selectedSkill = skills.find((s) => s.name === selected) || null;
    const filtered = skills.filter((s) => matchesQuery(s, query));

    const byCategory = new Map();
    for (const s of filtered) {
        const cat = deriveCategory(s);
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat).push(s);
    }
    const otherCats = [...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    const orderedCats = [...CATEGORY_ORDER.filter((c) => byCategory.has(c)), ...otherCats];

    const sidebarBody = loading
        ? h('div', { key: 'loading', class: 'ds-plugins-sidebar-status' }, 'Loading…')
        : error
            ? h('div', { key: 'error', class: 'ds-plugins-sidebar-status ds-plugins-status-error' }, error)
            : filtered.length === 0
                ? h('div', { key: 'empty', class: 'ds-plugins-sidebar-status' }, skills.length === 0 ? 'No skills found' : 'No skills match your search')
                : h('div', { key: 'list', class: 'ds-plugins-list', role: 'listbox', 'aria-label': 'skill list' },
                    ...orderedCats.map((cat) => h('div', { key: 'grp-' + cat, class: 'ds-skills-group' },
                        h('div', { class: 'ds-skills-group-label' }, cat),
                        ...byCategory.get(cat).map((s) => SkillSidebarRow({
                            key: s.name,
                            skill: s,
                            active: selected === s.name,
                            busy: busyName === s.name,
                            onSelect,
                        })))));

    const footerText = filtered.length + ' skill' + (filtered.length === 1 ? '' : 's') +
        (query ? ' (of ' + skills.length + ')' : '');

    return h('div', { class: 'ds-plugins-overlay', onclick: (e) => { if (e.target === e.currentTarget && onClose) onClose(); } },
        h('div', { class: 'ds-plugins-modal', role: 'dialog', 'aria-label': 'Skills' },
            h('div', { class: 'ds-plugins-header' },
                h('span', { class: 'ds-plugins-title' }, 'Skills'),
                onClose ? h('button', { type: 'button', class: 'ds-plugins-close', onclick: onClose, 'aria-label': 'Close' }, '×') : null),
            h('div', { class: 'ds-skills-search-row' },
                SearchInput({ value: query, placeholder: 'search skills…', onInput: onQuery, label: 'search skills' })),
            h('div', { class: 'ds-plugins-body' },
                h('div', { class: 'ds-plugins-sidebar' }, sidebarBody),
                h('div', { class: 'ds-plugins-main' },
                    SkillDetail({ skill: selectedSkill, busy: busyName === (selectedSkill && selectedSkill.name), onToggle }))),
            h('div', { class: 'ds-plugins-footer' },
                h('span', { class: 'ds-plugins-footer-count' }, footerText))));
}
