/* eslint-disable no-console */
process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');

// Mock browser globals for SSR
global.window = {
  location: { pathname: '/', href: 'https://www.grras.tech' },
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 1024,
  innerHeight: 768
};
global.document = {
  createElement: () => ({ 
    setAttribute: () => {}, 
    style: {},
    appendChild: () => {},
    removeChild: () => {},
    textContent: '',
    innerHTML: ''
  }),
  createTextNode: (text) => ({ textContent: text, nodeValue: text }),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { appendChild: () => {}, removeChild: () => {} },
  head: { appendChild: () => {}, removeChild: () => {}, firstChild: null },
  getElementsByTagName: () => [{ appendChild: () => {}, removeChild: () => {} }],
  addEventListener: () => {},
  removeEventListener: () => {},
  hidden: false
};
global.navigator = { userAgent: 'SSR' };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Mock CSS and asset imports for SSR
require.extensions['.css'] = () => {};
require.extensions['.scss'] = () => {};
require.extensions['.sass'] = () => {};
require.extensions['.less'] = () => {};
require.extensions['.png'] = () => {};
require.extensions['.jpg'] = () => {};
require.extensions['.jpeg'] = () => {};
require.extensions['.gif'] = () => {};
require.extensions['.svg'] = () => {};

// Allow JSX/TSX imports from src in this Node script
require('@babel/register')({
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript', {}]
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  ignore: [/node_modules/]
});

const React = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');

// Import your app
const App = require('../src/App').default;

// Routes to prerender
const routes = require('./prerender-routes.json');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const INDEX_HTML = path.join(BUILD_DIR, 'index.html');
const TEMPLATE = fs.readFileSync(INDEX_HTML, 'utf8');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function inject(template, appHtml, meta = {}) {
  let out = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  if (meta.title) {
    out = out.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
  }
  if (meta.description) {
    if (out.match(/<meta name="description" content=".*?">/)) {
      out = out.replace(
        /<meta name="description" content=".*?">/,
        `<meta name="description" content="${meta.description}">`
      );
    } else {
      out = out.replace('</head>', `<meta name="description" content="${meta.description}"></head>`);
    }
  }
  return out;
}

const BASE_URL = 'https://www.grras.tech';
const sitemapUrls = [];

console.log('🚀 Starting prerender (no CRA build here)…');

routes.forEach((r) => {
  const route = typeof r === 'string' ? r : r.path;
  const meta = typeof r === 'string' ? {} : { title: r.title, description: r.description };

  try {
    console.log(`🔍 Processing route: ${route}`);
    
    const appHtml = renderToString(
      React.createElement(StaticRouter, { location: route }, React.createElement(App))
    );

    console.log(`📏 Generated HTML length: ${appHtml.length} chars for ${route}`);
    console.log(`🔍 First 200 chars: ${appHtml.substring(0, 200)}...`);

    const finalHtml = inject(TEMPLATE, appHtml, meta);

    const outDir = path.join(BUILD_DIR, route === '/' ? '' : route);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), finalHtml, 'utf8');

    sitemapUrls.push(route);
    console.log('✅ Prerendered:', route);
    
  } catch (error) {
    console.error(`❌ Failed to prerender ${route}:`, error.message);
    // Write fallback template
    const outDir = path.join(BUILD_DIR, route === '/' ? '' : route);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), TEMPLATE, 'utf8');
    sitemapUrls.push(route);
  }
});

// sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url><loc>${BASE_URL}${u}</loc></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap, 'utf8');

// robots.txt
fs.writeFileSync(
  path.join(BUILD_DIR, 'robots.txt'),
  `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`,
  'utf8'
);

console.log('🎉 Done prerendering without calling react-scripts build.');
console.log(`📄 Generated ${sitemapUrls.length} prerendered pages + sitemap.xml + robots.txt`);