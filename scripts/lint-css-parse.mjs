#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const CSS_FILE = /\.css$/i;
const HTML_FILE = /\.html?$/i;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const SKIPPED_SEGMENTS = new Set(['vendor', 'node_modules', 'dist']);
const CLOSER_OF = { '(': ')', '[': ']', '{': '}' };

const listTrackedFiles = () =>
    execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .filter((file) => (CSS_FILE.test(file) || HTML_FILE.test(file)) && !file.split('/').some((seg) => SKIPPED_SEGMENTS.has(seg)))
        .filter((file) => fs.existsSync(path.join(root, file)));

const isUnquotedUrlOpen = (source, index) => /url$/i.test(source.slice(Math.max(0, index - 3), index)) && !/^\s*["']/.test(source.slice(index + 1, index + 40));

export function findCssParseErrors(source) {
    const errors = [];
    const stack = [];
    const lineAt = (index) => source.slice(0, index).split('\n').length;
    let i = 0;
    while (i < source.length) {
        const ch = source[i];
        const next = source[i + 1];
        if (ch === '/' && next === '*') {
            const end = source.indexOf('*/', i + 2);
            if (end === -1) {
                errors.push({ line: lineAt(i), detail: 'unterminated comment' });
                return errors;
            }
            i = end + 2;
            continue;
        }
        if (ch === '*' && next === '/') {
            errors.push({ line: lineAt(i), detail: 'stray comment terminator "*/" (tail of a deleted comment)' });
            i += 2;
            continue;
        }
        if (ch === '"' || ch === "'") {
            let j = i + 1;
            let closed = false;
            while (j < source.length) {
                const c = source[j];
                if (c === '\\') { j += 2; continue; }
                if (c === '\n') break;
                if (c === ch) { closed = true; break; }
                j++;
            }
            if (!closed) {
                errors.push({ line: lineAt(i), detail: `unclosed string starting ${ch}${source.slice(i + 1, i + 30).split('\n')[0]}` });
                i = Math.max(j, i + 1);
                continue;
            }
            i = j + 1;
            continue;
        }
        if (ch === '\\') { i += 2; continue; }
        if (ch === '(' && isUnquotedUrlOpen(source, i)) {
            let j = i + 1;
            while (j < source.length && source[j] !== ')' && source[j] !== '\n') j++;
            if (source[j] !== ')') {
                errors.push({ line: lineAt(i), detail: 'unclosed url(' });
                i = j;
                continue;
            }
            i = j + 1;
            continue;
        }
        if (CLOSER_OF[ch]) {
            stack.push({ ch, index: i });
        } else if (ch === ')' || ch === ']' || ch === '}') {
            const top = stack.pop();
            if (!top) errors.push({ line: lineAt(i), detail: `unmatched "${ch}"` });
            else if (CLOSER_OF[top.ch] !== ch) errors.push({ line: lineAt(i), detail: `"${ch}" closes "${top.ch}" opened on line ${lineAt(top.index)}` });
        }
        i++;
    }
    for (const open of stack) errors.push({ line: lineAt(open.index), detail: `unclosed "${open.ch}"` });
    return errors;
}

const cssSegments = (file, source) => {
    if (CSS_FILE.test(file)) return [{ text: source, firstLine: 1 }];
    const segments = [];
    for (const match of source.matchAll(STYLE_BLOCK)) {
        const bodyStart = match.index + match[0].indexOf('>') + 1;
        segments.push({ text: match[1], firstLine: source.slice(0, bodyStart).split('\n').length });
    }
    return segments;
};

export function lintCssParseOrThrow() {
    const problems = [];
    const files = listTrackedFiles();
    for (const file of files) {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        for (const segment of cssSegments(file, source)) {
            for (const error of findCssParseErrors(segment.text)) {
                problems.push(`  ${file}:${segment.firstLine + error.line - 1}  ${error.detail}`);
            }
        }
    }
    if (problems.length) {
        throw new Error(
            `FAIL(css-parse): ${problems.length} CSS tokenisation error(s).\n` +
            problems.join('\n') +
            '\n\nBrowsers silently drop the rule that follows a broken string, brace or comment\n' +
            'terminator, so a corrupt sheet renders unstyled instead of failing loudly.',
        );
    }
    return files.length;
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
    try {
        const fileCount = lintCssParseOrThrow();
        console.log(`[lint-css-parse] OK: ${fileCount} css/html file(s) tokenise cleanly.`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
