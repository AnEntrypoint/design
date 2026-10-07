
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { sanitizeHtml } from '../../markdown.js';
const h = webjsx.createElement;

const clampCount = (n) => { const v = Number(n) || 0; return v > 99 ? '99+' : String(v); };

function fmtRelTime(ts) {
    const t = Number(ts) || 0;
    if (!t) return '';
    const ms = t > 1e12 ? t : t * 1000;
    const d = Math.max(0, Date.now() - ms);
    const m = Math.floor(d / 60000);
    if (m < 1) return 'now';
    if (m < 60) return m + 'm';
    const hr = Math.floor(m / 60);
    if (hr < 24) return hr + 'h';
    return Math.floor(hr / 24) + 'd';
}

function ListSkeleton({ cls, rows = 5 } = {}) {
    return h('div', { class: cls + ' cm-list-skeleton', 'aria-hidden': 'true' },
        ...Array.from({ length: rows }, (_, i) => h('div', { key: 'lsk' + i, class: 'cm-list-item-skeleton' },
            h('span', { class: 'ds-skel ds-skel-title' }), h('span', { class: 'ds-skel ds-skel-meta' }))));
}

export function ThreadPanel({ threads = [], activeId = null, title = 'Threads', onSelect, onCreate, onClose, onReply, loading = false } = {}) {
    const list = Array.isArray(threads) ? threads : [];
    let draft = '';
    const submit = () => {
        const text = draft.trim();
        if (!text || !onReply) return;
        onReply(text);
        draft = '';
        const input = document.querySelector('.cm-tp-reply-input');
        if (input) input.value = '';
    };
    return h('div', { class: 'cm-thread-panel', role: 'complementary', 'aria-label': title },
        h('div', { class: 'cm-tp-head' },
            h('span', { class: 'cm-tp-title' }, title),
            h('div', { class: 'cm-tp-head-actions' },
                onCreate ? h('button', { type: 'button', class: 'cm-tp-new', 'aria-label': 'new thread', title: 'New thread', onclick: onCreate }, '+') : null,
                onClose ? h('button', { type: 'button', class: 'cm-tp-close', 'aria-label': 'close', title: 'Close', onclick: onClose }, Icon('x')) : null
            )
        ),
        loading ? ListSkeleton({ cls: 'cm-tp-list' }) : h('div', { class: 'cm-tp-list' },
            list.length
                ? list.map(t => h('button', {
                    type: 'button', key: 'tp-' + t.id,
                    class: 'cm-tp-item' + (t.id === activeId ? ' is-active' : '') + (t.unread ? ' is-unread' : ''),
                    onclick: () => onSelect && onSelect(t.id)
                },
                    t.unread ? h('span', { class: 'cm-tp-dot', 'aria-hidden': 'true' }) : null,
                    h('span', { class: 'cm-tp-item-title' }, t.title || '(untitled)'),
                    t.lastMessage ? h('span', { class: 'cm-tp-item-snippet' }, t.lastMessage) : null,
                    h('span', { class: 'cm-tp-item-meta' },
                        t.author ? h('span', { class: 'cm-tp-item-author' }, t.author) : null,
                        t.time ? h('span', { class: 'cm-tp-item-time' }, fmtRelTime(t.time)) : null
                    )
                ))
                : h('div', { class: 'cm-tp-empty', role: 'status' },
                    Icon('thread', { size: 20 }),
                    h('span', { class: 'cm-tp-empty-text' }, onCreate ? 'no threads yet: start one' : 'no threads yet'))
        ),
        onReply ? h('form', {
            class: 'cm-tp-reply', onsubmit: (e) => { e.preventDefault(); submit(); }
        },
            h('input', {
                type: 'text', class: 'cm-tp-reply-input', placeholder: 'Reply…', 'aria-label': 'reply',
                oninput: (e) => { draft = e.target.value; }
            }),
            h('button', { type: 'submit', class: 'cm-tp-reply-send', 'aria-label': 'send reply' }, Icon('send'))
        ) : null
    );
}

const FORUM_SORTERS = {
    recent: (a, b) => (Number(b.time) || 0) - (Number(a.time) || 0),
    replies: (a, b) => (Number(b.replyCount) || 0) - (Number(a.replyCount) || 0),
    oldest: (a, b) => (Number(a.time) || 0) - (Number(b.time) || 0),
};

function forumAuthorLabel(post = {}, resolveAuthor) {
    if (post.authorName) return post.authorName;
    const raw = post.author ? String(post.author) : '';
    if (!raw) return null;
    if (typeof resolveAuthor === 'function') {
        const resolved = resolveAuthor(raw);
        if (resolved) return resolved;
    }
    return raw.length > 12 ? raw.slice(0, 8) + '…' + raw.slice(-4) : raw;
}

