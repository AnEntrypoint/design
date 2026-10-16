import * as webjsx from '../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState, refreshError } from './runtime.js';
import { PageHeader } from '../content.js';
import { FileGrid } from '../files.js';
import { BreadcrumbPath } from '../files/chrome.js';
import { FileViewer } from '../files-modals/preview-containers.js';
import { FilePreviewText, FilePreviewMedia } from '../files-modals/preview-bodies.js';
import { noteAlert } from './shared.js';

const h = webjsx.createElement;

function splitPath(p) {
    const norm = String(p || '').replace(/\\/g, '/');
    const leadingSlash = norm.startsWith('/');
    const parts = norm.split('/').filter(Boolean);
    return { leadingSlash, parts };
}
function pathAt(info, count) {
    const kept = info.parts.slice(0, count);
    const body = kept.join('/');
    return info.leadingSlash ? '/' + body : body;
}

export const files = makePage((ctx) => {
    Object.assign(ctx.state, { dirPath: null, entries: [], openFile: null, fileBody: null, fileLoading: false, note: null });
    async function load(path) {
        ctx.set({ loading: true });
        try {
            const res = await api('/api/files/tree' + (path ? '?path=' + encodeURIComponent(path) : ''));
            ctx.set({ loading: false, dirPath: res.path, entries: Array.isArray(res.tree) ? res.tree : [], error: null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function openEntry(entry) {
        const info = splitPath(ctx.state.dirPath);
        const childPath = (ctx.state.dirPath ? ctx.state.dirPath.replace(/[\\/]+$/, '') : pathAt(info, info.parts.length)) + '/' + entry.name;
        if (entry.type === 'dir') { load(childPath); return; }
        ctx.set({ fileLoading: true, openFile: { name: entry.name, type: entry.type, size: entry.size, modified: entry.modified, path: childPath } });
        try {
            const res = await api('/api/files/read?path=' + encodeURIComponent(childPath));
            ctx.set({ fileLoading: false, fileBody: res });
        } catch (e) { ctx.set({ fileLoading: false, note: { kind: 'error', msg: String(e.message || e) }, openFile: null }); }
    }
    function goUp() {
        const info = splitPath(ctx.state.dirPath);
        if (info.parts.length <= 1) return;
        load(pathAt(info, info.parts.length - 1));
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading && !s.entries.length) return loadingState('loading files…');
        if (s.error && !s.dirPath) return errorState(s.error, () => load());
        const info = splitPath(s.dirPath);
        const segments = info.leadingSlash ? info.parts : info.parts.slice(1);
        const rootCount = info.leadingSlash ? 0 : 1;
        const rootLabel = info.leadingSlash ? '/' : (info.parts[0] || '/');
        const files_ = s.entries.map(e => ({ name: e.name, type: e.type, size: e.size, modified: e.modified }));
        const viewerBody = s.fileBody && s.fileBody.type === 'image'
            ? FilePreviewMedia({ src: s.fileBody.content, type: 'image', name: s.openFile && s.openFile.name })
            : s.fileBody && s.fileBody.type === 'text'
                ? FilePreviewText({ content: s.fileBody.content, truncated: s.fileBody.truncated })
                : s.fileBody && s.fileBody.type === 'binary'
                    ? h('div', { class: 'fd-empty' }, 'binary file: preview not available')
                    : null;
        return [
            PageHeader({ title: 'files', lede: s.dirPath || 'active project' }),
            noteAlert(s.note),
            s.error && s.dirPath ? refreshError(s.error) : null,
            BreadcrumbPath({ segments, root: rootLabel, onNav: (i) => load(pathAt(info, rootCount + i)) }),
            FileGrid({
                files: files_, loading: s.loading,
                onOpen: openEntry,
                onUp: goUp,
                emptyText: 'empty directory',
            }),
            (s.openFile || s.fileLoading) ? FileViewer({
                file: s.openFile,
                body: s.fileLoading ? loadingState('loading file…') : (viewerBody || emptyState('nothing to preview')),
                onClose: () => ctx.set({ openFile: null, fileBody: null }),
            }) : null,
        ].filter(Boolean);
    };
});
