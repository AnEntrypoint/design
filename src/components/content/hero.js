import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

function heroStat(b, i) {
    const label = b && b.label != null ? b.label : b;
    return h('span', { key: 'hb' + i, class: 'ds-hero-stat' },
        h('strong', { class: 'ds-hero-stat-n' }, String(label)),
        (b && b.desc) ? h('span', { class: 'ds-hero-stat-l' }, String(b.desc)) : null);
}

export function Hero({ eyebrow, title, body, accent, actions, badges }) {
    const badgeList = Array.isArray(badges) ? badges.filter(Boolean) : [];
    const badgeRow = badgeList.length ? h('div', { class: 'ds-hero-stats' }, ...badgeList.map(heroStat)) : null;
    const actionRow = actions ? h('div', { class: 'ds-hero-actions' }, ...(Array.isArray(actions) ? actions : [actions])) : null;
    const aside = (badgeRow || actionRow) ? h('div', { class: 'ds-hero-aside' }, actionRow, badgeRow) : null;
    return h('div', { class: 'ds-hero' },
        h('div', { class: 'ds-hero-head' },
            eyebrow ? h('span', { class: 'eyebrow' }, eyebrow) : null,
            h('h1', { class: 'ds-hero-title' }, title)
        ),
        body ? h('p', { class: 'ds-hero-body' },
            body,
            accent ? h('span', { class: 'ds-hero-accent' }, ' ' + accent) : null
        ) : null,
        aside
    );
}

export function HeroFromPageData(hero) {
    if (!hero) return null;
    const heading = hero.heading || hero.title || '';
    const badges = Array.isArray(hero.badges) ? hero.badges.filter(Boolean) : [];
    const ctas = Array.isArray(hero.ctas) ? hero.ctas.filter(Boolean) : [];
    const badgeRow = badges.length ? h('div', { class: 'ds-hero-stats' }, ...badges.map(heroStat)) : null;
    const ctaRow = ctas.length
        ? h('div', { class: 'ds-hero-actions' }, ...ctas.map((c, i) =>
            h('a', {
                key: 'hc' + i,
                class: (c.primary || i === 0) ? 'btn btn-primary' : 'btn btn-ghost',
                href: c.href || '#',
            }, c.label || c.cta || 'go')))
        : null;
    const installRow = hero.install
        ? h('div', { class: 'cli' },
            h('span', { class: 'prompt' }, '$'),
            h('span', { class: 'cmd' }, hero.install))
        : null;
    return h('div', { class: 'ds-hero' },
        h('div', { class: 'ds-hero-head' },
            hero.eyebrow ? h('span', { class: 'eyebrow' }, hero.eyebrow) : null,
            h('h1', { class: 'ds-hero-title' }, heading)
        ),
        hero.subheading ? h('p', { class: 'ds-hero-body lede' }, hero.subheading) : null,
        hero.body ? h('p', { class: 'ds-hero-body' },
            hero.body,
            hero.accent ? h('span', { class: 'ds-hero-accent' }, ' ' + hero.accent) : null,
        ) : null,
        (badgeRow || ctaRow || installRow)
            ? h('div', { class: 'ds-hero-aside' }, installRow, ctaRow, badgeRow)
            : null,
    );
}

export function Marquee({ items = [], sep = '/' }) {
    if (!items.length) return null;
    const run = items.flatMap((it, i) => [
        h('span', { class: 'ds-marquee-item', key: `i${i}` }, it),
        ...(i < items.length - 1 ? [h('span', { class: 'ds-marquee-sep', key: `s${i}`, 'aria-hidden': 'true' }, sep)] : []),
    ]);
    return h('div', { class: 'ds-marquee', role: 'region', 'aria-label': 'Highlights' },
        h('div', { class: 'ds-marquee-track' }, ...run)
    );
}

export function Manifesto({ paragraphs = [], maxWidth }) {
    return h('div', {
        class: 'ds-prose ds-manifesto',
        'data-max-width': maxWidth ? String(maxWidth) : null
    },
        ...paragraphs.map((p, i) => h('p', {
            key: i,
            class: 'ds-manifesto-para' + (p.dim ? ' dim' : '')
        }, p.text || p))
    );
}

export function PageHeader({ title, lede, eyebrow, right, compact, dense, id }) {
    if (dense) {
        return h('section', { class: 'ds-section ds-section-compact ds-page-header-dense', ...(id ? { id } : {}) },
            h('div', { class: 'ds-page-header-dense-row' },
                ...[
                    title != null ? h('h1', { key: 'dh' }, title) : null,
                    lede != null ? h('span', { key: 'dl', class: 'ds-page-header-dense-lede', title: typeof lede === 'string' ? lede : null }, lede) : null,
                    right != null ? h('div', { key: 'dr', class: 'ds-page-header-right' }, ...(Array.isArray(right) ? right : [right])) : null,
                ].filter(Boolean)));
    }
    return h('section', { class: 'ds-section' + (compact ? ' ds-section-compact' : ''), ...(id ? { id } : {}) },
        eyebrow ? h('span', { class: 'eyebrow' }, eyebrow) : null,
        title != null ? h('h1', {}, title) : null,
        lede != null ? h('p', { class: 'lede' }, lede) : null,
        right != null ? h('div', { class: 'ds-page-header-right' }, ...(Array.isArray(right) ? right : [right])) : null
    );
}
