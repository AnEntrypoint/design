import * as webjsx from '../vendor/webjsx/index.js';
const h = webjsx.createElement;

// ---------- primitives ----------

export function Brand({ name = '247420', leaf } = {}) {
    return h('span', { class: 'brand' }, name,
        leaf ? h('span', { class: 'slash' }, ' / ') : null,
        leaf || null);
}

export function Chip({ tone = '', children }) {
    return h('span', { class: 'chip' + (tone ? ' ' + tone : '') }, children);
}

export function Btn({ href = '#', primary, children, onClick }) {
    return h('a', {
        class: primary ? 'btn-primary' : 'btn',
        href,
        onclick: onClick
    }, children);
}

export function Glyph({ children, color }) {
    return h('span', { class: 'glyph', style: color ? `color:${color}` : '' }, children);
}

// ---------- chrome ----------

export function Topbar({ brand = '247420', leaf = '', items = [], active = '', onNav, search } = {}) {
    return h('header', { class: 'app-topbar' },
        Brand({ name: brand, leaf }),
        search ? h('label', { class: 'app-search' },
            h('span', { class: 'icon' }, '⌕'),
            h('input', { type: 'search', placeholder: search, 'aria-label': 'search' })
        ) : null,
        h('nav', {}, ...items.map(([label, href]) =>
            h('a', {
                key: label,
                href,
                class: active === label.replace(' ↗', '') ? 'active' : '',
                onclick: (e) => {
                    if (!String(href).startsWith('http') && onNav) {
                        e.preventDefault();
                        onNav(label.replace(' ↗', ''));
                    }
                }
            }, label)
        ))
    );
}

export function Crumb({ trail = [], leaf = '', right } = {}) {
    const parts = [];
    trail.forEach((t, i) => {
        parts.push(h('span', { key: 't' + i }, t));
        parts.push(h('span', { key: 's' + i, class: 'sep' }, '›'));
    });
    parts.push(h('span', { key: 'leaf', class: 'leaf' }, leaf));
    if (right) parts.push(h('span', { key: 'r', style: 'margin-left:auto;display:flex;gap:10px;align-items:center' }, ...(Array.isArray(right) ? right : [right])));
    return h('div', { class: 'app-crumb' }, ...parts);
}

export function Side({ sections = [] } = {}) {
    return h('aside', { class: 'app-side' }, ...sections.flatMap(sec => [
        h('div', { class: 'group', key: sec.group }, sec.group),
        ...sec.items.map((item, i) => {
            const { glyph, label, href = '#', active, count, color, onClick } = item;
            return h('a', {
                key: sec.group + i,
                href,
                class: active ? 'active' : '',
                onclick: onClick
            },
                glyph != null ? Glyph({ children: glyph, color }) : null,
                h('span', {}, label),
                count != null ? h('span', { class: 'count' }, String(count)) : null
            );
        })
    ]));
}

export function Status({ left = [], right = [] } = {}) {
    return h('footer', { class: 'app-status' },
        ...left.map((t, i) => h('span', { key: 'l' + i, class: 'item' }, t)),
        h('span', { class: 'spread' }),
        ...right.map((t, i) => h('span', { key: 'r' + i, class: 'item' }, t))
    );
}

export function AppShell({ topbar, crumb, side, main, status, narrow } = {}) {
    const hasSide = Boolean(side);
    const sideMotionClass = hasSide
        ? ' animate__animated animate__fadeInLeft'
        : ' animate__animated animate__fadeOutLeft';
    const sideNode = hasSide
        ? side
        : h('aside', { class: 'app-side', 'aria-hidden': 'true' });

    return h('div', { class: 'app' },
        topbar || null,
        crumb || null,
        h('div', { class: 'app-body' + (hasSide ? '' : ' no-side') },
            h('div', { class: 'app-side-shell' + sideMotionClass }, sideNode),
            h('main', { class: 'app-main' + (narrow ? ' narrow' : '') }, ...(Array.isArray(main) ? main : [main]))
        ),
        status || null
    );
}

// ---------- panels & rows ----------

