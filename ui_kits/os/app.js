import { createDesktopShell, renderWindow, renderAboutApp, renderMonitorApp, themeUrl } from 'ds/kits/os/index.js';

function createDemoWm(root) {
    const wins = new Map();
    let nextId = 1;
    let zTop = 1;
    return {
        get count() { return wins.size; },
        list() { return [...wins.values()].map(w => ({ id: w.id, title: w.title, focused: w.focused })); },
        open({ title, body, width = 480, height = 320, x = 60, y = 60, maximized = false }) {
            const id = 'w' + nextId++;
            const handle = renderWindow({
                title, body, bounds: { x, y, w: width, h: height }, focused: true, maximized,
                callbacks: {
                    onClose: () => { handle.dispose(); wins.delete(id); },
                    onFocus: () => this.focus(id),
                    onMinimize: () => handle.setMinimized(true),
                    onMaximize: () => handle.setMaximized(!handle.el.classList.contains('wm-max')),
                },
            });
            root.appendChild(handle.el);
            handle.setZIndex(++zTop);
            const entry = { id, title, focused: true, handle };
            wins.set(id, entry);
            this.focus(id);
            return handle;
        },
        focus(id) {
            for (const [wid, w] of wins) {
                w.focused = wid === id;
                w.handle.setFocused(w.focused);
                if (w.focused) w.handle.setZIndex(++zTop);
            }
        },
    };
}

function createDemoRegistry(apps) {
    const byId = new Map(apps.map(a => [a.id, a]));
    return {
        list() { return apps; },
        get(id) { return byId.get(id); },
    };
}

const canvas = document.getElementById('root');
canvas.classList.add('wm-root');

const wm = createDemoWm(canvas);

const ABOUT_CONTENT = {
    brand: '247420 / os',
    tagline: 'browser-native desktop-shell demo for the 247420 design system. window manager, taskbar and menubar, with no server behind it.',
    bullets: [
        'every component is rendered in a working kit',
        'one token file drives every surface',
        'axe-core scan of WCAG-tagged rules, run locally',
        'webjsx + custom elements, no framework',
        'buildless: plain HTML + an import map',
    ],
    footer: 'click apps menu for more.',
    links: [{ href: 'https://github.com/AnEntrypoint/design', text: 'source' }],
};

const registry = createDemoRegistry([
    {
        id: 'about', name: 'about', icon: 'info', defaultSize: { w: 440, h: 400 },
        factory() {
            return { node: renderAboutApp(ABOUT_CONTENT).node };
        },
    },
    {
        id: 'monitor', name: 'monitor', icon: 'activity', defaultSize: { w: 360, h: 220 },
        factory() {
            return {
                node: renderMonitorApp({
                    getStats: () => ({
                        instanceId: 'demo', frames: 0, shells: 0,
                        windows: wm.count, appsRegistered: registry.list().length,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    }),
                }).node,
            };
        },
    },
]);

createDesktopShell({ root: document.body, wm, registry, brand: '247420 / os', themeUrl });

wm.open({ title: 'about', body: renderAboutApp(ABOUT_CONTENT).node, width: 460, height: 450, x: 80, y: 80 });

const monitorApp = registry.get('monitor');
wm.open({ title: monitorApp.name, body: monitorApp.factory().node, width: monitorApp.defaultSize.w, height: monitorApp.defaultSize.h, x: 600, y: 120 });
