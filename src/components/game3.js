import * as webjsx from '../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function LevelBar({ level = 0, xp = 0, nextXp = 0, key } = {}) {
    const span = Math.max(1, nextXp);
    const pct = Math.max(0, Math.min(100, (xp / span) * 100));
    return h('div', { key, class: 'ds-level', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(span), 'aria-valuenow': String(Math.min(xp, span)), 'aria-label': 'Level ' + level },
        h('span', { key: 'l', class: 'ds-level-tag' }, 'lv ' + level),
        h('div', { key: 't', class: 'ds-level-track' }, h('div', { key: 'f', class: 'ds-level-fill', style: '--ds-pct:' + pct.toFixed(1) })),
        h('span', { key: 'x', class: 'ds-level-xp' }, xp + ' / ' + nextXp + ' xp')
    );
}

export function Leaderboard({ rows = [], title = 'Leaderboard', key } = {}) {
    return h('section', { key, class: 'ds-leaderboard', 'aria-label': title },
        h('h3', { key: 'h', class: 'ds-leaderboard-title' }, title),
        h('ol', { key: 'o', class: 'ds-leaderboard-list' },
            rows.map((r, i) => h('li', { key: r.id || i, class: 'ds-leaderboard-row' },
                h('span', { key: 'p', class: 'ds-leaderboard-pos' }, '#' + (i + 1)),
                h('span', { key: 'n', class: 'ds-leaderboard-name' }, r.name),
                h('span', { key: 'v', class: 'ds-leaderboard-level' }, 'lv ' + r.level),
                h('span', { key: 'x', class: 'ds-leaderboard-xp' }, r.xp + ' xp')
            ))
        )
    );
}

export function PollCard({ question, options = [], votes = {}, myVote = null, onVote, closed = false, key } = {}) {
    const total = options.reduce((n, o) => n + (votes[o.id] || 0), 0);
    return h('div', { key, class: 'ds-poll' },
        h('div', { key: 'q', class: 'ds-poll-question' }, question),
        h('div', { key: 'o', class: 'ds-poll-options' },
            options.map((o) => {
                const n = votes[o.id] || 0;
                const pct = total ? Math.round((n / total) * 100) : 0;
                const mine = myVote === o.id;
                return h('button', {
                    key: o.id,
                    type: 'button',
                    class: 'ds-poll-option' + (mine ? ' is-mine' : ''),
                    disabled: closed ? true : null,
                    'aria-pressed': mine ? 'true' : 'false',
                    onclick: onVote && !closed ? () => onVote(o.id) : null
                },
                    h('span', { key: 'l', class: 'ds-poll-label' }, o.label),
                    h('span', { key: 'b', class: 'ds-poll-bar', style: '--ds-pct:' + pct, 'aria-hidden': 'true' }),
                    h('span', { key: 'c', class: 'ds-poll-count' }, n + ' · ' + pct + '%')
                );
            })
        ),
        h('div', { key: 't', class: 'ds-poll-total' }, total + ' vote' + (total === 1 ? '' : 's') + (closed ? ' · closed' : ''))
    );
}

export function AwayRecap({ since = '', lines = [], onDismiss, key } = {}) {
    return h('aside', { key, class: 'ds-recap', role: 'status' },
        h('div', { key: 'h', class: 'ds-recap-head' },
            h('strong', { key: 't' }, 'While you were away'),
            since ? h('span', { key: 's', class: 'ds-recap-since' }, 'since ' + since) : null,
            onDismiss ? h('button', { key: 'd', type: 'button', class: 'ds-recap-dismiss', onclick: onDismiss, 'aria-label': 'Dismiss recap' }, '×') : null
        ),
        h('ul', { key: 'l', class: 'ds-recap-list' },
            lines.map((l, i) => h('li', { key: l.id || i, class: 'ds-recap-line' },
                h('span', { key: 'a', class: 'ds-recap-author' }, l.author),
                h('span', { key: 'x', class: 'ds-recap-text' }, l.text)
            ))
        )
    );
}

export function InviteCard({ server, members = 0, onJoin, joined = false, dead = false, key } = {}) {
    return h('div', { key, class: 'ds-invite' + (dead ? ' is-dead' : '') },
        h('div', { key: 'k', class: 'ds-invite-kicker' }, 'Server invite'),
        h('div', { key: 'n', class: 'ds-invite-name' }, server),
        h('div', { key: 'm', class: 'ds-invite-meta' }, dead ? 'This invite has expired' : members + ' members'),
        h('button', {
            key: 'b',
            type: 'button',
            class: 'ds-invite-join',
            disabled: joined || dead ? true : null,
            onclick: onJoin && !joined && !dead ? onJoin : null
        }, dead ? 'Unavailable' : joined ? 'Joined' : 'Join server')
    );
}
