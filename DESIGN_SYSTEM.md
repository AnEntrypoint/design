# Design System Template
## WebJSX + Ripple UI + Tailwind CSS

Base template for all projects using WebJSX web components with Ripple UI component patterns and Tailwind CSS styling.

### Core Technologies

- **WebJSX** (webjsx.org) - Web Components framework with JSX support
- **Ripple UI** (ripple-ui.com) - Pre-built component library on Tailwind
- **Tailwind CSS** - Utility-first CSS framework

### Component Library

#### Navigation Components
- **Navbar** - Sticky header with logo and navigation links
- **Sidebar** - Collapsible side navigation
- **Breadcrumb** - Navigation path indicator
- **Tabs** - Tabbed interface

#### Content Components
- **Hero** - Full-height banner with background image overlay
- **Section** - Two-column layout with image and text
- **Grid/Cards** - Responsive card grid layout
- **Accordion** - Collapsible content sections

#### Input Components
- **Button** - Primary, secondary, danger variants
- **Input** - Text, email, password fields
- **Textarea** - Multi-line text input
- **Select/Dropdown** - Option selection
- **Checkbox/Radio** - Boolean selections
- **Toggle/Switch** - On/off controls

#### Data Display
- **Table** - Sortable, paginated data display
- **Badge** - Label/tag display
- **Avatar** - User profile images
- **Progress** - Progress bars
- **Skeleton** - Loading placeholders

#### Feedback Components
- **Alert** - Info, success, warning, error messages
- **Modal** - Dialog windows
- **Tooltip** - Hover information
- **Popover** - Pop-up content

### Color Palette

```css
:root {
  /* Primary Colors */
  --primary: #d97706;        /* Orange */
  --primary-dark: #b45309;   /* Dark Orange */
  --primary-light: #f59e0b;  /* Light Orange */
  
  /* Neutral Colors */
  --gray-900: #111827;       /* Darkest */
  --gray-700: #374151;       /* Dark */
  --gray-500: #6b7280;       /* Medium */
  --gray-200: #e5e7eb;       /* Light */
  --gray-50: #f9fafb;        /* Lightest */
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
}
```

### Typography

Fonts: **Archivo Black** (display/headings) + **JetBrains Mono** (UI/body/code) + **Instrument Serif** (long-form prose)

```css
/* Google Fonts: Archivo Black + JetBrains Mono + Instrument Serif */
/* --ff-display  Archivo Black — hero, h1, h2, stamps, brand name */
/* --ff-mono     JetBrains Mono — all UI text, labels, code, body */
/* --ff-prose    Instrument Serif — .t-prose, .prose p only */
h1, h2, .t-hero {
  font-family: var(--ff-display);  /* Archivo Black */
  font-weight: 800;
}
h3, h4, body, .t-body {
  font-family: var(--ff-mono);     /* JetBrains Mono */
}
.t-prose, .prose p {
  font-family: var(--ff-prose);    /* Instrument Serif */
}
```

### Spacing Scale

```
4px   = 1 unit
8px   = 2 units
12px  = 3 units
16px  = 4 units
24px  = 6 units
32px  = 8 units
48px  = 12 units
64px  = 16 units
```

### Border Radius

```
4px  = xs (inputs, buttons)
8px  = md (cards, modals)
12px = lg (sections)
16px = xl (large elements)
```

### Shadows

```
shadow-sm:  0 1px 2px 0 rgba(0,0,0,0.05)
shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1)
shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1)
shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1)
```

### Transitions

```css
transition-colors   /* For color changes */
transition-opacity  /* For fade effects */
transition-transform /* For scale, rotate */
transition-all      /* All properties */
duration-200        /* Fast (200ms) */
duration-300        /* Standard (300ms) */
duration-500        /* Slow (500ms) */
```

### Responsive Breakpoints

```
- Mobile: default (no prefix)
- Tablet: sm: 640px
- Laptop: md: 768px
- Desktop: lg: 1024px
- Wide: xl: 1280px
- Ultra: 2xl: 1536px
```

### Layout Patterns

#### Hero Section
```html
<section class="relative h-screen bg-cover bg-center flex items-center justify-center">
  <div class="absolute inset-0 bg-black/40"></div>
  <div class="relative z-10 text-center">
    <!-- Content -->
  </div>
</section>
```

#### Two-Column Section
```html
<section class="py-16 md:py-24">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="rounded-xl overflow-hidden shadow-lg">
      <img src="" alt="" class="w-full h-full object-cover">
    </div>
    <div class="space-y-8">
      <!-- Text content -->
    </div>
  </div>
</section>
```

