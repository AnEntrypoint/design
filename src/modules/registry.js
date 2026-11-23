const channelTypes = new Map();
const groups = new Map();
const surfaces = new Map();
const panes = new Map();
const messageKinds = new Map();
const popovers = new Map();
const modules = new Map();

const need = (cond, id, message) => { if (!cond) throw new Error('module ' + id + ': ' + message); };

const KINDS = ['channelType', 'serverType', 'settingsPane', 'surface', 'messageKind', 'popover', 'railSection'];
const sections = new Map();

const addGroup = (id, g) => {
    const group = { id: g.id || g, label: g.label, order: g.order, voice: !!g.voice, createType: g.createType === undefined ? null : g.createType, always: !!g.always };
    if (groups.has(group.id)) {
        const prev = groups.get(group.id);
        if (g.label) Object.assign(prev, { label: group.label, order: group.order, voice: group.voice, createType: group.createType, always: group.always });
        return;
    }
    need(group.label && typeof group.order === 'number', String(group.id), 'a new rail group needs a label and an order');
    groups.set(group.id, group);
};

export function registerModule(m) {
    need(m && typeof m.id === 'string' && /^[a-z][a-z0-9-]*$/.test(m.id), m && m.id, 'id must be lowercase letters, digits and dashes');
    need(KINDS.includes(m.kind), m.id, 'kind must be one of ' + KINDS.join(', '));
    need(!modules.has(m.id), m.id, 'already registered');
    if (m.kind === 'channelType') {
        const t = m.channelType;
        need(t && typeof t.type === 'string' && t.label && t.icon, m.id, 'channelType needs type, label and icon');
        need(!channelTypes.has(t.type), m.id, 'channel type ' + t.type + ' is already registered');
        need(t.railGroup, m.id, 'channelType needs railGroup');
        const group = typeof t.railGroup === 'string' ? t.railGroup : t.railGroup.id;
        if (typeof t.railGroup !== 'string') addGroup(group, t.railGroup);
        channelTypes.set(t.type, { id: m.id, group, traits: {}, ...t, railGroup: group });
    } else if (m.kind === 'surface') {
        const x = m.surface;
        need(x && x.id && (typeof x.body === 'function' || x.icon), m.id, 'surface needs id and a body(ctx) or an icon');
        surfaces.set(x.id, { module: m.id, ...x });
    } else if (m.kind === 'settingsPane') {
        const x = m.settingsPane;
        need(x && x.id && x.label && typeof x.mount === 'function', m.id, 'settingsPane needs id, label and mount(ctx)');
        panes.set(x.id, { module: m.id, order: 100, ...x });
    } else if (m.kind === 'messageKind') {
        const x = m.messageKind;
        need(x && x.id && typeof x.match === 'function' && typeof x.mount === 'function', m.id, 'messageKind needs id, match(message) and mount(ctx)');
        messageKinds.set(x.id, { module: m.id, ...x });
    } else if (m.kind === 'railSection') {
        const x = m.railSection;
        need(x && x.id && typeof x.mount === 'function', m.id, 'railSection needs id and mount(ctx)');
        sections.set(x.id, { module: m.id, order: 100, ...x });
    } else if (m.kind === 'popover') {
        const x = m.popover;
        need(x && x.id && typeof x.mount === 'function', m.id, 'popover needs id and mount(ctx)');
        popovers.set(x.id, { module: m.id, ...x });
    }
    modules.set(m.id, m);
    return m.id;
}

export const registerGroup = (g) => addGroup(g.id, g);
export const channelType = (type) => channelTypes.get(type) || channelTypes.get('text');
export const hasChannelType = (type) => channelTypes.has(type);
export const channelTypeList = () => [...channelTypes.values()];
export const railGroups = () => [...groups.values()].sort((a, b) => a.order - b.order);
export const groupOf = (channel) => channelType(channel.type).railGroup;
export const surfaceFor = (id) => surfaces.get(id) || null;
export const surfaceForChannel = (channel) => [...surfaces.values()].find((x) => x.channelName && x.channelName === channel.name && (!x.channelType || x.channelType === channel.type)) || null;
export const settingsPanes = () => [...panes.values()].sort((a, b) => a.order - b.order);
export const railSections = () => [...sections.values()].sort((a, b) => a.order - b.order);
export const messageKindFor = (m) => [...messageKinds.values()].find((k) => typeof k.match === 'function' && k.match(m)) || null;
export const messageKindList = () => [...messageKinds.values()];
export const popoverList = () => [...popovers.values()];
export const moduleList = () => [...modules.keys()];
