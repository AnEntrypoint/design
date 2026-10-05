#!/usr/bin/env node
import {
    lintTokensOrThrow,
    lintRadiusOrThrow,
    lintSpacingOrThrow,
    lintFontSizeOrThrow,
    lintZIndexOrThrow,
    lintTransitionAllOrThrow,
    lintDarkParityOrThrow,
    lintImportantOrThrow,
    lintTokensJsonInSyncOrThrow,
} from './lint-tokens.mjs';
import { lintGlyphsOrThrow } from './lint-glyphs.mjs';
import { lintNullChildrenOrThrow } from './lint-null-children.mjs';
import { lintClassesOrThrow } from './lint-classes.mjs';
import { lintInlineStylesOrThrow } from './lint-inline-styles.mjs';
import { lintDuplicateSelectorsOrThrow } from './lint-duplicate-selectors.mjs';
import { lintEmptyCatchOrThrow } from './lint-empty-catch.mjs';
import { lintInlineCssOrThrow } from './lint-inline-css.mjs';
import { lintDeadControlsOrThrow } from './lint-dead-controls.mjs';
import { lintYamlParseOrThrow } from './lint-yaml-parse.mjs';

const CHECKS = [
    ['tokens', lintTokensOrThrow],
    ['tokens-json', lintTokensJsonInSyncOrThrow],
    ['radius', lintRadiusOrThrow],
    ['zindex', lintZIndexOrThrow],
    ['transition-all', lintTransitionAllOrThrow],
    ['dark-parity', lintDarkParityOrThrow],
    ['spacing', lintSpacingOrThrow],
    ['fontsize', lintFontSizeOrThrow],
    ['important', lintImportantOrThrow],
    ['inline-css', lintInlineCssOrThrow],
    ['glyphs', lintGlyphsOrThrow],
    ['null-children', lintNullChildrenOrThrow],
    ['classes', lintClassesOrThrow],
    ['inline-styles', lintInlineStylesOrThrow],
    ['duplicate-selectors', lintDuplicateSelectorsOrThrow],
    ['empty-catch', lintEmptyCatchOrThrow],
    ['dead-controls', lintDeadControlsOrThrow],
    ['yaml-parse', lintYamlParseOrThrow],
];

export function runLintCss() {
    const results = [];
    for (const [name, fn] of CHECKS) {
        try {
            fn();
            results.push({ name, ok: true });
        } catch (e) {
            console.error(e.message);
            results.push({ name, ok: false, error: e.message });
        }
    }

    const failed = results.filter((r) => !r.ok);
    const passed = results.filter((r) => r.ok);

    console.log('');
    console.log('[lint] summary: ' + passed.length + '/' + results.length + ' checks passed'
        + (failed.length ? ': FAILED: ' + failed.map((r) => r.name).join(', ') : ''));

    if (failed.length) {
        process.exitCode = 1;
    }
    return { results, failed, passed };
}

if (process.argv[1]?.endsWith('lint-css.mjs')) {
    runLintCss();
}
