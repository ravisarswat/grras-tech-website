import { useEffect } from 'react';

const SEO = ({ 
  title = "GRRAS Solutions Training Institute - IT & Cloud Education in Jaipur",
  description = "Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications, Data Science, Python, Java & Salesforce courses with placement assistance.",
  keywords = "IT training Jaipur, BCA degree, DevOps training, Red Hat certification, Data Science course, Python training, Java Salesforce, computer courses Jaipur",
  image = "https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png",
  url = window.location.href,
  type = "website"
}) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set meta tags
    const setMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', 'GRRAS Solutions Training Institute');
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph meta tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', 'GRRAS Solutions Training Institute', true);
    setMetaTag('og:locale', 'en_IN', true);

    // Twitter Card meta tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    // Additional SEO meta tags
    setMetaTag('robots', 'index, follow');
    setMetaTag('googlebot', 'index, follow');
    setMetaTag('language', 'English');
    setMetaTag('geo.region', 'IN-RJ');
    setMetaTag('geo.placename', 'Jaipur');
    setMetaTag('geo.position', '26.9124;75.7873');
    setMetaTag('ICBM', '26.9124, 75.7873');

    // Structured Data for Organization
    const addStructuredData = () => {
      const existingScript = document.getElementById('structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      
      const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.grras.tech/#organization",
            "name": "GRRAS Solutions Training Institute",
            "url": "https://www.grras.tech",
            "logo": {
              "@type": "ImageObject",
              "url": image
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9001991227",
              "contactType": "Admissions"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital",
              "addressLocality": "Jaipur",
              "addressRegion": "Rajasthan",
              "postalCode": "302012",
              "addressCountry": "IN"
            },
            "sameAs": [
              "https://www.instagram.com/grrassolutions",
              "https://www.youtube.com/@grrassolutions"
            ]
          },
          {
            "@type": "EducationalOrganization",
            "@id": "https://www.grras.tech/#educational-organization",
            "name": "GRRAS Solutions Training Institute",
            "description": description,
            "url": url,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital",
              "addressLocality": "Jaipur",
              "addressRegion": "Rajasthan",
              "postalCode": "302012",
              "addressCountry": "IN"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9001991227",
              "contactType": "Admissions"
            }
          }
        ]
      };

      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);
    };

    addStructuredData();

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Set alternate language links
    let alternateLang = document.querySelector('link[rel="alternate"][hreflang="hi"]');
    if (!alternateLang) {
      alternateLang = document.createElement('link');
      alternateLang.rel = 'alternate';
      alternateLang.hreflang = 'hi';
      alternateLang.href = url;
      document.head.appendChild(alternateLang);
    }

  }, [title, description, keywords, image, url, type]);

  return null;
};

// Course-specific SEO component
export const CoursePageSEO = ({ course, tools = [] }) => {
  const courseStructuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": `Comprehensive ${course.name} training at GRRAS Solutions. Learn ${tools.join(', ')} and more.`,
    "provider": {
      "@type": "Organization",
      "name": "GRRAS Solutions Training Institute",
      "url": "https://grrassolutions.com"
    },
    "courseMode": ["Classroom", "Online"],
    "availableLanguage": ["English", "Hindi"],
    "teaches": tools,
    "locationCreated": {
      "@type": "Place",
      "name": "Jaipur, Rajasthan, India"
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(courseStructuredData);
    script.id = 'course-structured-data';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('course-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [course]);

  return (
    <SEO
      title={`${course.name} Training in Jaipur - GRRAS Solutions`}
      description={`Learn ${course.name} at GRRAS Solutions Jaipur. Master ${tools.slice(0, 3).join(', ')} and more. Industry-oriented training with placement assistance.`}
      keywords={`${course.name}, ${tools.join(', ')}, training Jaipur, certification course`}
    />
  );
};

// Blog post SEO component
export const BlogPostSEO = ({ post }) => {
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Organization",
      "name": "GRRAS Solutions Training Institute"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GRRAS Solutions Training Institute",
      "logo": {
        "@type": "ImageObject",
        "url": "https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png"
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(blogStructuredData);
    script.id = 'blog-structured-data';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('blog-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [post]);

  return (
    <SEO
      title={`${post.title} - GRRAS Solutions Blog`}
      description={post.excerpt}
      keywords={post.tags?.join(', ') || ''}
      type="article"
    />
  );
};

export default SEO;