export function Panel({ title, count, right, style = '', children }) {
    return h('div', { class: 'panel', style },
        title != null ? h('div', { class: 'panel-head' },
            h('span', {}, title),
            right != null ? right : (count != null ? h('span', {}, String(count)) : null)
        ) : null,
        h('div', { class: 'panel-body' }, ...(Array.isArray(children) ? children : [children]))
    );
}

export function Row({ code, title, sub, meta, active, onClick, key, style }) {
    return h('div', {
        key,
        class: 'row' + (active ? ' active' : ''),
        onclick: onClick,
        style
    },
        code != null ? h('span', { class: 'code' }, code) : null,
        h('span', { class: 'title' }, title, sub ? h('span', { class: 'sub' }, sub) : null),
        meta != null ? h('span', { class: 'meta' }, meta) : null
    );
}

export function RowLink({ code, title, sub, meta, href = '#', key }) {
    return h('a', { key, class: 'row', href },
        code != null ? h('span', { class: 'code' }, code) : null,
        h('span', { class: 'title' }, title, sub ? h('span', { class: 'sub' }, sub) : null),
        meta != null ? h('span', { class: 'meta' }, meta) : null
    );
}

// ---------- content blocks ----------

export function Heading({ level = 1, children, style = '' }) {
    return h('h' + level, { style }, children);
}

export function Lede({ children }) {
    return h('p', { class: 'lede' }, children);
}

export function Hero({ title, body, accent, badge, badgeCount }) {
    return h('div', { style: 'padding:32px 32px 24px 32px' },
        h('h1', { style: 'font-size:36px;font-weight:600;margin:0 0 4px 0;color:var(--panel-text);letter-spacing:-0.01em' }, title),
        body ? h('p', { style: 'font-size:14px;line-height:1.55;color:var(--panel-text-2);max-width:64ch;margin:0 0 20px 0' },
            body,
            accent ? h('span', { style: 'color:var(--panel-accent);font-weight:500' }, ' ' + accent) : null
        ) : null,
        badge ? Panel({ title: badge, count: badgeCount, style: 'max-width:560px;margin:0', children: [] }) : null
    );
}

export function Install({ cmd, copied, onCopy }) {
    return h('div', { class: 'cli' },
        h('span', { class: 'prompt' }, '$'),
        h('span', { class: 'cmd' }, cmd),
        h('span', { class: 'copy', onclick: () => onCopy && onCopy(cmd) }, copied ? 'copied' : 'copy')
    );
}

export function Receipt({ rows = [] }) {
    return h('table', { class: 'kv' },
        h('tbody', {}, ...rows.map(([k, v], i) =>
            h('tr', { key: i }, h('td', {}, k), h('td', {}, v))
        ))
    );
}

export function Changelog({ entries = [] }) {
    return Panel({
        style: 'max-width:900px',
        children: entries.map((e, i) =>
            h('div', { key: i, class: 'row', style: 'grid-template-columns:100px 70px 1fr' },
                h('span', { class: 'code' }, e.date),
                h('span', { style: 'color:var(--panel-accent);font-family:var(--ff-mono);font-size:14px' }, e.ver),
                h('span', { class: 'title' }, e.msg)
            )
        )
    });
}

export function WorksList({ works = [], openedIndex = -1, onToggle }) {
    return Panel({
        title: `works · ${String(works.length).padStart(2, '0')} of ~${works.length}`,
        right: h('a', { href: 'https://github.com/AnEntrypoint', style: 'color:var(--panel-accent);text-decoration:none' }, 'all repos ↗'),
        children: works.map((w, i) => {
            const isOpen = openedIndex === i;
            return h('div', { key: i },
                Row({
                    code: w.code, title: w.title, sub: w.sub,
                    meta: w.meta + '  ' + (isOpen ? '−' : '+'),
                    active: isOpen,
                    onClick: () => onToggle && onToggle(isOpen ? -1 : i)
                }),
                isOpen ? h('div', {
                    class: 'work-detail',
                    'data-work-index': String(i),
                    style: 'padding:14px 20px 18px 86px;background:var(--panel-2);color:var(--panel-text);font-size:13px;line-height:1.6'
                },
                    h('p', { style: 'margin:0 0 12px 0;max-width:64ch' }, w.body),
                    h('div', { style: 'display:flex;gap:8px' },
                        Btn({ primary: true, href: w.href || '#', children: 'open ↗' }),
                        Btn({ href: w.source || '#', children: 'source' })
                    )
                ) : null
            );
        })
    });
}

