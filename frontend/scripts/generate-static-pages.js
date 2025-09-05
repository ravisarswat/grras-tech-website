const fs = require('fs');
const path = require('path');

// Import static data
const coursesPath = path.join(__dirname, '../src/data/courses.js');
const blogPath = path.join(__dirname, '../src/data/blog.js');

const importStaticData = () => {
  try {
    const coursesContent = fs.readFileSync(coursesPath, 'utf8');
    const coursesMatch = coursesContent.match(/export const courses = (\[[\s\S]*?\]);/);
    const courses = coursesMatch ? eval(coursesMatch[1]) : [];
    
    const blogContent = fs.readFileSync(blogPath, 'utf8');
    const blogMatch = blogContent.match(/const blogPosts = (\[[\s\S]*?\]);/);
    const blogPosts = blogMatch ? eval(blogMatch[1]) : [];
    
    return { courses, blogPosts };
  } catch (error) {
    console.error('Error importing static data:', error);
    return { courses: [], blogPosts: [] };
  }
};

const generateStaticHTML = () => {
  const buildDir = path.join(__dirname, '../build');
  const templatePath = path.join(buildDir, 'index.html');
  
  if (!fs.existsSync(templatePath)) {
    console.error('Build directory not found. Run npm run build first.');
    return;
  }
  
  const template = fs.readFileSync(templatePath, 'utf8');
  const { courses, blogPosts } = importStaticData();
  
  // Generate static pages
  const pages = [
    {
      path: '',
      title: 'GRRAS Solutions Training Institute | IT & Cloud Education',
      description: 'GRRAS Solutions Training Institute - Empowering Students with World-Class IT & Cloud Education. Expert training in DevOps, AWS, Azure, Red Hat, Python, Data Science & more.',
      content: `
        <h1>GRRAS Solutions Training Institute</h1>
        <p>Empowering Students with World-Class IT & Cloud Education</p>
        <section>
          <h2>Our Training Programs</h2>
          <ul>
            <li>DevOps & Cloud Computing</li>
            <li>AWS & Azure Certifications</li>
            <li>Red Hat Enterprise Linux</li>
            <li>Python & Data Science</li>
            <li>Cybersecurity</li>
            <li>Full Stack Development</li>
          </ul>
        </section>
      `
    },
    {
      path: 'courses',
      title: 'Courses - GRRAS Solutions Training Institute',
      description: 'Browse our comprehensive course catalog - DevOps, AWS, Azure, Red Hat, Python, Data Science, Cybersecurity and more professional IT training courses',
      content: `
        <h1>Our Training Courses</h1>
        <p>Comprehensive IT training programs designed for career growth</p>
        <section>
          <h2>Available Courses (${courses.length} courses)</h2>
          <div class="courses-list">
            ${courses.slice(0, 10).map(course => `
              <article>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p><strong>Duration:</strong> ${course.duration}</p>
                <p><strong>Level:</strong> ${course.level}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `
    },
    {
      path: 'blog',
      title: 'Blog - Latest Tech Insights & Career Guidance | GRRAS Solutions',
      description: 'Stay updated with latest technology trends, career guidance, course updates, and success stories from GRRAS Solutions Training Institute.',
      content: `
        <h1>GRRAS Blog</h1>
        <p>Latest insights on technology trends and career guidance</p>
        <section>
          <h2>Recent Posts (${blogPosts.length} articles)</h2>
          <div class="blog-posts">
            ${blogPosts.slice(0, 5).map(post => `
              <article>
                <h3><a href="/blog/${post.slug}">${post.title}</a></h3>
                <p>${post.excerpt}</p>
                <p><strong>Category:</strong> ${post.category}</p>
                <p><strong>Read Time:</strong> ${post.readTime}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `
    }
  ];
  
  // Generate course detail pages
  courses.slice(0, 10).forEach(course => {
    pages.push({
      path: `courses/${course.slug}`,
      title: `${course.title} | GRRAS Solutions Training Institute`,
      description: course.description,
      content: `
        <h1>${course.title}</h1>
        <p>${course.description}</p>
        <section>
          <h2>Course Details</h2>
          <p><strong>Duration:</strong> ${course.duration}</p>
          <p><strong>Level:</strong> ${course.level}</p>
          <p><strong>Mode:</strong> ${course.mode}</p>
          ${course.learningOutcomes ? `
            <h3>What You'll Learn</h3>
            <ul>
              ${course.learningOutcomes.map(outcome => `<li>${outcome}</li>`).join('')}
            </ul>
          ` : ''}
        </section>
      `
    });
  });
  
  // Generate blog post pages
  blogPosts.slice(0, 5).forEach(post => {
    pages.push({
      path: `blog/${post.slug}`,
      title: `${post.title} | GRRAS Solutions Blog`,
      description: post.excerpt,
      content: `
        <article>
          <h1>${post.title}</h1>
          <p class="excerpt">${post.excerpt}</p>
          <div class="meta">
            <p><strong>Author:</strong> ${post.author}</p>
            <p><strong>Category:</strong> ${post.category}</p>
            <p><strong>Read Time:</strong> ${post.readTime}</p>
          </div>
          <div class="content">
            ${post.content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
        </article>
      `
    });
  });
  
  // Create directory structure and files
  pages.forEach(page => {
    const pagePath = page.path;
    const dirPath = pagePath ? path.join(buildDir, pagePath) : buildDir;
    const filePath = path.join(dirPath, 'index.html');
    
    // Create directory if it doesn't exist
    if (pagePath && !fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Replace template content
    let html = template;
    
    // Update title
    html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);
    
    // Update meta description
    html = html.replace(
      /<meta name="description" content=".*?"/, 
      `<meta name="description" content="${page.description}"`
    );
    
    // Add structured data for courses and blog posts
    let structuredData = '';
    if (pagePath.includes('courses/')) {
      const course = courses.find(c => c.slug === pagePath.replace('courses/', ''));
      if (course) {
        structuredData = `
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "${course.title}",
          "description": "${course.description}",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "GRRAS Solutions Training Institute"
          }
        }
        </script>`;
      }
    }
    
    // Inject content into noscript tag and add hidden content for crawlers
    html = html.replace(
      /<div id="root"><\/div>/,
      `<div id="root"></div>
      <div id="static-content" style="display: none;">
        ${page.content}
      </div>
      ${structuredData}`
    );
    
    // Enhanced noscript content
    html = html.replace(
      /<noscript>[\s\S]*?<\/noscript>/,
      `<noscript>
        <div style="text-align: center; padding: 2rem; font-family: Arial, sans-serif;">
          ${page.content}
          <p>For the best experience, please enable JavaScript in your browser.</p>
          <p>Contact us at <a href="mailto:online@grras.com">online@grras.com</a> or call +91-8829-25-2525</p>
        </div>
      </noscript>`
    );
    
    // Write the file
    fs.writeFileSync(filePath, html);
    console.log(`✅ Generated: ${pagePath || 'home'} -> ${filePath}`);
  });
  
  console.log(`\n🎉 Generated ${pages.length} static pages with SEO content!`);
  
  return pages.length;
};

// Run if called directly
if (require.main === module) {
  generateStaticHTML();
}

module.exports = generateStaticHTML;