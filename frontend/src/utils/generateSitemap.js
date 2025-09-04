import { courses } from '../data/courses';
import blogPosts from '../data/blog';

const generateSitemap = () => {
  const siteUrl = 'https://www.grras.tech';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/courses', priority: '0.9', changefreq: 'weekly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/placements', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' },
    { url: '/admissions', priority: '0.7', changefreq: 'monthly' }
  ];
  
  // Dynamic course pages
  const coursePages = courses
    .filter(course => course.visible !== false && course.slug)
    .map(course => ({
      url: `/courses/${course.slug}`,
      priority: '0.8',
      changefreq: 'weekly'
    }));
  
  // Dynamic blog pages
  const blogPages = blogPosts
    .filter(post => post.slug)
    .map(post => ({
      url: `/blog/${post.slug}`,
      priority: '0.6',
      changefreq: 'monthly'
    }));
  
  // Combine all pages
  const allPages = [...staticPages, ...coursePages, ...blogPages];
  
  // Generate XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemapXml;
};

export default generateSitemap;