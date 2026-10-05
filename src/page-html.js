import { escape, inlineMd, slugify, renderMarkdown, joinHref } from './page-html/markdown.js';
import { renderSeoTags, renderFaviconTags, renderCssLink } from './page-html/head-tags.js';
import { PAGE_INLINE_STYLES } from './page-html/page-styles.js';
import { CLIENT_SCRIPT } from './page-html/client-script.js';

export { escape, inlineMd, slugify, renderMarkdown };

const DEFAULT_SDK_MODULE_HREF = 'https://cdn.jsdelivr.net/gh/AnEntrypoint/design@main/dist/247420.js';

export function renderPageHtml({
    title = '247420', slug = 'index', siteName = '247420',
    navItems = [], basePath = '',
    hero, sections, examples, body,
    theme = 'auto', cssHref, sdkModuleHref = DEFAULT_SDK_MODULE_HREF, headExtra = '',
    seo = null,
    sidebar = null,
    marquee = null,
    showcase = null,
    panels = null,
    quickstart = null,
    statusLeft = null,
    statusRight = null,
    faviconHref = null,
    faviconGlyph = null,
    clientScriptExtra = '',
    version = null,
} = {}) {
    if (version != null && process.env.ANENTRYPOINT_ALLOW_PIN !== '1') {
        throw new Error(
            `renderPageHtml({version: '${version}'}) pins every generated page to one release, ` +
            'which opts the whole surface out of published fixes. Fleet policy is @latest. ' +
            'Set ANENTRYPOINT_ALLOW_PIN=1 to override deliberately.'
        );
    }
    const cssLink = renderCssLink({ cssHref });

    const navResolved = (Array.isArray(navItems) ? navItems : []).map(([label, href]) =>
        [label, joinHref(basePath, href)]
    );

    const pageData = {
        title, slug, siteName, navItems: navResolved, theme,
        hero: hero || null,
        sections: Array.isArray(sections) ? sections : [],
        examples: Array.isArray(examples) ? examples : [],
        bodyHtml: body ? renderMarkdown(body) : '',
        sidebar: sidebar || null,
        marquee: marquee || null,
        showcase: showcase || null,
        panels: Array.isArray(panels) ? panels : [],
        quickstart: quickstart || null,
        statusLeft: Array.isArray(statusLeft) ? statusLeft : null,
        statusRight: Array.isArray(statusRight) ? statusRight : null,
        seoAuthor: seo && seo.author ? seo.author : null,
    };

    const seoTags = seo ? renderSeoTags({ title, siteName, seo }) : '';
    const faviconTags = renderFaviconTags({ faviconHref, faviconGlyph });

    return `<!doctype html>
<html lang="en" class="ds-247420" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} / ${escape(siteName)}</title>
${seoTags}
${faviconTags}
${cssLink}
<script type="importmap">
{ "imports": { "anentrypoint-design": ${JSON.stringify(sdkModuleHref).replace(/</g, '\\u003c')} } }
</script>
<style>
${PAGE_INLINE_STYLES}
</style>
<script id="__site__" type="application/json">${JSON.stringify(pageData).replace(/</g, '\\u003c')}</script>
${headExtra}
</head>
<body>
<div id="app"></div>
<script type="module">
${CLIENT_SCRIPT}${clientScriptExtra}
</script>
</body>
</html>`;
}
