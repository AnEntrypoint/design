import * as webjsx from '../../../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function createMessageSearch(ctx) {
    const s = () => ctx.state;

    function messageSearchMatches() {
        const st = s();
        const q = st.searchQuery.trim().toLowerCase();
        if (!q) return [];
        const out = [];
        st.messages.forEach((m, i) => { if ((m.content || '').toLowerCase().includes(q)) out.push(i); });
        return out;
    }
    function scrollToMessage(index) {
        const nodes = document.querySelectorAll('.chat-msg');
        const el = nodes[index];
        if (!el) return;
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.classList.add('fd-msg-flash');
        setTimeout(() => el.classList.remove('fd-msg-flash'), 900);
    }
    function messageSearchOverlay() {
        const st = s();
        if (!st.searchOpen) return null;
        const matches = messageSearchMatches();
        return h('div', { class: 'fd-msg-search', role: 'search' },
            h('input', {
                class: 'fd-msg-search-input', type: 'text', placeholder: 'search this conversation…',
                value: st.searchQuery, autofocus: true,
                oninput: (e) => { st.searchQuery = e.target.value; st.searchHit = 0; ctx.rerender(); },
                onkeydown: (e) => {
                    if (e.key === 'Escape') { e.preventDefault(); st.searchOpen = false; st.searchQuery = ''; st.searchHit = 0; ctx.rerender(); }
                    else if (e.key === 'Enter' && matches.length) {
                        e.preventDefault();
                        scrollToMessage(matches[st.searchHit % matches.length]);
                        st.searchHit = (st.searchHit + 1) % matches.length;
                    }
                },
            }),
            h('span', { class: 'fd-msg-search-count' }, st.searchQuery ? (matches.length + ' match' + (matches.length === 1 ? '' : 'es')) : ''),
            h('button', { type: 'button', class: 'fd-msg-search-close', 'aria-label': 'close search', onclick: () => { st.searchOpen = false; st.searchQuery = ''; ctx.rerender(); } }, '×'));
    }

    return { messageSearchOverlay };
}
