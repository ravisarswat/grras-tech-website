const fs = require('fs');
const path = require('path');

// Import static data (we'll need to adjust for Node.js)
const coursesPath = path.join(__dirname, 'src/data/courses.js');
const blogPath = path.join(__dirname, 'src/data/blog.js');

// Function to safely import ES modules in Node.js context
const importStaticData = () => {
  try {
    // Read and parse courses data
    const coursesContent = fs.readFileSync(coursesPath, 'utf8');
    const coursesMatch = coursesContent.match(/export const courses = (\[[\s\S]*?\]);/);
    const courses = coursesMatch ? eval(coursesMatch[1]) : [];
    
    // Read and parse blog data  
    const blogContent = fs.readFileSync(blogPath, 'utf8');
    const blogMatch = blogContent.match(/const blogPosts = (\[[\s\S]*?\]);/);
    const blogPosts = blogMatch ? eval(blogMatch[1]) : [];
    
    return { courses, blogPosts };
  } catch (error) {
    console.error('Error importing static data:', error);
    return { courses: [], blogPosts: [] };
  }
};

const generateSitemap = () => {
  const siteUrl = 'https://www.grras.tech';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const { courses, blogPosts } = importStaticData();
  
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
  
  console.log(`Generating sitemap with ${allPages.length} URLs...`);
  console.log(`- Static pages: ${staticPages.length}`);
  console.log(`- Course pages: ${coursePages.length}`);
  console.log(`- Blog pages: ${blogPages.length}`);
  
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
  
  // Write sitemap to public directory
  const outputPath = path.join(__dirname, 'public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml);
  
  console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
  console.log(`📄 Total URLs: ${allPages.length}`);
  
  return sitemapXml;
};

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = generateSitemap;