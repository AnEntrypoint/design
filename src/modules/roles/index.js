import { registerModule } from '../registry.js';
import { RoleList } from '../../components/game3-social.js';

registerModule({ id: 'surface-roles', kind: 'surface', surface: { id: 'roles', body: ({ s }) => RoleList({ roles: s.roles || [], emptyText: 'No roles in this server.' }) } });
