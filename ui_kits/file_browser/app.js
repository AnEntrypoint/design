import * as webjsx from 'webjsx';
import { Topbar, Crumb, AppShell, Status, Btn, Icon, FileGrid, FileToolbar, DropZone, UploadProgress, BreadcrumbPath, ConfirmDialog, PromptDialog, FileViewer, FilePreviewMedia, FilePreviewCode, FilePreviewText } from '../../src/components.js';
const h = webjsx.createElement;

const SAMPLE = [
    { name: 'src', type: 'dir', size: null, modified: '2026.10.05' },
    { name: 'ui_kits', type: 'dir', size: null, modified: '2026.10.05' },
    { name: 'docs', type: 'dir', size: null, modified: '2026.10.05' },
    { name: 'favicon.svg', type: 'image', size: 270, modified: '2026.04.21' },
    { name: 'colors_and_type.css', type: 'code', size: 17882, modified: '2026.10.05' },
    { name: 'app-shell.css', type: 'code', size: 1477, modified: '2026.10.05' },
    { name: 'package.json', type: 'code', size: 6322, modified: '2026.10.05' },
    { name: 'README.md', type: 'text', size: 25050, modified: '2026.10.05' },
    { name: 'CHANGELOG.md', type: 'text', size: 79060, modified: '2026.10.05' },
    { name: 'LICENSE', type: 'text', size: 1090, modified: '2026.08.04' }
];

const PREVIEW_TEXT = `# 247420 file browser
this is a static demo wired to the design system.
the listing is sample data: components only, no real file access.`;

const PREVIEW_CODE = `export function FileRow({ name, type, size, modified, onOpen }) {
    return h('div', { class: 'ds-file-row', 'data-file-type': type, onclick: onOpen },
        FileIcon({ type }),
        h('span', { class: 'title' }, name),
        h('span', { class: 'meta' }, fmtFileSize(size))
    );
}`;

const state = {
    files: SAMPLE,
    crumbs: ['design', 'src'],
    dragover: false,
    uploads: [],
    viewer: null,
    confirm: null,
    prompt: null,
    promptValue: ''
};

const root = document.getElementById('root');

function previewBody(file) {
    if (file.type === 'image' || file.type === 'video' || file.type === 'audio') {
        return FilePreviewMedia({
            type: file.type,
            name: file.name,
            src: file.type === 'image'
                ? 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360"><rect width="600" height="360" fill="#3F8A4A"/><text x="300" y="200" text-anchor="middle" font-family="JetBrains Mono" font-size="48" fill="#F5F0E4">${file.name}</text></svg>`
                )
                : ''
        });
    }
    if (file.type === 'code') return FilePreviewCode({ content: PREVIEW_CODE, lang: 'js' });
    if (file.type === 'text' || file.type === 'document') return FilePreviewText({ content: PREVIEW_TEXT });
    return FilePreviewMedia({ type: file.type, name: file.name });
}

function openViewer(file) {
    if (file.type === 'dir') {
        state.crumbs = [...state.crumbs, file.name];
        render(); return;
    }
    state.viewer = file;
    render();
}

function rowAction(act, file) {
    if (act === 'download') {
        state.uploads = [{ name: 'downloading ' + file.name, pct: 100, done: true }];
        setTimeout(() => { state.uploads = []; render(); }, 1500);
        render(); return;
    }
    if (act === 'delete') {
        state.confirm = {
            title: 'delete ' + file.name + '?',
            message: 'demo only: nothing is deleted.',
            destructive: true,
            onConfirm: () => {
                state.files = state.files.filter(f => f !== file);
                state.confirm = null; render();
            },
            onCancel: () => { state.confirm = null; render(); }
        };
        render(); return;
    }
    if (act === 'rename') {
        state.prompt = {
            title: 'rename ' + file.name,
            value: file.name,
            onConfirm: (v) => {
                if (v && v.trim()) file.name = v.trim();
                state.prompt = null; state.promptValue = ''; render();
            },
            onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
        };
        state.promptValue = file.name;
        render();
    }
}

