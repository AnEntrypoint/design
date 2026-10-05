#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = dirname(dirname(fileURLToPath(import.meta.url)));

export function readNormalized(p) {
    return readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

function parseBarrel(barrelPath) {
    const barrelSrc = readNormalized(barrelPath);
    const exportBlockRe = /export\s*\{([^}]*)\}\s*from\s*'([^']+)';/g;
    const groups = [];
    let m;
    while ((m = exportBlockRe.exec(barrelSrc))) {
        const symbols = m[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => (s.includes(' as ') ? s.split(' as ')[0].trim() : s));
        const relFile = m[2].replace(/^\.\//, '');
        groups.push({ file: relFile, symbols });
    }
    return groups;
}

function findJSDocBefore(src, defStart) {
    let i = defStart;
    while (i > 0 && /\s/.test(src[i - 1])) i--;
    if (src.slice(Math.max(0, i - 2), i) !== '*/') return null;
    const end = i;
    const start = src.lastIndexOf('/**', end);
    if (start === -1) return null;
    return src.slice(start, end);
}

function endOfBalanced(text, open, close) {
    let depth = 0, i = 0;
    for (; i < text.length; i++) {
        if (text[i] === open) depth++;
        else if (text[i] === close) { depth--; if (depth === 0) { i++; break; } }
    }
    return i;
}

function splitBracedType(afterTag) {
    if (!afterTag.startsWith('{')) return { type: '', afterType: afterTag };
    const typeEnd = endOfBalanced(afterTag, '{', '}');
    return { type: afterTag.slice(1, typeEnd - 1), afterType: afterTag.slice(typeEnd).trimStart() };
}

function splitParamNameAndDescription(afterType) {
    if (afterType.startsWith('[')) {
        const nameEnd = endOfBalanced(afterType, '[', ']');
        return {
            rawName: afterType.slice(0, nameEnd),
            desc: afterType.slice(nameEnd).replace(/^\s*-?\s*/, ''),
        };
    }
    const nameAndDesc = afterType.match(/^(\S+)\s*-?\s*(.*)$/);
    return { rawName: nameAndDesc ? nameAndDesc[1] : '', desc: nameAndDesc ? nameAndDesc[2] : '' };
}

function parseParamLine(line) {
    const afterTag = line.slice('@param'.length).trimStart();
    const { type, afterType } = splitBracedType(afterTag);
    const { rawName, desc } = splitParamNameAndDescription(afterType);
    if (!rawName) return null;
    const bracketMatch = rawName.match(/^\[(.+)\]$/);
    const unwrappedName = bracketMatch ? bracketMatch[1] : rawName;
    const name = unwrappedName.split('=')[0].trim();
    return { type, name, desc, optional: !!bracketMatch };
}

export function parseJSDoc(block) {
    if (!block) return null;
    const lines = block
        .split('\n')
        .map((l) => l.replace(/^\s*\/?\*+\/?/, '').replace(/\*\/\s*$/, '').trim())
        .filter((l, idx, arr) => !(l === '' && (idx === 0 || idx === arr.length - 1)));
    const description = [];
    const params = [];
    let returns = null;
    let example = null;
    let inExample = false;
    for (const line of lines) {
        if (line.startsWith('@param')) {
            const param = parseParamLine(line);
            if (param) params.push(param);
            inExample = false;
        } else if (line.startsWith('@returns') || line.startsWith('@return')) {
            returns = line.replace(/^@returns?\s*/, '');
            inExample = false;
        } else if (line.startsWith('@example')) {
            example = '';
            inExample = true;
        } else if (inExample) {
            example += (example ? '\n' : '') + line;
        } else if (!line.startsWith('@')) {
            description.push(line);
        }
    }
    return { description: description.join(' ').trim(), params, returns, example };
}

function extractSignature(src, parenStart) {
    const afterClose = endOfBalanced(src.slice(parenStart), '(', ')') + parenStart;
    const raw = src.slice(parenStart + 1, afterClose - 1);
    const wholeObjectDefault = src.slice(afterClose).match(/^\s*=\s*(\{\s*\})/);
    return { raw: raw.trim(), hasDefault: !!wholeObjectDefault };
}

function stripFullLineComments(raw) {
    return raw
        .split('\n')
        .filter((line) => !line.trim().startsWith('//'))
        .join('\n');
}

function scanTopLevel(text, visit) {
    let depth = 0, quote = null;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === '\\') i++;
            else if (ch === quote) quote = null;
            continue;
        }
        if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
        if (ch === '{' || ch === '[' || ch === '(') depth++;
        else if (ch === '}' || ch === ']' || ch === ')') depth--;
        if (visit(ch, i, depth) === false) return;
    }
}

function splitTopLevel(raw) {
    const parts = [];
    let start = 0;
    scanTopLevel(raw, (ch, i, depth) => {
        if (ch === ',' && depth === 0) { parts.push(raw.slice(start, i)); start = i + 1; }
    });
    parts.push(raw.slice(start));
    return parts.map((p) => p.trim()).filter(Boolean);
}

function splitPatternAndDefault(text) {
    let equalsAt = -1;
    scanTopLevel(text, (ch, i, depth) => {
        if (ch === '=' && depth === 0) { equalsAt = i; return false; }
    });
    if (equalsAt === -1) return { pattern: text.trim(), default: null };
    return { pattern: text.slice(0, equalsAt).trim(), default: text.slice(equalsAt + 1).trim() };
}

function parsePositionalArgs(raw) {
    return splitTopLevel(raw).map((arg) => {
        const { pattern, default: def } = splitPatternAndDefault(arg);
        return { name: pattern, default: def, alias: null, positional: true };
    });
}

