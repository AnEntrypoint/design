export function openProfileFor(app, s, identity, name) {
    if (!identity) return;
    const known = (s.memberCategories || []).flatMap((c) => c.members || []).find((m) => String(m.identity) === String(identity));
    const member = known || { identity, name: name || String(identity).slice(0, 8), status: 'offline' };
    app.st.card = { open: true, member };
    app.render();
}