export function ForumView({ posts = [], onSearch, onSort, onSelect, onNewPost, loading = false, resolveAuthor } = {}) {
    const all = Array.isArray(posts) ? posts : [];
    const root = () => document.querySelector('.cm-forum');
    const readControls = () => {
        const host = root();
        const search = host ? host.querySelector('.cm-forum-search') : null;
        const sort = host ? host.querySelector('.cm-forum-sort') : null;
        return { query: search ? search.value : '', sort: (sort && sort.value) || 'recent' };
    };
    const listChildren = (query, sort) => {
        const needle = String(query || '').trim().toLowerCase();
        const matched = needle
            ? all.filter(p => String(p.title || '').toLowerCase().includes(needle)
                || String(p.snippet || '').toLowerCase().includes(needle))
            : all.slice();
        const rows = matched.sort(FORUM_SORTERS[sort] || FORUM_SORTERS.recent);
        if (!rows.length) {
            const emptyText = needle ? 'no posts match your search'
                : (onNewPost ? 'no posts yet: start the discussion' : 'no posts yet');
            return [h('div', { class: 'cm-forum-empty', role: 'status' },
                Icon('forum', { size: 20 }),
                h('span', { class: 'cm-forum-empty-text' }, emptyText))];
        }
        return rows.map(p => {
            const author = forumAuthorLabel(p, resolveAuthor);
            return h('button', {
                type: 'button', key: 'fp-' + p.id, class: 'cm-forum-item',
                onclick: () => onSelect && onSelect(p.id)
            },
                h('div', { class: 'cm-forum-item-head' },
                    h('span', { class: 'cm-forum-item-title' }, p.title || '(untitled)'),
                    h('span', { class: 'cm-forum-item-replies' }, clampCount(p.replyCount), Icon('chevron-right', { size: 13 }))
                ),
                p.snippet ? h('div', { class: 'cm-forum-item-snippet' }, p.snippet) : null,
                h('div', { class: 'cm-forum-item-meta' },
                    author ? h('span', { class: 'cm-forum-item-author' }, author) : null,
                    p.time ? h('span', { class: 'cm-forum-item-time' }, fmtRelTime(p.time)) : null,
                    Array.isArray(p.tags) && p.tags.length
                        ? h('span', { class: 'cm-forum-item-tags' }, ...p.tags.map((tag, i) =>
                            h('span', { class: 'cm-forum-tag', key: 'tg-' + i }, tag)))
                        : null
                )
            );
        });
    };
    const refresh = () => {
        if (loading) return;
        const host = root() ? root().querySelector('.cm-forum-list') : null;
        if (!host) return;
        const controls = readControls();
        webjsx.applyDiff(host, listChildren(controls.query, controls.sort));
    };
    const controls = readControls();
    return h('div', { class: 'cm-forum', role: 'region', 'aria-label': 'forum' },
        h('div', { class: 'cm-forum-toolbar' },
            h('input', {
                type: 'search', class: 'cm-forum-search', placeholder: 'Search posts…',
                'aria-label': 'search posts',
                oninput: (e) => { if (onSearch) onSearch(e.target.value); else refresh(); }
            }),
            h('select', {
                class: 'cm-forum-sort', 'aria-label': 'sort posts',
                onchange: (e) => { if (onSort) onSort(e.target.value); else refresh(); }
            },
                h('option', { value: 'recent' }, 'Recent'),
                h('option', { value: 'replies' }, 'Most replies'),
                h('option', { value: 'oldest' }, 'Oldest')
            ),
            onNewPost ? h('button', { type: 'button', class: 'cm-forum-new', onclick: onNewPost }, 'New post') : null
        ),
        loading ? ListSkeleton({ cls: 'cm-forum-list' }) : h('div', { class: 'cm-forum-list' }, ...listChildren(controls.query, controls.sort))
    );
}

export function PageView({ title = '', html = '', author = '', updatedAt = 0, isAdmin = false, onEdit } = {}) {
    return h('div', { class: 'cm-page', role: 'document' },
        h('div', { class: 'cm-page-head' },
            h('div', { class: 'cm-page-head-title' },
                h('h1', { class: 'cm-page-title' }, title || ''),
                (author || updatedAt) ? h('div', { class: 'cm-page-meta' },
                    author ? h('span', { class: 'cm-page-author' }, author) : null,
                    updatedAt ? h('span', { class: 'cm-page-time' }, fmtRelTime(updatedAt)) : null
                ) : null
            ),
            isAdmin && onEdit ? h('button', { type: 'button', class: 'cm-page-edit', onclick: onEdit }, 'Edit') : null
        ),
        html
            ? h('div', {
                class: 'cm-page-body',
                ref: (el) => {
                    if (!el) return;
                    sanitizeHtml(html).then((clean) => { el.innerHTML = clean; }).catch((e) => { console.error('sanitizeHtml failed:', e); el.innerHTML = '<p class="cm-page-empty">This page could not be rendered.</p>'; });
                }
            })
            : h('div', { class: 'cm-page-body' }, h('p', { class: 'cm-page-empty' }, 'This page is empty.'))
    );
}
