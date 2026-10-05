#!/usr/bin/env node
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { extractComponentSurface, root, readNormalized } from './component-surface.mjs';
import { die, orDie } from './die.mjs';

const CHECK = process.argv.includes('--check');

const { components, driftWarnings, fileOrder } = orDie(extractComponentSurface);

function jsdocTypeToTs(t) {
    if (!t) return null;
    let s = t.trim();
    if (!s || s === '*' || s === 'any') return 'any';
    if (s.includes('|') && !/[<{]/.test(s)) {
        const parts = s.split('|').map((p) => jsdocTypeToTs(p)).filter(Boolean);
        return parts.length ? [...new Set(parts)].join(' | ') : 'any';
    }
    if (/^'[^']*'$/.test(s)) return s;
    if (/^Array<(.+)>$/.test(s)) {
        const inner = jsdocTypeToTs(s.replace(/^Array<(.+)>$/, '$1'));
        return `Array<${inner}>`;
    }
    if (/^Set<(.+)>$/.test(s)) return `Set<${jsdocTypeToTs(s.replace(/^Set<(.+)>$/, '$1'))}>`;
    if (s === 'Function') return '(...args: any[]) => any';
    if (s === 'boolean' || s === 'string' || s === 'number') return s;
    if (s === 'Object' || s === 'object') return 'Record<string, any>';
    if (s === 'Element' || s === 'HTMLElement' || s === 'Node') return s;
    if (/^\{[\s\S]*\}$/.test(s)) {
        const inner = s.slice(1, -1);
        const members = splitTopLevel(inner, ',');
        const out = [];
        for (const mem of members) {
            const ci = mem.indexOf(':');
            if (ci === -1) { return 'Record<string, any>'; }
            const rawKey = mem.slice(0, ci).trim();
            const val = mem.slice(ci + 1).trim();
            const optional = rawKey.endsWith('?');
            const key = optional ? rawKey.slice(0, -1) : rawKey;
            if (!/^[A-Za-z_$][\w$]*$/.test(key)) return 'Record<string, any>';
            out.push(`${key}${optional ? '?' : ''}: ${jsdocTypeToTs(val) || 'any'}`);
        }
        return `{ ${out.join('; ')} }`;
    }
    return 'any';
}

function splitTopLevel(s, sep) {
    const out = [];
    let cur = '', d = 0;
    for (const ch of s) {
        if (ch === '{' || ch === '[' || ch === '(' || ch === '<') d++;
        else if (ch === '}' || ch === ']' || ch === ')' || ch === '>') d--;
        if (ch === sep && d === 0) { out.push(cur); cur = ''; }
        else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map((x) => x.trim()).filter(Boolean);
}

function defaultToTs(def) {
    if (def == null) return null;
    const d = def.trim();
    if (d === 'false' || d === 'true') return 'boolean';
    if (d === 'null' || d === 'undefined') return null;
    if (/^-?\d+(\.\d+)?$/.test(d) || d === 'Infinity' || d === '-Infinity') return 'number';
    if (/^'([^']*)'$/.test(d) || /^"([^"]*)"$/.test(d)) return 'string';
    if (/^\[\s*\]$/.test(d)) return 'any[]';
    if (/^\[/.test(d)) return 'any[]';
    if (/^\{/.test(d)) return 'Record<string, any>';
    if (/^\(/.test(d) || d.includes('=>')) return '(...args: any[]) => any';
    if (/^new\s+Set\b/.test(d)) return 'Set<any>';
    return null;
}

function enumValuesFor(body, prop) {
    if (!/^[A-Za-z_$][\w$]*$/.test(prop)) return [];
    const vals = new Set();
    const cmp = new RegExp(`(?<!typeof\\s)\\b${prop}\\s*===?\\s*'([^']*)'|'([^']*)'\\s*===?\\s*(?<!typeof\\s)\\b${prop}\\b`, 'g');
    let m;
    while ((m = cmp.exec(body))) vals.add(m[1] !== undefined ? m[1] : m[2]);
    const inc = new RegExp(`\\[([^\\]]*)\\]\\s*\\.includes\\(\\s*${prop}\\s*\\)`, 'g');
    while ((m = inc.exec(body))) {
        for (const q of m[1].matchAll(/'([^']*)'/g)) vals.add(q[1]);
    }
    return [...vals];
}

function nameToTs(name) {
    if (name === 'key') return 'string | number';
    if (name === 'children') return 'any';
    if (/^on[A-Z]/.test(name) || /^on[a-z]+$/.test(name)) return '(...args: any[]) => any';
    return 'any';
}

const fileCache = new Map();
function sourceOf(relFile) {
    if (!fileCache.has(relFile)) {
        const p = join(root, 'src', relFile);
        fileCache.set(relFile, existsSync(p) ? readNormalized(p) : '');
    }
    return fileCache.get(relFile);
}

function bodyOf(relFile, name) {
    const src = sourceOf(relFile);
    if (!src) return '';
    const re = new RegExp(`(?:export\\s+)?function\\s+${name}\\s*\\(`);
    const m = re.exec(src);
    if (!m) {
        const dir = relFile.replace(/\.js$/, '');
        const im = new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*'([^']+)'`).exec(src);
        if (im) {
            const sub = join(root, 'src', dir, '..', im[1]);
            const subPath = existsSync(sub) ? sub : sub + '.js';
            if (existsSync(subPath)) {
                const subSrc = readNormalized(subPath);
                const sm = re.exec(subSrc);
                if (sm) return braceBody(subSrc, sm.index);
            }
        }
        return '';
    }
    return braceBody(src, m.index);
}

function braceBody(src, from) {
    const open = src.indexOf('{', src.indexOf(')', from));
    if (open === -1) return '';
    let d = 0;
    for (let i = open; i < src.length; i++) {
        if (src[i] === '{') d++;
        else if (src[i] === '}') { d--; if (d === 0) return src.slice(open, i + 1); }
    }
    return src.slice(open);
}

function tsPropName(name) {
    return /^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name.replace(/'/g, "\\'")}'`;
}

const OPEN_STRING_TAIL = '(string & {})';

function typeForProp(c, p, docTypes, body) {
    const fromDoc = jsdocTypeToTs(docTypes[p.name]);
    if (fromDoc && fromDoc !== 'any') return fromDoc;
    const fromDefault = defaultToTs(p.default);
    if (fromDefault === 'string') {
        const lit = (p.default || '').trim().replace(/^['"]|['"]$/g, '');
        const found = enumValuesFor(body, p.name).filter((v) => v !== lit);
        if (found.length) {
            const union = [lit, ...found].filter((v) => v !== '').map((v) => `'${v.replace(/'/g, "\\'")}'`);
            return union.length ? `${[...new Set(union)].join(' | ')} | ${OPEN_STRING_TAIL}` : 'string';
        }
        return 'string';
    }
    if (fromDefault) return fromDefault;
    if (fromDoc) return fromDoc;
    return nameToTs(p.name);
}

let out = '';
out += `// types/components.d.ts -- GENERATED, do not hand-edit.\n`;
out += `//\n`;
out += `// Produced by \`node scripts/generate-component-types.mjs\` from the same\n`;
out += `// extraction that produces docs/component-props.md, so the declarations\n`;
out += `// and the prose reference can never disagree. Re-run after any component\n`;
out += `// signature change; \`npm run lint:component-types\` fails CI when this\n`;
out += `// file is stale.\n`;
out += `//\n`;
out += `// ${components.length} exported symbols across ${fileOrder.length} source files.\n`;
out += `\n`;
out += `/** A webjsx virtual node, as returned by every component in this SDK. */\n`;
out += `export type VNode = any;\n\n`;

function leadingBracedType(text) {
    if (!text.startsWith('{')) return null;
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}' && --depth === 0) return text.slice(1, i);
    }
    return null;
}

function positionalReturnType(c) {
    const declared = c.jsdoc && c.jsdoc.returns && leadingBracedType(c.jsdoc.returns);
    const ts = declared && jsdocTypeToTs(declared);
    if (!ts) return 'VNode';
    return ts === 'Record<string, any>' ? 'any' : ts;
}

for (const file of fileOrder) {
    const inFile = components.filter((c) => c.file === file);
    if (!inFile.length) continue;
    out += `// ---- src/${file} ${'-'.repeat(Math.max(0, 60 - file.length))}\n\n`;
    for (const c of inFile) {
        const docTypes = {};
        if (c.jsdoc) {
            for (const p of c.jsdoc.params) {
                const bare = p.name
                    .replace(/^props\[['"]([^'"]+)['"]\]$/, '$1')
                    .replace(/^props\./, '');
                if (!bare.includes('.')) docTypes[bare] = p.type;
            }
        }
        const desc = c.jsdoc && c.jsdoc.description ? c.jsdoc.description : '';

        if (c.kind !== 'component') {
            const d = c.props[0] ? c.props[0].default : null;
            if (desc) out += `/** ${desc.replace(/\*\//g, '*\\/')} */\n`;
            if (c.kind === 'const (alias)' && d && /^[A-Z]\w*$/.test(d.replace(/;$/, ''))) {
                const target = d.replace(/;$/, '');
                out += `export declare const ${c.name}: typeof ${target};\n\n`;
                continue;
            }
            if (c.kind === 'const (factory-wrapped)') {
                out += `export declare const ${c.name}: (...args: any[]) => VNode;\n\n`;
                continue;
            }
            const t = defaultToTs(d) || 'any';
            out += `export declare const ${c.name}: ${t};\n\n`;
            continue;
        }

        const body = bodyOf(c.file, c.name);
        const positional = c.props.filter((p) => p.positional);
        if (positional.length) {
            if (desc) out += `/** ${desc.replace(/\*\//g, '*\\/')} */\n`;
            const args = positional.map((p, i) => {
                const nm = /^[A-Za-z_$][\w$]*$/.test(p.name) ? p.name : `arg${i}`;
                return `${nm}?: any`;
            });
            out += `export declare function ${c.name}(${args.join(', ')}): ${positionalReturnType(c)};\n\n`;
            continue;
        }

        const propsName = `${c.name}Props`;
        out += `/**\n`;
        if (desc) out += ` * ${desc.replace(/\*\//g, '*\\/')}\n *\n`;
        out += ` * Props for {@link ${c.name}} (src/${c.file}).\n`;
        out += ` */\n`;
        if (!c.props.length) {
            out += `export interface ${propsName} {}\n\n`;
        } else {
            out += `export interface ${propsName} {\n`;
            for (const p of c.props) {
                const t = typeForProp(c, p, docTypes, body);
                const docParam = c.jsdoc && c.jsdoc.params.find((x) => {
                    const bare = x.name.replace(/^props\[['"]([^'"]+)['"]\]$/, '$1').replace(/^props\./, '');
                    return bare === p.name;
                });
                const notes = [];
                if (docParam && docParam.desc) notes.push(docParam.desc);
                if (p.default != null) notes.push(`@default ${p.default.replace(/\*\//g, '*\\/').replace(/\s+/g, ' ')}`);
                if (notes.length) out += `    /** ${notes.join(' ').replace(/\*\//g, '*\\/')} */\n`;
                out += `    ${tsPropName(p.name)}?: ${t};\n`;
            }
            out += `}\n`;
        }
        out += `export declare function ${c.name}(props?: ${propsName}): VNode;\n\n`;
    }
}

if (driftWarnings.length) {
    out += `// ---- drift warnings from the shared extraction -------------------\n`;
    for (const w of driftWarnings) out += `// ! ${w}\n`;
    out += `\n`;
}

const indexSrc = readNormalized(join(root, 'src', 'index.js'));

function collectIndexExports(src) {
    const named = [];
    for (const m of src.matchAll(/export\s*\{([^}]*)\}\s*from\s*'([^']+)';/g)) {
        for (const raw of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
            const [orig, alias] = raw.includes(' as ') ? raw.split(' as ').map((s) => s.trim()) : [raw, raw];
            named.push({ name: alias, orig, from: m[2] });
        }
    }
    for (const m of src.matchAll(/export\s*\{([^}]*)\};/g)) {
        if (/\bfrom\b/.test(m[0])) continue;
        for (const raw of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
            const [orig, alias] = raw.includes(' as ') ? raw.split(' as ').map((s) => s.trim()) : [raw, raw];
            const im = new RegExp(`import\\s*(?:\\*\\s*as\\s+${orig}|\\{[^}]*\\b${orig}\\b[^}]*\\})\\s*from\\s*'([^']+)'`).exec(src);
            const ns = new RegExp(`import\\s*\\*\\s*as\\s+${orig}\\s*from\\s*'([^']+)'`).test(src);
            named.push({ name: alias, orig, from: im ? im[1] : null, namespace: ns });
        }
    }
    for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)\s*\(/g)) {
        named.push({ name: m[1], orig: m[1], from: null, local: 'function', async: /async/.test(m[0]) });
    }
    for (const m of src.matchAll(/export\s+const\s+(\w+)\s*=/g)) {
        named.push({ name: m[1], orig: m[1], from: null, local: 'const' });
    }
    const seen = new Set();
    return named.filter((e) => (seen.has(e.name) ? false : (seen.add(e.name), true)));
}

