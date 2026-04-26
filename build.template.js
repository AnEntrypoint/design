#!/usr/bin/env node

/**
 * Flatspace Builder Template
 * WebJSX + Ripple UI + Tailwind CSS
 *
 * Customize the components object below for your project
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Load YAML configuration
const configPath = path.join(__dirname, 'config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

// Output directory
const outputDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================================================
// COLOR THEME - Customize here
// ============================================================================

const theme = {
  primary: '#d97706',      // Orange
  primaryDark: '#b45309',
  primaryLight: '#f59e0b',
  secondary: '#1f2937',    // Dark gray
  accent: '#ec4899',       // Pink
  light: '#f3f4f6',
};

// ============================================================================
// COMPONENT TEMPLATES - Customize for your design
// ============================================================================

const components = {
  // HERO: Full-height banner with CTA
  hero: (page) => `
    <section class="relative h-screen bg-cover bg-center flex items-center justify-center overflow-hidden" style="background-image: url('${page.content.image}');">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 text-center px-4 max-w-3xl">
        <h1 class="text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">${page.content.heading}</h1>
        <p class="text-xl md:text-2xl text-gray-100 mb-8 drop-shadow-md">${page.content.subheading}</p>
        <a href="/about" class="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          ${page.content.cta_text}
        </a>
      </div>
    </section>
  `,

  // SECTION: Two-column with image + text
  section: (page) => `
    <section class="py-16 md:py-24 ${page.index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12">
          <h2 class="text-5xl md:text-6xl font-bold text-gray-900 mb-4">${page.content.heading}</h2>
          <p class="text-xl text-gray-600 max-w-2xl">${page.content.description}</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="rounded-xl overflow-hidden shadow-xl">
            <img src="${page.content.image}" alt="${page.content.heading}" class="w-full h-96 object-cover hover:scale-105 transition-transform duration-300">
          </div>
          <div class="space-y-8">
            ${page.content.sections.map(section => `
              <div>
                <h3 class="text-3xl font-bold text-orange-600 mb-3">${section.title}</h3>
                <p class="text-gray-700 leading-relaxed text-lg">${section.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `,

  // GRID: Responsive card layout
  grid: (page) => `
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16">
          <h2 class="text-5xl md:text-6xl font-bold text-gray-900 mb-4">${page.content.heading}</h2>
          <p class="text-xl text-gray-600 max-w-2xl">${page.content.description}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${page.content.items.map(item => `
            <div class="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div class="relative h-64 overflow-hidden">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
              </div>
              <div class="p-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">${item.name}</h3>
                <p class="text-gray-600 leading-relaxed">${item.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `,

  // CONTACT: CTA section with gradient
  contact: (page) => `
    <section class="py-20 md:py-32 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-5xl md:text-6xl font-bold mb-6">${page.content.heading}</h2>
        <p class="text-xl mb-10 text-orange-100">${page.content.description}</p>
        <button class="inline-block bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-10 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-xl text-lg">
          ${page.content.cta_text}
        </button>
      </div>
    </section>
  `
};

// ============================================================================
// LAYOUT COMPONENTS - Customize for your design
// ============================================================================

// Navigation bar
const navbar = () => `
  <nav class="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex-shrink-0">
          <span class="text-3xl font-bold text-orange-600">🐅 ${config.site.title.split(':')[0]}</span>
        </div>
        <div class="hidden md:flex space-x-1">
          ${config.navigation.map(item => `
            <a href="${item.href}" class="px-4 py-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors font-medium">
              ${item.text}
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  </nav>
`;

// Footer
const footer = () => `
  <footer class="bg-gray-900 text-white py-12 border-t-4 border-orange-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <p class="text-gray-300 text-lg">${config.footer.text}</p>
      </div>
      <div class="flex flex-wrap gap-6 text-gray-400">
        ${config.footer.social.map(social => `
          <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="hover:text-orange-400 transition-colors font-medium">
            ${social.name}
          </a>
        `).join(' • ')}
      </div>
    </div>
  </footer>
`;

// Base HTML template
const baseTemplate = (content, pageTitle) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle} - ${config.site.title}</title>
    <meta name="description" content="${config.site.description}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/@webjsx/core"></script>
    <style>
      html {
        scroll-behavior: smooth;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Archivo Black', system-ui, sans-serif;
      }
    </style>
</head>
<body class="bg-white">
    ${navbar()}
    ${content}
    ${footer()}
</body>
</html>`;

// ============================================================================
// BUILD PROCESS
// ============================================================================

config.pages.forEach((page, index) => {
  page.index = index;
  const templateFn = components[page.template];
  if (!templateFn) {
    console.error(`Unknown template: ${page.template}`);
    return;
  }

  const content = templateFn(page);
  const html = baseTemplate(content, page.title);
  const filename = page.id === 'home' ? 'index.html' : `${page.id}.html`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, html);
  console.log(`✓ Built ${filename}`);
});

console.log(`\n✨ Build complete! Output in ${outputDir}/`);
