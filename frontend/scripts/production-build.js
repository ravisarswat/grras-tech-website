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

// Import your app routes (without BrowserRouter)
const AppRoutes = require('../src/AppRoutes').default;

// Routes to prerender
const routes = require('./prerender-routes.json');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const INDEX_HTML = path.join(BUILD_DIR, 'index.html');
const TEMPLATE = fs.readFileSync(INDEX_HTML, 'utf8');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function inject(template, appHtml, meta = {}) {
  let out = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  
  // Inject title
  if (meta.title) {
    out = out.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
  }
  
  // Inject meta description
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
  
  // Inject canonical URL
  if (meta.canonical) {
    out = out.replace('</head>', `<link rel="canonical" href="${meta.canonical}"></head>`);
  }
  
  // Inject JSON-LD structured data
  if (meta.jsonLd) {
    out = out.replace('</head>', `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script></head>`);
  }
  
  return out;
}

// Import courses data for metadata generation
const { courses } = require('../src/data/courses');

// Generate SEO metadata for different routes
function generateMetadata(route) {
  const baseUrl = 'https://www.grras.tech';
  
  // Default organization JSON-LD
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GRRAS Solutions Training Institute",
    "alternateName": "GRRAS Tech",
    "url": baseUrl,
    "logo": "https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png",
    "sameAs": [
      "https://www.facebook.com/grrassolutionss",
      "https://www.instagram.com/grrassolutionss/",
      "https://www.youtube.com/@grrassolutions"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9001991227",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302012",
      "addressCountry": "IN"
    }
  };

  // Route-specific metadata
  if (route === '/') {
    return {
      title: 'GRRAS Solutions Training Institute | IT & Cloud Certification Courses',
      description: 'Transform your career with industry-recognized IT certifications. Expert training in DevOps, AWS, Red Hat, Azure, Python, Data Science & Cybersecurity. 95% success rate.',
      canonical: baseUrl,
      jsonLd: organizationJsonLd
    };
  }
  
  if (route === '/about') {
    return {
      title: 'About GRRAS Solutions | Leading IT Training Institute in Jaipur',
      description: 'Learn about GRRAS Solutions Training Institute - Jaipur\'s premier IT education center offering professional certification courses with industry mentorship and placement assistance.',
      canonical: `${baseUrl}/about`,
      jsonLd: organizationJsonLd
    };
  }
  
  if (route === '/courses') {
    return {
      title: 'IT Certification Courses | DevOps, AWS, Red Hat, Azure Training',
      description: 'Browse 19+ professional IT certification courses - DevOps, AWS, Red Hat, Azure, Python, Data Science, Cybersecurity. Industry-recognized training with hands-on labs.',
      canonical: `${baseUrl}/courses`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "IT Certification Courses",
        "description": "Professional IT training courses offered by GRRAS Solutions Training Institute",
        "provider": organizationJsonLd,
        "numberOfItems": courses.filter(c => c.visible !== false).length,
        "itemListElement": courses.filter(c => c.visible !== false).map((course, index) => ({
          "@type": "Course",
          "position": index + 1,
          "name": course.title,
          "description": course.description || course.oneLiner,
          "url": `${baseUrl}/courses/${course.slug}`,
          "provider": organizationJsonLd
        }))
      }
    };
  }
  
  if (route === '/contact') {
    return {
      title: 'Contact GRRAS Solutions | Admission Counseling & Course Information',
      description: 'Get in touch with GRRAS Solutions for course information, admission counseling, and career guidance. Call +91-9001991227 or visit our Jaipur campus.',
      canonical: `${baseUrl}/contact`,
      jsonLd: organizationJsonLd
    };
  }
  
  if (route === '/placements') {
    return {
      title: 'Student Placements | GRRAS Solutions Success Stories & Career Growth',
      description: 'Discover world-class student placements and career success stories from GRRAS Solutions graduates. 95% placement rate with top companies.',
      canonical: `${baseUrl}/placements`,
      jsonLd: organizationJsonLd
    };
  }
  
  if (route === '/blog') {
    return {
      title: 'IT Career Blog | DevOps, Cloud Computing & Technology Insights',
      description: 'Stay updated with latest IT career trends, DevOps insights, cloud computing news, and technology career guidance from GRRAS Solutions experts.',
      canonical: `${baseUrl}/blog`,
      jsonLd: organizationJsonLd
    };
  }
  
  if (route === '/admissions') {
    return {
      title: 'Admissions | Join GRRAS Solutions IT Training Programs',
      description: 'Apply for admission to GRRAS Solutions IT training programs. Flexible batches, EMI options, and personalized career counseling available.',
      canonical: `${baseUrl}/admissions`,
      jsonLd: organizationJsonLd
    };
  }
  
  // Individual course pages
  if (route.startsWith('/courses/')) {
    const slug = route.replace('/courses/', '');
    const course = courses.find(c => c.slug === slug);
    
    if (course) {
      return {
        title: `${course.title} | GRRAS Solutions Training Institute`,
        description: course.description || course.oneLiner || `Learn ${course.title} with hands-on training, industry mentorship, and certification preparation at GRRAS Solutions.`,
        canonical: `${baseUrl}/courses/${course.slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": course.title,
          "description": course.description || course.oneLiner,
          "url": `${baseUrl}/courses/${course.slug}`,
          "provider": organizationJsonLd,
          "educationalLevel": course.level || "Professional",
          "timeRequired": course.duration,
          "offers": course.fees ? {
            "@type": "Offer",
            "price": course.fees.replace(/[^\d]/g, ''),
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock"
          } : undefined,
          "courseMode": Array.isArray(course.mode) ? course.mode : (course.mode ? course.mode.split(', ') : ["Classroom", "Online"]),
          "teaches": course.highlights || course.learningOutcomes || [],
          "applicationDeadline": "Open enrollment",
          "startDate": "Monthly batches"
        }
      };
    }
  }
  
  // Individual blog pages
  if (route.startsWith('/blog/')) {
    const slug = route.replace('/blog/', '');
    const blogTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
      title: `${blogTitle} | GRRAS Solutions Blog`,
      description: `Read about ${blogTitle.toLowerCase()} and stay updated with latest IT career insights, trends, and professional guidance from GRRAS Solutions experts.`,
      canonical: `${baseUrl}/blog/${slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blogTitle,
        "url": `${baseUrl}/blog/${slug}`,
        "publisher": organizationJsonLd,
        "author": {
          "@type": "Organization",
          "name": "GRRAS Solutions Training Institute"
        }
      }
    };
  }
  
  // Default fallback
  return {
    title: 'GRRAS Solutions Training Institute | IT & Cloud Education',
    description: 'Professional IT training and certification courses with industry mentorship and placement assistance.',
    canonical: `${baseUrl}${route}`,
    jsonLd: organizationJsonLd
  };
}
const sitemapUrls = [];

console.log('🚀 Starting prerender (no CRA build here)…');

// Remove debug logging to clean up output
routes.forEach((r) => {
  const route = typeof r === 'string' ? r : r.path;
  const meta = typeof r === 'string' ? {} : { title: r.title, description: r.description };

  try {
    const appHtml = renderToString(
      React.createElement(StaticRouter, { location: route }, React.createElement(AppRoutes))
    );

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