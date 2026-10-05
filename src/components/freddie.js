import { getRecentPaths, saveRecentPath } from './freddie/recent-paths.js';
import { skillLabel } from './freddie/skill-label.js';
import { renderChatMessages } from './freddie/chat-message-list.js';
import { buildNavPaletteActions, renderDashboardSide, renderDashboardShell } from './freddie/dashboard-shell.js';
import { home, agents, analytics } from './freddie/pages-overview.js';
import { chat, voice } from './freddie/pages-chat.js';
import { sessions, projects, git } from './freddie/pages-workspace.js';
import { models, skills, plugins } from './freddie/pages-models.js';
import { config, env } from './freddie/pages-config.js';
import { cron, tools, batch } from './freddie/pages-runners.js';
import { gateway, chains, machines, health } from './freddie/pages-infra.js';
import { logs, debug } from './freddie/pages-telemetry.js';
import { terminal } from './freddie/pages-terminal.js';
import { files } from './freddie/pages-files.js';
import { themePage as theme } from './freddie/pages-theme.js';
import { worktree } from './freddie/pages-worktree.js';
import { notifications } from './freddie/pages-notifications.js';

export const FREDDIE_PAGES = {
    home, chat, voice, sessions, projects, agents, analytics,
    models, cron, skills, plugins, config, env, tools, batch, gateway, chains,
    machines, health, debug, logs, git,
    terminal, files, auth: env, settings: config, theme, worktree,
    'session-tree': sessions,
    notifications,
};

export {
    home, agents, analytics,
    chat, voice,
    sessions, projects, git,
    models, skills, plugins, config, env,
    cron, tools, batch,
    gateway, chains, machines, health,
    logs, debug,
};

export { skillLabel, getRecentPaths, saveRecentPath, renderChatMessages };

export { buildNavPaletteActions, renderDashboardSide, renderDashboardShell };
