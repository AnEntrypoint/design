export const PAGE_INLINE_STYLES = `
.app-stage { width: 100%; max-width: var(--stage-wide, min(96%, 1600px)); margin-inline: auto; padding: var(--space-6, 48px) var(--space-4, 24px) var(--space-8, 96px); display: grid; gap: var(--space-6, 48px); box-sizing: border-box }
@container (max-width: 768px) { .app-stage { padding: var(--space-4, 24px) var(--space-3, 16px) var(--space-6, 48px); gap: var(--space-5, 32px) } }
.app-stage > .ds-tier { display: grid; gap: var(--space-3, 16px) }
.app-stage > .ds-tier + .ds-tier { margin-top: var(--space-5, 32px) }
.ds-tier-head { display: grid; gap: var(--space-2, 8px); margin-bottom: var(--space-1, 4px); justify-items: start }
.ds-tier-head > h2.eyebrow { margin: 0; font-size: var(--fs-tiny, 11px); line-height: 1.2 }
.ds-tier-lede { margin: 0; max-width: var(--measure, 68ch); color: var(--fg-3); font-size: var(--fs-sm, 15px) }
.ds-tier-read .panel { background: var(--panel-1, var(--bg)) }
.ds-tier-read .row .meta { color: var(--fg-3) }
.page-body > :first-child { margin-top: 0 }
.page-body h1 { margin-top: 0 } .page-body h2 { margin-top: var(--space-5, 32px) } .page-body h3 { margin-top: var(--space-4, 24px) }
.page-body > * + * { margin-top: var(--space-3, 16px) }
.page-body pre { margin: var(--space-3, 16px) 0; background: var(--panel-2); padding: var(--space-3, 16px); border-radius: var(--r-1, 10px); overflow-x: auto }
.ds-247420 .app-stage > .ds-hero { margin: 0 !important; padding: var(--space-4, 24px) 0 0 !important; max-width: none !important; gap: var(--space-4, 24px) !important }
.ds-247420 .app-stage > .ds-section { margin: 0 !important }
.app-stage .row + .row { margin-top: var(--space-1, 4px) }
.app-stage .ds-section .row { margin-top: var(--space-2, 8px) }
.app-stage .ds-section > p.ds-lede { margin: 0 0 var(--space-3, 16px); max-width: var(--measure, 68ch); color: var(--fg-2) }
.row-benefit { font-style: italic; color: var(--fg-3); font-size: var(--fs-sm); margin-top: var(--space-1, 4px) }
.ds-row-arrow { margin-left: auto; opacity: .5; transition: opacity var(--dur-snap, 80ms) var(--ease) }
a.row:hover .ds-row-arrow { opacity: 1 }
.ds-hero-accent { display: block; margin-top: var(--space-2, 8px); color: var(--fg-3) }
.ds-feature { padding: var(--space-3, 16px) var(--space-4, 24px); background: var(--panel-1, var(--bg)); border-radius: var(--r-2, 14px); display: grid; gap: var(--space-1, 4px) }
.ds-feature + .ds-feature { margin-top: var(--space-2, 8px) }
.ds-feature-title { font-weight: 600; font-size: var(--fs-lg, 18px); color: var(--fg) }
.ds-feature-desc { font-size: var(--fs-sm, 15px); color: var(--fg-2); line-height: 1.5; overflow-wrap: anywhere }
.ds-feature-benefit { font-style: italic; font-size: var(--fs-sm, 15px); color: var(--fg-3); margin-top: var(--space-1, 4px) }
.ds-page-footer {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: var(--space-3, 16px);
  padding-top: var(--space-5, 32px);
  margin-top: var(--space-3, 16px);
  border-top: 1px solid var(--rule, var(--bg-3));
  color: var(--fg-3); font-size: var(--fs-sm, 15px);
}
.ds-page-footer-links { display: flex; gap: var(--space-4, 24px) }
.ds-page-footer-links a { color: var(--fg-3) }
.ds-page-footer-links a:hover { color: var(--fg) }
.ds-showcase-grid {
  display: grid; gap: var(--space-3, 16px);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.ds-showcase-card {
  padding: var(--space-3, 16px); background: var(--panel-1, var(--bg));
  border-radius: var(--r-2, 14px); display: grid; gap: var(--space-2, 8px);
}
.ds-showcase-card--wide { grid-column: 1 / -1; }
.ds-showcase-label {
  font-size: var(--fs-tiny, 13px); font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--fg-3, #6b6b6b);
}
.ds-showcase-row { display: flex; flex-wrap: wrap; gap: var(--space-2, 8px); align-items: center; }
.ds-showcase-btn-danger-group {
  display: inline-flex; align-items: center;
  margin-left: var(--space-3, 16px);
  padding-left: var(--space-3, 16px);
  border-left: 1px solid var(--rule, rgba(0,0,0,.12));
}
.ds-kit-card-grid {
  display: grid; gap: var(--space-2, 8px);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.ds-kit-card {
  display: grid; gap: var(--space-1, 4px); align-content: start;
  padding: var(--space-3, 16px); background: var(--panel-1, var(--bg));
  border-radius: var(--r-2, 14px); color: inherit; text-decoration: none;
  transition: transform var(--dur-base, .18s) var(--ease, ease), box-shadow var(--dur-base, .18s) var(--ease, ease);
  position: relative;
}
.ds-kit-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-1, 0 1px 2px rgba(0,0,0,.1)); }
.ds-kit-card:focus-visible { outline: var(--focus-w, 2px) solid var(--focus-color, currentColor); outline-offset: var(--focus-offset, 2px); }
.ds-kit-card-code {
  font-family: var(--ff-mono, monospace); font-size: var(--fs-micro, 12px);
  color: var(--fg-3, #6b6b6b);
}
.ds-kit-card-title { font-weight: 600; font-size: var(--fs-base, 16px); }
.ds-kit-card-sub { font-size: var(--fs-sm, 15px); color: var(--fg-2, #444); }
.ds-kit-card-arrow {
  position: absolute; top: var(--space-3, 16px); right: var(--space-3, 16px);
  color: var(--fg-3, #6b6b6b); font-size: var(--fs-sm, 15px);
}
`.trim();