export function WritingList({ posts = [] }) {
    return Panel({
        children: posts.map((p, i) =>
            RowLink({ key: i, code: p.date, title: p.title, meta: '§ ' + p.tag, href: p.href || '#' })
        )
    });
}

export function Manifesto({ paragraphs = [], maxWidth = 820 }) {
    return Panel({
        style: `max-width:${maxWidth}px`,
        children: h('div', { style: 'padding:20px 24px;font-size:14px;line-height:1.7;color:var(--panel-text)' },
            ...paragraphs.map((p, i) => h('p', {
                key: i,
                style: 'margin:0 0 12px 0' + (p.dim ? ';color:var(--panel-text-2)' : '')
            }, p.text || p))
        )
    });
}

export function Section({ title, children }) {
    return h('div', { style: 'padding:20px 32px' },
        title ? h('h3', {}, title) : null,
        ...(Array.isArray(children) ? children : [children])
    );
}

// ---------- assembled page views ----------

export function HomeView({ state, onNav, onToggleWork, works, posts, manifesto, currentlyShipping }) {
    return [
        Hero({
            title: 'the creative department of the internet.',
            body: '247420 is a collective of mercurials. we ship fast, break things on purpose, and document honestly.',
            accent: 'humor is load-bearing.'
        }),
        currentlyShipping ? h('div', { style: 'padding:0 32px 24px 32px' },
            Panel({
                title: 'currently shipping',
                count: currentlyShipping.length,
                style: 'max-width:560px;margin:0',
                children: currentlyShipping.map((row, i) =>
                    Row({
                        key: i,
                        code: h('span', { style: `color:${row.live ? 'var(--panel-accent)' : 'var(--panel-text-3)'}` }, row.live ? '●' : '○'),
                        title: row.title, sub: row.sub, meta: row.meta
                    })
                )
            })
        ) : null,
        Section({ title: '// works', children: WorksList({ works, openedIndex: state.opened, onToggle: onToggleWork }) }),
        Section({ title: '// recent writing', children: WritingList({ posts }) }),
        Section({ title: '// manifesto · rough draft', children: Manifesto({ paragraphs: manifesto }) })
    ];
}

// ---------- chat ----------

function fmtBytes(n) {
    if (n == null) return '';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
    return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function renderInline(text) {
    if (text == null) return [];
    const out = [];
    const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let last = 0;
    let m;
    let i = 0;
    const push = (node) => out.push(node);
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) push(h('span', { key: 's' + i + 'a' }, text.slice(last, m.index)));
        if (m[2] != null) push(h('strong', { key: 's' + i }, m[2]));
        else if (m[3] != null) push(h('em', { key: 's' + i }, m[3]));
        else if (m[4] != null) push(h('code', { key: 's' + i, class: 'chat-tick' }, m[4]));
        else if (m[5] != null) push(h('a', { key: 's' + i, href: m[6], target: '_blank', rel: 'noopener' }, m[5]));
        last = m.index + m[0].length;
        i += 1;
    }
    if (last < text.length) push(h('span', { key: 's' + i + 'a' }, text.slice(last)));
    return out;
}

function renderMd(text) {
    // markdown-lite block: blank line = paragraph, line starting with "- " = bullet.
    const lines = String(text || '').split('\n');
    const blocks = [];
    let para = [];
    let bullets = [];
    const flush = () => {
        if (para.length) { blocks.push({ kind: 'p', text: para.join(' ') }); para = []; }
        if (bullets.length) { blocks.push({ kind: 'ul', items: bullets.slice() }); bullets = []; }
    };
    lines.forEach((raw) => {
        const ln = raw.trim();
        if (!ln) { flush(); return; }
        if (/^[-*]\s+/.test(ln)) { if (para.length) flush(); bullets.push(ln.replace(/^[-*]\s+/, '')); return; }
        if (bullets.length) flush();
        para.push(ln);
    });
    flush();
    return blocks.map((b, i) =>
        b.kind === 'p'
            ? h('p', { key: 'b' + i }, ...renderInline(b.text))
            : h('ul', { key: 'b' + i }, ...b.items.map((it, j) => h('li', { key: 'l' + j }, ...renderInline(it))))
    );
}

