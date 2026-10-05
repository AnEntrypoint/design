#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

export function walkFiles(dir, extSet, { skipDirs } = {}) {
    const acc = [];
    walkInto(dir, extSet, skipDirs, acc);
    return acc;
}

function walkInto(dir, extSet, skipDirs, acc) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (skipDirs && skipDirs.has(e.name)) continue;
            walkInto(full, extSet, skipDirs, acc);
        } else if (extSet.has(path.extname(e.name))) {
            acc.push(full);
        }
    }
}

export function walkManyDirs(baseDirs, extSet, opts) {
    const acc = [];
    for (const dir of baseDirs) acc.push(...walkFiles(dir, extSet, opts));
    return acc;
}
