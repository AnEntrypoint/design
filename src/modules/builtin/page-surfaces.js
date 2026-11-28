import * as webjsx from '../../../vendor/webjsx/index.js';
import { registerModule } from '../registry.js';
import { ForumView, PageView } from '../../components/community.js';
import { Game3RolesPanel } from '../../components/game3-roles.js';
import { Game3RulesPanel } from '../../components/game3-rules.js';

const h = webjsx.createElement;
const pageCol = (child) => h('div', { class: 'ds-g3-pagecol' }, child);
const serverName = (s) => (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || '');

registerModule({
    id: 'surface-rules', kind: 'surface',
    surface: {
        id: 'rules', channelName: 'rules', channelType: 'page', icon: 'ref-rules',
        body: ({ s, A }) => pageCol(Game3RulesPanel({ serverName: serverName(s), online: (s.rulesStats || {}).online || 0, members: (s.rulesStats || {}).members || 0, onDone: () => A.goToGeneral && A.goToGeneral() })),
    },
});

registerModule({
    id: 'surface-pick-roles', kind: 'surface',
    surface: {
        id: 'pick-roles', channelName: 'pick-roles', channelType: 'page', icon: 'ref-roles',
        body: ({ s, A }) => pageCol(Game3RolesPanel({ roles: s.selfRoles || [], onToggle: (id) => A.toggleSelfRole && A.toggleSelfRole(id), onDone: () => A.goToGeneral && A.goToGeneral() })),
    },
});

registerModule({ id: 'surface-announcements-icon', kind: 'surface', surface: { id: 'announcements-icon', channelName: 'announcements', icon: 'ref-mega' } });

export const forumBody = ({ s, A }) => ForumView({ posts: s.forumPosts || [], onSelect: (id) => A.openThread && A.openThread(id), onNewPost: () => A.newForumPost && A.newForumPost(), resolveAuthor: A.resolveAuthor });
export const pageBody = ({ s, A, ch }) => PageView({ title: ch.name, html: s.pageHtml || '', author: s.pageAuthor || '', updatedAt: s.pageUpdatedAt || 0, isAdmin: !!s.canManage, onEdit: () => A.editPage && A.editPage() });