function shapeOfExport(entry) {
    if (entry.namespace) return { kind: 'namespace' };
    let modPath = entry.from;
    if (!modPath) {
        if (entry.local === 'function') return { kind: 'function', async: !!entry.async };
        const m = new RegExp(`export\\s+const\\s+${entry.orig}\\s*=\\s*([^;\\n]+)`).exec(indexSrc);
        const rhs = m ? m[1].trim() : '';
        if (/^webjsx\./.test(rhs)) return { kind: 'function' };
        return { kind: 'value', ts: defaultToTs(rhs) || 'any' };
    }
    const p = join(root, 'src', modPath.replace(/^\.\//, ''));
    const real = existsSync(p) ? p : (existsSync(p + '.js') ? p + '.js' : null);
    if (!real) return { kind: 'value', ts: 'any' };
    const src = readNormalized(real);
    if (new RegExp(`export\\s+(?:async\\s+)?function\\s+${entry.orig}\\s*\\(`).test(src)) {
        return { kind: 'function', async: new RegExp(`export\\s+async\\s+function\\s+${entry.orig}\\s*\\(`).test(src) };
    }
    if (new RegExp(`export\\s+class\\s+${entry.orig}\\b`).test(src)) return { kind: 'class' };
    const cm = new RegExp(`export\\s+(?:const|let)\\s+${entry.orig}\\s*=\\s*([^;\\n]+)`).exec(src);
    if (cm) {
        const rhs = cm[1].trim();
        if (/^(?:async\s*)?\(/.test(rhs) || rhs.includes('=>') || /^function\b/.test(rhs)) return { kind: 'function' };
        return { kind: 'value', ts: defaultToTs(rhs) || 'any' };
    }
    if (/^[A-Z0-9_]+$/.test(entry.orig)) return { kind: 'value', ts: 'any' };
    return { kind: 'function' };
}

const indexExports = collectIndexExports(indexSrc);

let idx = '';
idx += `// types/index.d.ts -- GENERATED, do not hand-edit.\n`;
idx += `//\n`;
idx += `// The package entry surface, enumerated from src/index.js's real export\n`;
idx += `// statements by \`node scripts/generate-component-types.mjs\`. Component\n`;
idx += `// props live in ./components.d.ts, generated from the same extraction as\n`;
idx += `// docs/component-props.md. \`npm run lint:component-types\` fails CI when\n`;
idx += `// either file is stale.\n`;
idx += `\n`;
idx += `export * from './components.js';\n`;
idx += `import type { VNode } from './components.js';\n`;
idx += `export type { VNode };\n\n`;
idx += `/** Every component in the SDK, keyed by name (\`components.AppShell({...})\`). */\n`;
idx += `export declare const components: typeof import('./components.js');\n\n`;

const fromComponentBarrel = new Set(components.map((c) => c.name));

for (const e of indexExports) {
    if (e.name === 'components') continue;
    if (e.name === 'scope') continue;
    if (fromComponentBarrel.has(e.name)) continue;
    const shape = shapeOfExport(e);
    if (shape.kind === 'namespace') {
        idx += `export declare const ${e.name}: Record<string, any>;\n`;
    } else if (shape.kind === 'class') {
        idx += `export declare class ${e.name} { constructor(...args: any[]); [key: string]: any; }\n`;
    } else if (shape.kind === 'function') {
        idx += `export declare function ${e.name}(...args: any[]): ${shape.async ? 'Promise<any>' : 'any'};\n`;
    } else {
        idx += `export declare const ${e.name}: ${shape.ts};\n`;
    }
}

idx += `\n/** The scope class every SDK stylesheet rule is prefixed with. */\n`;
idx += `export declare const scope: string;\n`;
idx += `\ndeclare const _default: Record<string, any>;\nexport default _default;\n`;

const outPath = join(root, 'types', 'components.d.ts');
const idxPath = join(root, 'types', 'index.d.ts');

if (CHECK) {
    const stale = [];
    if ((existsSync(outPath) ? readNormalized(outPath) : null) !== out) stale.push('types/components.d.ts');
    if ((existsSync(idxPath) ? readNormalized(idxPath) : null) !== idx) stale.push('types/index.d.ts');
    if (stale.length) {
        die(`[component-types] ${stale.join(' and ')} ${stale.length > 1 ? 'are' : 'is'} stale -- run \`node scripts/generate-component-types.mjs\` and commit the result`);
    }
    console.log(`[component-types] types/*.d.ts up to date (${components.length} component symbols, ${indexExports.length} entry exports, 0 drift)`);
    process.exit(0);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);
writeFileSync(idxPath, idx);
console.log(`[component-types] wrote types/components.d.ts (${components.length} symbols across ${fileOrder.length} files, ${driftWarnings.length} drift warning(s))`);
console.log(`[component-types] wrote types/index.d.ts (${indexExports.length} entry exports)`);
