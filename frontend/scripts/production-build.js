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

// Enhanced head injection handled in route rendering loop

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
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  if (route === '/about') {
    return {
      title: 'About GRRAS Solutions | Leading IT Training Institute in Jaipur',
      description: 'Learn about GRRAS Solutions Training Institute - Jaipur\'s premier IT education center offering professional certification courses with industry mentorship and placement assistance.',
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  if (route === '/courses') {
    return {
      title: 'IT Certification Courses | DevOps, AWS, Red Hat, Azure Training',
      description: 'Browse 19+ professional IT certification courses - DevOps, AWS, Red Hat, Azure, Python, Data Science, Cybersecurity. Industry-recognized training with hands-on labs.',
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  if (route === '/contact') {
    return {
      title: 'Contact GRRAS Solutions | Admission Counseling & Course Information',
      description: 'Get in touch with GRRAS Solutions for course information, admission counseling, and career guidance. Call +91-9001991227 or visit our Jaipur campus.',
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  if (route === '/placements') {
    return {
      title: 'Student Placements | GRRAS Solutions Success Stories & Career Growth',
      description: 'Discover world-class student placements and career success stories from GRRAS Solutions graduates. 95% placement rate with top companies.',
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  if (route === '/blog') {
    return {
      title: 'IT Career Blog | DevOps, Cloud Computing & Technology Insights',
      description: 'Stay updated with latest IT career trends, DevOps insights, cloud computing news, and technology career guidance from GRRAS Solutions experts.',
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  if (route === '/admissions') {
    return {
      title: 'Admissions | Join GRRAS Solutions IT Training Programs',
      description: 'Apply for admission to GRRAS Solutions IT training programs. Flexible batches, EMI options, and personalized career counseling available.',
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
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
        ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
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
      ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
    };
  }
  
  // Default fallback
  return {
    title: 'GRRAS Solutions Training Institute | IT & Cloud Education',
    description: 'Professional IT training and certification courses with industry mentorship and placement assistance.',
    ogImage: 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
  };
}
const ORIGIN = process.env.PUBLIC_CANONICAL_ORIGIN || 'https://www.grras.tech';

// SEO injection happens directly in the main loop now

function courseJsonLd({ name, description, path, courseData }) {
  const url = `${ORIGIN}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "url": url,
    "provider": {
      "@type": "Organization",
      "name": "GRRAS Solutions Training Institute",
      "alternateName": "GRRAS Tech",
      "url": ORIGIN,
      "logo": "https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png",
      "sameAs": [
        "https://www.facebook.com/grrassolutionss",
        "https://www.instagram.com/grrassolutionss/",
        "https://www.youtube.com/@grrassolutions"
      ]
    }
  };
  
  // Add course-specific data if available
  if (courseData) {
    if (courseData.duration) jsonLd.timeRequired = courseData.duration;
    if (courseData.level) jsonLd.educationalLevel = courseData.level;
    if (courseData.fees) {
      jsonLd.offers = {
        "@type": "Offer",
        "price": courseData.fees.replace(/[^\d]/g, ''),
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      };
    }
    if (courseData.mode) {
      jsonLd.courseMode = Array.isArray(courseData.mode) ? courseData.mode : courseData.mode.split(', ');
    }
  }
  
  // Properly escape JSON-LD for HTML injection
  const escapedJson = JSON.stringify(jsonLd, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return `<script type="application/ld+json">${escapedJson}</script>`;
}

function organizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GRRAS Solutions Training Institute",
    "alternateName": "GRRAS Tech",
    "url": ORIGIN,
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
  
  return `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;
}

const sitemapUrls = [];

console.log('🚀 Starting prerender (no CRA build here)…');

// Generate prerendered pages with enhanced SEO metadata
routes.forEach((r) => {
  const route = typeof r === 'string' ? r : r.path;
  const metadata = generateMetadata(route);

  try {
    const appHtml = renderToString(
      React.createElement(StaticRouter, { location: route }, React.createElement(AppRoutes))
    );

    // SEO metadata will be injected directly into HTML
    
    // Generate JSON-LD structured data
    let jsonLdContent = '';
    if (route.startsWith('/courses/')) {
      // Individual course page
      const slug = route.replace('/courses/', '');
      const courseData = courses.find(c => c.slug === slug);
      jsonLdContent = courseJsonLd({
        name: metadata.title.replace(' | GRRAS Solutions Training Institute', ''),
        description: metadata.description,
        path: route,
        courseData: courseData
      });
    } else {
      // Other pages - use organization schema
      jsonLdContent = organizationJsonLd();
    }
    
    // Inject head content and structured data using different approach for minified HTML
    let finalHtml = TEMPLATE.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    
    // Replace existing title and description with new ones
    finalHtml = finalHtml.replace(/<title>.*?<\/title>/i, `<title>${metadata.title}</title>`);
    finalHtml = finalHtml.replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${metadata.description}">`);
    
    // Ensure title tag is present (add if missing)
    if (!finalHtml.includes('<title>')) {
      finalHtml = finalHtml.replace('</head>', `<title>${metadata.title}</title>\n</head>`);
    }
    
    // Add SEO tags before </head> - ensuring proper placement after </style>
    const seoTags = `<link rel="canonical" href="${ORIGIN}${route}">
<meta property="og:title" content="${metadata.title}">
<meta property="og:description" content="${metadata.description}">
<meta property="og:url" content="${ORIGIN}${route}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GRRAS Solutions Training Institute">
<meta property="og:image" content="${metadata.ogImage || 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${metadata.title}">
<meta name="twitter:description" content="${metadata.description}">
<meta name="twitter:image" content="${metadata.ogImage || 'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'}">
${jsonLdContent}`;
    
    // Very safe approach: Insert SEO tags using a more careful method
    const headEndIndex = finalHtml.lastIndexOf('</head>');
    if (headEndIndex !== -1) {
      finalHtml = finalHtml.slice(0, headEndIndex) + seoTags + '\n' + finalHtml.slice(headEndIndex);
    }

    const outDir = path.join(BUILD_DIR, route === '/' ? '' : route);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), finalHtml, 'utf8');

    sitemapUrls.push(route);
    console.log('✅ Prerendered:', route, `(${metadata.title})`);
    
  } catch (error) {
    console.error(`❌ Failed to prerender ${route}:`, error.message);
    // Write fallback template with basic SEO
    let fallbackHtml = TEMPLATE;
    const fallbackTitle = metadata.title || 'GRRAS Solutions Training Institute';
    const fallbackDescription = metadata.description || 'Professional IT training and certification courses';
    
    // Replace existing tags and add SEO
    fallbackHtml = fallbackHtml.replace(/<title>.*?<\/title>/i, `<title>${fallbackTitle}</title>`);
    fallbackHtml = fallbackHtml.replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${fallbackDescription}">`);
    
    const fallbackSeoTags = `<link rel="canonical" href="${ORIGIN}${route}">
<meta property="og:title" content="${fallbackTitle}">
<meta property="og:description" content="${fallbackDescription}">
<meta property="og:url" content="${ORIGIN}${route}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GRRAS Solutions Training Institute">
<meta property="og:image" content="https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fallbackTitle}">
<meta name="twitter:description" content="${fallbackDescription}">
<meta name="twitter:image" content="https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png">
${organizationJsonLd()}`;
    
    // Safe approach: Insert SEO tags carefully
    const headEndIndex = fallbackHtml.lastIndexOf('</head>');
    if (headEndIndex !== -1) {
      fallbackHtml = fallbackHtml.slice(0, headEndIndex) + fallbackSeoTags + '\n' + fallbackHtml.slice(headEndIndex);
    }
    
    const outDir = path.join(BUILD_DIR, route === '/' ? '' : route);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), fallbackHtml, 'utf8');
    sitemapUrls.push(route);
  }
});

// Enhanced sitemap.xml generation
const lastmod = new Date().toISOString().slice(0, 10);
const sitemapUrls_enhanced = sitemapUrls.map(route => {
  let priority = '0.8';
  let changefreq = 'weekly';
  
  if (route === '/') {
    priority = '1.0';
    changefreq = 'daily';
  } else if (route === '/courses') {
    priority = '0.9';
    changefreq = 'daily';
  } else if (route.startsWith('/courses/')) {
    priority = '0.8';
    changefreq = 'weekly';
  } else if (route.startsWith('/blog/')) {
    priority = '0.7';
    changefreq = 'monthly';
  }
  
  return `  <url>
    <loc>${ORIGIN}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls_enhanced.join('\n')}
</urlset>`;
fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap, 'utf8');

// robots.txt
fs.writeFileSync(
  path.join(BUILD_DIR, 'robots.txt'),
  `User-agent: *
Allow: /
Sitemap: ${ORIGIN}/sitemap.xml
`,
  'utf8'
);

console.log('🎉 Done prerendering without calling react-scripts build.');
console.log(`📄 Generated ${sitemapUrls.length} prerendered pages + sitemap.xml + robots.txt`);

// Debug: List all generated HTML files
console.log('\n---- built HTML routes ----');
const { execSync } = require('child_process');
try {
  const htmlFiles = execSync('find build -name index.html | sort', { encoding: 'utf8' });
  console.log(htmlFiles.trim());
} catch (error) {
  console.log('Could not list HTML files:', error.message);
}
console.log('---------------------------\n');