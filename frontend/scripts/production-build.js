#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('⚡ Starting SSR pre-rendering (build-only, no react-scripts)...');

try {
  // Check if build directory exists
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found at:', buildDir);
    process.exit(1);
  }
  
  console.log('✅ Found build directory at:', buildDir);

  // Set production environment
  process.env.NODE_ENV = 'production';
  
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
  
  // Setup Babel for JSX/ES6 compilation
  require('@babel/register')({
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    ignore: [/node_modules/]
  });
  
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  const { StaticRouter } = require('react-router-dom/server');
  const { HelmetProvider } = require('react-helmet-async');
  
  // Import our minimal SSR app
  const ServerApp = require('../src/ssr/MinimalServerApp').default;
  
  // Routes to prerender
  const routes = [
    '/',
    '/about',
    '/courses',
    '/contact',
    '/placements', 
    '/blog',
    '/admissions',
    '/courses/devops-training',
    '/courses/kubernetes-administrator-cka',
    '/courses/docker-containerization',
    '/courses/rhcsa-red-hat-certified-system-administrator',
    '/courses/rhce-red-hat-certified-engineer',
    '/courses/do188-red-hat-openshift-development',
    '/courses/do280-red-hat-openshift-administration',
    '/courses/aws-solutions-architect-associate',
    '/courses/aws-sysops-administrator',
    '/courses/aws-developer-associate',
    '/courses/azure-fundamentals-az900',
    '/courses/azure-administrator-az104',
    '/courses/google-cloud-associate-engineer',
    '/courses/python-programming-data-science',
    '/courses/machine-learning-artificial-intelligence',
    '/courses/full-stack-web-development',
    '/courses/java-programming-enterprise',
    '/courses/ethical-hacking-penetration-testing',
    '/courses/cybersecurity-fundamentals',
    '/blog/devops-career-opportunities-2025',
    '/blog/aws-certification-roadmap-2025',
    '/blog/python-programming-beginner-guide-2025',
    '/blog/cybersecurity-fundamentals-2025'
  ];
  
  const indexTpl = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
  
  function writeRoute(route, html) {
    const outDir = path.join(buildDir, route === '/' ? '' : route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('✅ SSR prerendered:', route);
  }
  
  // Prerender each route
  for (const route of routes) {
    try {
      const helmetContext = {};
      
      const app = React.createElement(
        HelmetProvider, { context: helmetContext },
        React.createElement(
          StaticRouter, { location: route },
          React.createElement(ServerApp, null)
        )
      );
      
      const markup = renderToString(app);
      const helmet = helmetContext.helmet || {};
      
      // Collect head tags from Helmet
      const headTags = [
        helmet.title && helmet.title.toString(),
        helmet.meta && helmet.meta.toString(),
        helmet.link && helmet.link.toString(),
      ].filter(Boolean).join('\n');
      
      // 1) Inject SSR markup into #root
      let outHtml = indexTpl.replace(
        /<div id="root"><\/div>/g,
        `<div id="root">${markup}</div>`
      );
      
      // 2) Inject Helmet head tags before </head>
      if (headTags) {
        outHtml = outHtml.replace(/<\/head>/g, `${headTags}\n</head>`);
      }
      
      writeRoute(route, outHtml);
      
    } catch (error) {
      console.error(`❌ SSR failed for route ${route}:`, error.message);
      // Fallback: write original template
      writeRoute(route, indexTpl);
    }
  }
  
  console.log(`🎉 SSR prerender complete! Generated ${routes.length} route-specific pages.`);
  
} catch (error) {
  console.error('❌ Prerender failed:', error.message);
  process.exit(1);
}