function simulateUpload(files) {
    const items = Array.from(files).slice(0, 3).map(f => ({
        name: f.name || 'untitled',
        pct: 0, done: false
    }));
    state.uploads = items;
    render();
    items.forEach((it, i) => {
        let p = 0;
        const tick = () => {
            p += 20 + Math.random() * 30;
            it.pct = Math.min(100, Math.round(p));
            if (it.pct >= 100) { it.done = true; render(); return; }
            render();
            setTimeout(tick, 280 + i * 60);
        };
        setTimeout(tick, 200 + i * 200);
    });
    setTimeout(() => { state.uploads = []; render(); }, 4000);
}

function pickFiles() {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true;
    input.onchange = () => simulateUpload(input.files);
    input.click();
}

function App() {
    const main = h('div', { class: 'ds-files-stack ds-app-surface' },
        h('h1', {}, 'file browser'),
        BreadcrumbPath({
            segments: state.crumbs,
            root: 'root',
            onNav: (i) => { state.crumbs = state.crumbs.slice(0, i); render(); }
        }),
        FileToolbar({
            left: [
                Btn({ onClick: pickFiles, 'aria-label': 'upload', children: [Icon('upload'), ' upload'] }),
                Btn({ onClick: () => {
                    state.prompt = {
                        title: 'new folder',
                        value: '',
                        onConfirm: (v) => {
                            if (v && v.trim()) state.files = [
                                { name: v.trim(), type: 'dir', size: null, modified: 'just now' },
                                ...state.files
                            ];
                            state.prompt = null; state.promptValue = ''; render();
                        },
                        onCancel: () => { state.prompt = null; state.promptValue = ''; render(); }
                    };
                    state.promptValue = '';
                    render();
                }, children: '+ folder' })
            ],
            right: [
                h('span', { class: 'meta ds-meta-mono' },
                    String(state.files.length).padStart(2, '0') + ' items'
                )
            ]
        }),
        DropZone({
            label: 'drop files here to upload',
            dragover: state.dragover,
            onDragOver: () => { if (!state.dragover) { state.dragover = true; render(); } },
            onDragLeave: () => { state.dragover = false; render(); },
            onDrop: (files) => { state.dragover = false; simulateUpload(files); },
            onPick: pickFiles
        }),
        UploadProgress({ items: state.uploads }),
        FileGrid({
            files: state.files,
            onOpen: openViewer,
            onAction: rowAction,
            emptyText: 'this folder is empty. drop files above or use + folder.',
            emptyAction: Btn({ onClick: pickFiles, children: 'upload a file' })
        })
    );

    return h('div', {},
        AppShell({
            topbar: Topbar({
                brand: '247420',
                leaf: 'file browser',
                items: [
                    ['design', '../../'],
                    ['home', '../homepage/'],
                    ['docs', '../docs/'],
                    ['source', 'https://github.com/AnEntrypoint/Design']
                ]
            }),
            crumb: Crumb({ trail: ['247420', 'ui kits'], leaf: 'file browser' }),
            main,
            status: Status({ left: ['main', state.files.length + ' items'], right: ['sample files'] })
        }),
        state.viewer ? FileViewer({
            file: state.viewer,
            body: previewBody(state.viewer),
            onClose: () => { state.viewer = null; render(); },
            onAction: (act) => { if (act === 'download') { state.viewer = null; render(); } }
        }) : null,
        state.confirm ? ConfirmDialog(state.confirm) : null,
        state.prompt ? PromptDialog({
            ...state.prompt,
            value: state.promptValue,
            onInput: (v) => { state.promptValue = v; }
        }) : null
    );
}

function render() { webjsx.applyDiff(root, App()); }
render();

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.viewer) { state.viewer = null; render(); return; }
    if (state.prompt) { state.prompt.onCancel && state.prompt.onCancel(); return; }
    if (state.confirm) { state.confirm.onCancel && state.confirm.onCancel(); }
});
