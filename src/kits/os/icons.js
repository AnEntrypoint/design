import { ICON_PATHS } from '../../components/shell.js';

const OS_PATHS = {
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
    browser: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    canvas: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 17l6-5 4 3 5-4 3 2"/>',
    files: ICON_PATHS.folder,
    monitor: '<path d="M3 12l4-8 4 14 4-10 4 8 2-3"/>',
    validator: ICON_PATHS.check,
    about: ICON_PATHS.info,
    apps: ICON_PATHS.grid,
    plus: '<path d="M12 5v14M5 12h14"/>',
    home: ICON_PATHS.menu,
    xdisplay: '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4M9 9l6 4M15 9l-6 4"/>',
    close: ICON_PATHS.x,
    chat: ICON_PATHS.forum,
    tools: '<path d="M14 7l3-3 3 3-3 3-3-3zM7 14l3 3-7 7-3-3 7-7zM5 7l3-3M14 14l6 6"/>',
    freddie: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M8 12a4 4 0 008 0"/>',
    minimize: '<path d="M5 12h14"/>',
    maximize: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    workspaces: ICON_PATHS.grid,
    gm: ICON_PATHS.activity,
    todo: ICON_PATHS['check-check'],
    config: ICON_PATHS.settings,
    notes: ICON_PATHS['file-text'],
    counter: ICON_PATHS.plus,
    snake: '<path d="M4 6c0 4 3 2 3 6s-3 2-3 6M17 6a3 3 0 0 1 0 6h-6a3 3 0 0 0 0 6h6"/>',
    'snake-ecs': '<path d="M4 6c0 4 3 2 3 6s-3 2-3 6M17 6a3 3 0 0 1 0 6h-6a3 3 0 0 0 0 6h6"/><circle cx="19" cy="6" r="1.5" fill="currentColor"/>',
    boids: '<path d="M12 4l4 8-4-2-4 2z"/><path d="M5 15l3 5-3-1-2 1z"/><path d="M19 15l-3 5 3-1 2 1z"/>',
    'level-editor': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/>',
    'game-player': '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M8 10v4M6 12h4"/><circle cx="16" cy="10.5" r="1"/><circle cx="18.5" cy="13" r="1"/>',
};

export const icons = Object.fromEntries(
    Object.entries(OS_PATHS).map(([name, inner]) => [
        name,
        `<svg class="ds-icon ds-icon-${name}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="var(--ds-icon-stroke, 1.6)" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
    ])
);