function outerBraceInterior(raw) {
    let depth = 0, start = -1, end = -1;
    for (let i = 0; i < raw.length; i++) {
        if (raw[i] === '{') { if (depth === 0) start = i; depth++; }
        else if (raw[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (start === -1 || end === -1) return null;
    return raw.slice(start + 1, end);
}

function parseDestructuredProp(propText) {
    const { pattern, default: def } = splitPatternAndDefault(propText);
    let name = pattern;
    let alias = null;
    if (name.includes(':')) {
        const [key, local] = name.split(':').map((s) => s.trim());
        name = key.replace(/^['"]|['"]$/g, '');
        alias = local;
    }
    return { name, default: def, alias };
}

function parseDestructuredProps(raw) {
    raw = stripFullLineComments(raw).trim();
    if (!raw.startsWith('{')) return parsePositionalArgs(raw);
    const interior = outerBraceInterior(raw);
    if (interior === null) return [];
    return splitTopLevel(interior).map(parseDestructuredProp);
}

function defRegexFor(name) {
    return new RegExp(`(?:export\\s+)?function\\s+${name}\\s*\\(|(?:export\\s+)?const\\s+${name}\\s*=`);
}

function resolveReExportSource(src, name, fromDir) {
    const importRe = new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*'([^']+)'`);
    const im = importRe.exec(src);
    if (!im) return null;
    return join(fromDir, im[1]);
}

function exportsBare(src, name) {
    return new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}(?!\\s*from)`).test(src);
}

function findDefinitionThroughImport(src, name, fromDir) {
    const subPath = resolveReExportSource(src, name, fromDir);
    if (!subPath || !(existsSync(subPath) || existsSync(subPath + '.js'))) return null;
    const realSubPath = existsSync(subPath) ? subPath : subPath + '.js';
    const subSrc = readNormalized(realSubPath);
    const subMatch = defRegexFor(name).exec(subSrc);
    return subMatch ? { match: subMatch, defSrc: subSrc } : null;
}

function describeConstValue(defSrc, defStart) {
    const eqIdx = defSrc.indexOf('=', defStart);
    const rhsEnd = defSrc.indexOf('\n', eqIdx);
    const rhs = defSrc.slice(eqIdx + 1, rhsEnd === -1 ? undefined : rhsEnd).trim();
    let kind;
    if (/^\w+\s*\(/.test(rhs) && !rhs.startsWith('(')) kind = 'const (factory-wrapped)';
    else if (/^[A-Z]\w*;?$/.test(rhs.replace(/;$/, ''))) kind = 'const (alias)';
    else kind = 'const';
    return { kind, props: [{ name: '(value)', default: rhs.replace(/;$/, ''), alias: null }] };
}

function jsdocParamDriftWarnings(name, file, jsdoc, props) {
    const realNames = new Set(props.map((p) => p.name));
    const warnings = [];
    for (const p of jsdoc.params) {
        const bare = p.name
            .replace(/^props\[['"]([^'"]+)['"]\]$/, '$1')
            .replace(/^props\./, '')
            .split('.')[0];
        if (bare && bare !== 'props' && !realNames.has(bare)) {
            warnings.push(`${name}: JSDoc @param '${p.name}' not found in the real destructured signature (file: src/${file})`);
        }
    }
    return warnings;
}

/**
 * Extract the whole exported component surface.
 * @returns {{groups: Array, components: Array, driftWarnings: string[], fileOrder: string[]}}
 */
export function extractComponentSurface() {
    const barrelPath = join(root, 'src', 'components.js');
    const groups = parseBarrel(barrelPath);
    if (!groups.length) {
        throw new Error('[component-surface] parsed zero export groups from src/components.js -- barrel shape changed, update the parser');
    }

    const components = [];
    const driftWarnings = [];

    for (const group of groups) {
        const filePath = join(root, 'src', group.file);
        if (!existsSync(filePath)) {
            driftWarnings.push(`components.js re-exports from '${group.file}' but that file does not exist`);
            continue;
        }
        const src = readNormalized(filePath);
        for (const name of group.symbols) {
            let dm = defRegexFor(name).exec(src);
            let defSrc = src;
            let resolvedThroughImport = false;
            if (!dm) {
                const viaImport = findDefinitionThroughImport(src, name, dirname(filePath));
                if (viaImport) {
                    dm = viaImport.match;
                    defSrc = viaImport.defSrc;
                    resolvedThroughImport = true;
                }
            }
            if (!dm) {
                driftWarnings.push(`'${name}' exported by components.js but no definition found in src/${group.file}`);
                continue;
            }
            if (resolvedThroughImport && !exportsBare(src, name)) {
                driftWarnings.push(`'${name}' is imported by src/${group.file} but never exported from it`);
                continue;
            }
            const defStart = dm.index;
            const jsdoc = parseJSDoc(findJSDocBefore(defSrc, defStart));

            let props;
            let kind;
            const isFn = /function\s+\w+\s*\(/.test(dm[0]);
            if (isFn) {
                kind = 'component';
                const parenStart = defSrc.indexOf('(', defStart + dm[0].indexOf(name));
                props = parseDestructuredProps(extractSignature(defSrc, parenStart).raw);
            } else {
                ({ kind, props } = describeConstValue(defSrc, defStart));
            }

            if (jsdoc && jsdoc.params.length && isFn) {
                driftWarnings.push(...jsdocParamDriftWarnings(name, group.file, jsdoc, props));
            }

            components.push({ name, file: group.file, kind, props, jsdoc });
        }
    }

    const fileOrder = [...new Set(groups.map((g) => g.file))];
    return { groups, components, driftWarnings, fileOrder };
}