const FILE_GLYPHS = { pdf: '▤', zip: '▦', tar: '▦', gz: '▦', mp4: '▶', mp3: '♪', wav: '♪', csv: '⊞', json: '{}', md: '§', txt: '§', default: '◫' };
function fileGlyph(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    return FILE_GLYPHS[ext] || FILE_GLYPHS.default;
}

const PART_RENDERERS = {
    text: (p) => h('div', { class: 'chat-bubble' }, ...renderInline(p.text || '')),
    md:   (p) => h('div', { class: 'chat-bubble chat-md' }, ...renderMd(p.text || '')),
    code: (p) => h('div', { class: 'chat-bubble chat-code' },
        h('div', { class: 'chat-code-head' },
            h('span', { class: 'lang' }, p.lang || 'code'),
            p.filename ? h('span', { class: 'name' }, p.filename) : null
        ),
        h('pre', {}, h('code', { class: p.lang ? 'lang-' + p.lang : '' }, p.code || ''))
    ),
    image: (p) => h('a', { class: 'chat-image', href: p.href || p.src, target: '_blank', rel: 'noopener' },
        h('img', { src: p.src, alt: p.alt || '', loading: 'lazy' }),
        p.caption ? h('span', { class: 'cap' }, p.caption) : null
    ),
    pdf: (p) => h('div', { class: 'chat-pdf' },
        h('div', { class: 'chat-pdf-head' },
            h('span', { class: 'glyph' }, '▤'),
            h('span', { class: 'name' }, p.name || 'document.pdf'),
            p.size != null ? h('span', { class: 'size' }, fmtBytes(p.size)) : null,
            h('a', { class: 'open', href: p.src, target: '_blank', rel: 'noopener' }, 'open ↗')
        ),
        h('embed', { src: p.src, type: 'application/pdf' })
    ),
    file: (p) => h('a', { class: 'chat-file', href: p.src, target: '_blank', rel: 'noopener', download: p.name || true },
        h('span', { class: 'glyph' }, fileGlyph(p.name)),
        h('span', { class: 'meta' },
            h('span', { class: 'name' }, p.name || 'attachment'),
            h('span', { class: 'size' }, [p.kindLabel || (p.name || '').split('.').pop().toUpperCase(), p.size != null ? fmtBytes(p.size) : null].filter(Boolean).join(' · '))
        ),
        h('span', { class: 'go' }, '↓')
    ),
    link: (p) => h('a', { class: 'chat-link', href: p.href, target: '_blank', rel: 'noopener' },
        p.thumb ? h('img', { class: 'thumb', src: p.thumb, alt: '' }) : null,
        h('span', { class: 'meta' },
            h('span', { class: 'host' }, p.host || (() => { try { return new URL(p.href).host; } catch { return ''; } })()),
            h('span', { class: 'title' }, p.title || p.href),
            p.desc ? h('span', { class: 'desc' }, p.desc) : null
        )
    )
};

function renderPart(p, key) {
    const fn = PART_RENDERERS[p.kind] || PART_RENDERERS.text;
    const node = fn(p);
    if (node && typeof node === 'object') node.props = { ...(node.props || {}), key: 'p' + key };
    return node;
}

export function ChatMessage({ who = 'them', avatar, text, parts, time, typing, key, aicat, reactions, receipt, name }) {
    const cls = 'chat-msg ' + who + (aicat && who === 'them' ? ' aicat' : '');
    const av = h('span', { class: 'chat-avatar' }, avatar || (who === 'you' ? 'u' : '?'));

    let bodyNodes;
    if (typing) {
        bodyNodes = [h('span', { class: 'chat-typing', key: 'typ' }, h('span'), h('span'), h('span'))];
    } else if (parts && parts.length) {
        bodyNodes = parts.map((p, i) => renderPart(p, i));
    } else {
        bodyNodes = [h('div', { class: 'chat-bubble', key: 't' }, ...renderInline(text || ''))];
    }

    const reactionRow = reactions && reactions.length
        ? h('div', { class: 'chat-reactions' },
            ...reactions.map((r, i) => h('span', { class: 'rxn' + (r.you ? ' you' : ''), key: 'r' + i },
                h('span', { class: 'e' }, r.emoji),
                h('span', { class: 'n' }, String(r.count))
            )))
        : null;

    const receiptMark = who === 'you' && receipt
        ? h('span', { class: 'tick' + (receipt === 'read' ? ' read' : '') }, receipt === 'read' ? '✓✓' : '✓')
        : null;

    const metaItems = [];
    if (name && who === 'them') metaItems.push(h('span', { class: 'who', key: 'w' }, name));
    if (time) metaItems.push(h('span', { class: 't', key: 'ti' }, time));
    if (receiptMark) metaItems.push(receiptMark);
    const meta = metaItems.length ? h('div', { class: 'chat-meta' }, ...metaItems) : null;

    const stack = h('div', { class: 'chat-stack' }, ...bodyNodes, reactionRow, meta);
    return h('div', { key, class: cls },
        who === 'you' ? stack : av,
        who === 'you' ? av : stack
    );
}

