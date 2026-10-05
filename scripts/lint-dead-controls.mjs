#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkFiles } from './lint-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const JS_DIRS = ['src', 'ui_kits', 'site', 'preview', 'slides'];
const HTML_DIRS = ['ui_kits', 'preview', 'slides'];
const SKIP_DIRS = new Set(['node_modules', 'vendor', 'dist']);

const USER_ACTION_HANDLER_PROPS = [
    'onClick', 'onclick', 'onSelect', 'onToggle', 'onChange', 'onInput',
    'onSubmit', 'onOpen', 'onClose', 'onStop', 'onStopAll', 'onView',
    'onNav', 'onAction', 'onMute', 'onDeafen', 'onLeave', 'onSettings',
    'onRemove', 'onDelete', 'onSave', 'onCancel', 'onConfirm', 'onRetry',
];

const EMPTY_ARROW_HANDLER = new RegExp(
    '(' + USER_ACTION_HANDLER_PROPS.join('|') + ')\\s*:\\s*' +
    '(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>\\s*\\{\\s*\\}',
);
const EMPTY_FUNCTION_HANDLER = new RegExp(
    '(' + USER_ACTION_HANDLER_PROPS.join('|') + ')\\s*:\\s*function\\s*\\([^)]*\\)\\s*\\{\\s*\\}',
);

const PLACEHOLDER_HREF = /href\s*=\s*(["'])#\1/;
const ALLOW_MARK = 'lint-dead-controls:allow';

const blankPreservingLength = (m, prefix) => prefix + ' '.repeat(m.length - prefix.length);
const blankLineComments = (src) => src.replace(/(^|[^:])\/\/[^\n]*/g, blankPreservingLength);

const relativePosix = (file) => path.relative(root, file).replace(/\\/g, '/');

function findNoopHandlers(hits) {
    for (const dir of JS_DIRS) {
        const abs = path.join(root, dir);
        if (!fs.existsSync(abs)) continue;
        for (const file of walkFiles(abs, new Set(['.js', '.mjs']), { skipDirs: SKIP_DIRS })) {
            const src = blankLineComments(fs.readFileSync(file, 'utf8'));
            src.split('\n').forEach((line, i) => {
                if (line.includes(ALLOW_MARK)) return;
                const m = EMPTY_ARROW_HANDLER.exec(line) || EMPTY_FUNCTION_HANDLER.exec(line);
                if (m) hits.push({ file: relativePosix(file), line: i + 1, kind: 'noop-handler', detail: m[1] });
            });
        }
    }
}

function findPlaceholderLinks(hits) {
    for (const dir of HTML_DIRS) {
        const abs = path.join(root, dir);
        if (!fs.existsSync(abs)) continue;
        for (const file of walkFiles(abs, new Set(['.html']), { skipDirs: SKIP_DIRS })) {
            const src = fs.readFileSync(file, 'utf8');
            src.split('\n').forEach((line, i) => {
                if (line.includes(ALLOW_MARK)) return;
                if (PLACEHOLDER_HREF.test(line)) {
                    hits.push({ file: relativePosix(file), line: i + 1, kind: 'placeholder-href', detail: 'href="#"' });
                }
            });
        }
    }
}

export function findDeadControls() {
    const hits = [];
    findNoopHandlers(hits);
    findPlaceholderLinks(hits);
    return hits;
}

const BASELINE = 0;

export function lintDeadControlsOrThrow() {
    const hits = findDeadControls();
    if (hits.length > BASELINE) {
        const lines = hits.map((h) => `  ${h.file}:${h.line}  ${h.kind}  ${h.detail}`);
        throw new Error(
            `FAIL(dead-controls): ${hits.length} dead control(s), baseline ${BASELINE}.\n` +
            lines.join('\n') +
            '\n\nA control that renders but cannot act is worse than one that is absent:\n' +
            'it invites a click and answers nothing. Give it a real handler or a real\n' +
            'destination, or stop rendering it as a control (drop the href / the\n' +
            'button). If the no-op is genuinely intentional, say why in the handler\n' +
            `body as a comment, or mark the line ${ALLOW_MARK}.`,
        );
    }
    if (hits.length < BASELINE) {
        throw new Error(
            `FAIL(dead-controls): ${hits.length} found, below baseline ${BASELINE}. ` +
            'Re-freeze BASELINE DOWNWARD in scripts/lint-dead-controls.mjs. Slack in ' +
            'a baseline silently absorbs the next regression.',
        );
    }
    return hits.length;
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/') ||
    process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
    try {
        const n = lintDeadControlsOrThrow();
        console.log(`[lint-dead-controls] OK: ${n} dead control(s) (baseline ${BASELINE}).`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
