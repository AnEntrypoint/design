#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const YAML_FILE = /\.ya?ml$/i;
const SKIPPED_SEGMENT = 'vendor';
const MAPPING_ENTRY = /^(\s*)(?:-\s+)*([^\s'"#\[\]{}&*!|>%@`,?:-][^:#]*|"[^"]*"|'[^']*'):(?:\s+(.*))?$/;
const BLOCK_SCALAR_INDICATOR = /^[|>][+-]?\d*$/;
const SCALAR_OPENERS_NEEDING_NO_CHECK = /^["'\[{|>&*!%@`]/;
const EMBEDDED_KEY_SEPARATOR = /:(\s|$)/;
const TRAILING_COMMENT = /\s#.*$/;

const listYamlFiles = () =>
    execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .filter((file) => YAML_FILE.test(file))
        .filter((file) => !file.split('/').includes(SKIPPED_SEGMENT))
        .filter((file) => fs.existsSync(path.join(root, file)));

const indentOf = (line) => line.length - line.trimStart().length;

export function findYamlParseErrors(source) {
    const errors = [];
    let blockScalarParentIndent = -1;
    source.split(/\r?\n/).forEach((line, index) => {
        const isBlank = line.trim() === '';
        if (blockScalarParentIndent >= 0) {
            if (isBlank || indentOf(line) > blockScalarParentIndent) return;
            blockScalarParentIndent = -1;
        }
        if (isBlank || line.trimStart().startsWith('#')) return;
        const entry = MAPPING_ENTRY.exec(line.replace(/\t/g, '    '));
        if (!entry) return;
        const value = (entry[3] || '').replace(TRAILING_COMMENT, '').trim();
        if (BLOCK_SCALAR_INDICATOR.test(value)) {
            blockScalarParentIndent = indentOf(line);
            return;
        }
        if (value === '' || SCALAR_OPENERS_NEEDING_NO_CHECK.test(value)) return;
        if (EMBEDDED_KEY_SEPARATOR.test(value)) {
            errors.push({ line: index + 1, detail: `plain scalar contains ": " (quote the value): ${value}` });
        }
    });
    return errors;
}

export function lintYamlParseOrThrow() {
    const problems = [];
    for (const file of listYamlFiles()) {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        for (const error of findYamlParseErrors(source)) {
            problems.push(`  ${file}:${error.line}  ${error.detail}`);
        }
    }
    if (problems.length) {
        throw new Error(
            `FAIL(yaml-parse): ${problems.length} invalid YAML construct(s).\n` +
            problems.join('\n') +
            '\n\nflatspace only logs a YAML read error and keeps building, so an invalid\n' +
            'page file ships green and renders blank. Quote any value containing ": ".',
        );
    }
    return listYamlFiles().length;
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
    try {
        const fileCount = lintYamlParseOrThrow();
        console.log(`[lint-yaml-parse] OK: ${fileCount} yaml file(s) parse.`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