export { renderInline, renderMd, fmtBytes };

export function ChatComposer({ value, onInput, onSend, placeholder = 'message…', disabled }) {
    const send = () => {
        const v = (value || '').trim();
        if (!v || disabled) return;
        if (onSend) onSend(v);
    };
    return h('div', { class: 'chat-composer' },
        h('textarea', {
            value: value || '',
            placeholder,
            rows: 1,
            oninput: (e) => onInput && onInput(e.target.value),
            onkeydown: (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                }
            }
        }),
        h('button', {
            class: 'send',
            disabled: disabled || !(value && value.trim()),
            onclick: send
        }, '↑')
    );
}

export function Chat({ title = 'chat', sub, messages = [], composer, header } = {}) {
    return h('div', { class: 'chat' },
        header || h('div', { class: 'chat-head' },
            h('span', { class: 'dot' }),
            h('span', {}, title),
            sub ? h('span', { class: 'sub' }, ' · ' + sub) : null,
            h('span', { class: 'spread' }),
            h('span', { class: 'sub' }, String(messages.length).padStart(2, '0') + ' msgs')
        ),
        h('div', { class: 'chat-thread' },
            ...messages.map((m, i) => ChatMessage({ ...m, key: m.key != null ? m.key : i }))
        ),
        composer || null
    );
}

const AICAT_FACE = ` /\\_/\\\n( o.o )\n > ^ <`;

export function AICatPortrait({ name = 'aicat', status = 'idle', face } = {}) {
    return h('div', { class: 'aicat-portrait' },
        h('pre', { class: 'aicat-face' }, face || AICAT_FACE),
        h('div', { class: 'aicat-meta' },
            h('span', { class: 'name' }, name),
            h('span', { class: 'status' },
                h('span', { class: 'dot' }, '● '),
                status
            )
        )
    );
}

export function AICat({ name = 'aicat', messages = [], thinking, composer, status = 'online · purring' } = {}) {
    const annotated = messages.map((m) =>
        m.who === 'them' ? { ...m, aicat: true, avatar: m.avatar || '=^.^=' } : m
    );
    const all = thinking
        ? [...annotated, { who: 'them', aicat: true, avatar: '=^.^=', typing: true, key: '_thinking' }]
        : annotated;
    return h('div', { class: 'chat' },
        h('div', { class: 'chat-head' },
            h('span', { class: 'dot' }),
            h('span', {}, name),
            h('span', { class: 'sub' }, ' · ' + status),
            h('span', { class: 'spread' }),
            h('span', { class: 'sub' }, String(messages.length).padStart(2, '0') + ' turns')
        ),
        h('div', { class: 'chat-thread' },
            ...all.map((m, i) => ChatMessage({ ...m, key: m.key != null ? m.key : i }))
        ),
        composer || null
    );
}

export { AICAT_FACE };

export function ProjectView({ project, copied, onCopy }) {
    return [
        Heading({ level: 1, children: project.name }),
        Lede({ children: project.tagline }),
        Heading({ level: 3, children: 'install' }),
        Install({ cmd: project.install, copied, onCopy }),
        Heading({ level: 3, children: 'receipt' }),
        Receipt({ rows: project.receipt }),
        Heading({ level: 3, children: 'changelog' }),
        Changelog({ entries: project.changelog })
    ];
}

export { h };