#### Card Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
    <img src="" alt="" class="w-full h-64 object-cover">
    <div class="p-6">
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

### Button Variants

```html
<!-- Primary -->
<button class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg">
  Button
</button>

<!-- Secondary -->
<button class="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-8 rounded-lg">
  Button
</button>

<!-- Outline -->
<button class="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold py-3 px-8 rounded-lg">
  Button
</button>
```

### Card Variants

```html
<!-- Simple Card -->
<div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
  <h3>Title</h3>
  <p>Content</p>
</div>

<!-- Hover Card -->
<div class="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all">
  <img class="group-hover:scale-110 transition-transform">
  <div class="p-6">
    <h3>Title</h3>
  </div>
</div>
```

### Alert Variants

```html
<!-- Success -->
<div class="bg-green-50 border-l-4 border-green-600 p-4">
  <p class="text-green-800">Success message</p>
</div>

<!-- Error -->
<div class="bg-red-50 border-l-4 border-red-600 p-4">
  <p class="text-red-800">Error message</p>
</div>

<!-- Warning -->
<div class="bg-yellow-50 border-l-4 border-yellow-600 p-4">
  <p class="text-yellow-800">Warning message</p>
</div>

<!-- Info -->
<div class="bg-blue-50 border-l-4 border-blue-600 p-4">
  <p class="text-blue-800">Info message</p>
</div>
```

### WebJSX Component Example

```jsx
// Using createElement for JSX
const Hero = ({ title, subtitle, cta }) => (
  <section class="relative h-screen flex items-center justify-center">
    <h1>{title}</h1>
    <p>{subtitle}</p>
    <button onclick={() => console.log('clicked')}>{cta}</button>
  </section>
);

// Apply to DOM
applyDiff(document.body, Hero({
  title: "Welcome",
  subtitle: "Build modern UIs",
  cta: "Get Started"
}));
```

### Best Practices

1. **Accessibility First**
   - Use semantic HTML (button, nav, section, etc.)
   - Include alt text for images
   - Maintain sufficient color contrast
   - Support keyboard navigation

2. **Mobile First**
   - Design for mobile first, then enhance
   - Use responsive prefixes (sm:, md:, lg:)
   - Test on multiple screen sizes

3. **Performance**
   - Use Tailwind CDN for static sites
   - Defer non-critical JavaScript
   - Optimize images
   - Minimize web font variants

4. **Consistency**
   - Follow the color palette
   - Use standard spacing scale
   - Maintain typography hierarchy
   - Reuse component patterns

5. **Dark Mode**
   - Use `dark:` prefix for dark mode styles
   - Ensure sufficient contrast
   - Test with actual dark mode

### File Structure

```
project/
├── config.yaml           # YAML configuration
├── build.js             # Build script using this template
├── dist/                # Generated static files
├── .github/workflows/   # GitHub Actions
└── design-system/       # (Optional) Custom extensions
    └── components.css   # Custom component styles
```

### Quick Start

```bash
# Copy this template to your project
npm install js-yaml

# Edit config.yaml with your content
# Run the build script
node build.js

# Output will be in dist/
```

### Resources

- [WebJSX Documentation](https://webjsx.org)
- [Ripple UI Components](https://ripple-ui.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Google Fonts](https://fonts.google.com)

### Contrast Hard Rule — never hardcode `#ffffff` on accent surfaces

The design system pairs every accent background with a foreground token (`--panel-accent-fg`, `--green-fg`, `--mascot-fg`, `--purple-fg`, etc.). In dark themes the accent often resolves to a *light* hue (e.g. `--green-2 = #92CEAC`); painting `#ffffff` text on top produces invisible "white-on-lime" output.

**Always:**
- Pair `background: var(--panel-accent)` with `color: var(--panel-accent-fg)`.
- Pair `background: var(--green)` with `color: var(--green-fg)`.
- Use the `.on-acid` / `.on-lime` / `[data-accent="acid"]` classes when painting the raw `--acid` token; they force `color: var(--ink)`.

**Never:**
- Hardcode `color: #ffffff` (or `#fff`) anywhere the background depends on a theme token. Use the paired `--*-fg` companion instead, which flips with dark mode.
- Paint `--acid` directly without the `.on-acid` wrapper.

**Token contract:** every panel/accent token MUST have a `*-fg` sibling defined in both `:root` (light) and dark-mode overrides. Light mode green-bg + white-text is fine; dark mode mint-bg + white-text is the bug. The fg token absorbs that flip.
