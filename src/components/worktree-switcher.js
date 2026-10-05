
import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
import { Dropdown } from './overlay-primitives.js';
const h = webjsx.createElement;

const NEW_WORKTREE_ID = '__ds_new_worktree__';

export function WorktreeSwitcher({ worktrees = [], current, onSwitch, onCreate, ariaLabel = 'switch worktree' } = {}) {
    const isCurrent = (wt) => wt.current || (current != null && wt.path === current);
    const activeWt = worktrees.find(isCurrent) || worktrees[0];
    const byId = new Map(worktrees.map((wt, i) => [wt.path || String(i), wt]));

    const items = [
        ...worktrees.map((wt, i) => ({
            id: wt.path || String(i),
            label: h('span', { class: 'ds-wts-item-body' },
                h('span', { class: 'ds-wts-item-check', 'aria-hidden': 'true' },
                    isCurrent(wt) ? Icon('check', { size: 14 }) : null),
                h('span', { class: 'ds-wts-item-text' },
                    h('span', { class: 'ds-wts-item-branch' }, wt.branch || '(detached HEAD)'),
                    h('span', { class: 'ds-wts-item-path' }, wt.path)
                ),
            ),
            disabled: isCurrent(wt),
        })),
        worktrees.length && onCreate ? { separator: true } : null,
        onCreate ? {
            id: NEW_WORKTREE_ID,
            glyph: '+',
            label: 'new worktree',
        } : null,
    ].filter(Boolean);

    const onSelect = (id) => {
        if (id === NEW_WORKTREE_ID) { onCreate && onCreate(); return; }
        const wt = byId.get(id);
        if (wt && onSwitch && !isCurrent(wt)) onSwitch(wt);
    };

    const trigger = h('button', { type: 'button', class: 'ds-wts-trigger' },
        h('span', { class: 'ds-wts-trigger-branch' }, (activeWt && activeWt.branch) || 'select worktree'),
        h('span', { class: 'ds-wts-trigger-caret', 'aria-hidden': 'true' }, Icon('chevron-down', { size: 13 }))
    );

    return h('span', { class: 'ds-wts' }, Dropdown({ trigger, items, onSelect, ariaLabel }));
}
