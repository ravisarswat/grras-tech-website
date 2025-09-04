import React from 'react';
import { Helmet } from 'react-helmet-async';

const EnhancedSEO = ({
  title = "GRRAS Solutions Training Institute | IT & Cloud Education",
  description = "GRRAS Solutions Training Institute - Empowering Students with World-Class IT & Cloud Education. Expert training in DevOps, AWS, Azure, Red Hat, Python, Data Science & more.",
  canonical,
  image = "https://www.grras.tech/static/media/grras-logo.png",
  type = "website",
  structuredData,
  noindex = false,
  course,
  category
}) => {
  const siteUrl = "https://www.grras.tech";
  const canonicalUrl = canonical || `${siteUrl}${window.location.pathname}`;
  
  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "GRRAS Solutions Training Institute",
    "alternateName": "GRRAS",
    "url": siteUrl,
    "logo": `${siteUrl}/static/media/grras-logo.png`,
    "description": "GRRAS Solutions Training Institute - Empowering Students with World-Class IT & Cloud Education",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "23, Agarwal Farm, Mansarovar",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302020",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8829-25-2525",
      "contactType": "customer service",
      "email": "online@grras.com"
    },
    "sameAs": [
      "https://www.facebook.com/grras.solutions",
      "https://www.instagram.com/grras_solutions/",
      "https://www.youtube.com/@GRRASSolutions",
      "https://wa.me/918829252525"
    ]
  };

  // Course structured data
  const courseSchema = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "GRRAS Solutions Training Institute",
      "url": siteUrl
    },
    "educationalLevel": course.level || "Professional",
    "courseMode": course.mode || "Classroom, Online, Hybrid",
    "duration": course.duration,
    "offers": {
      "@type": "Offer",
      "price": course.price?.replace(/[₹,]/g, '') || "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    },
    "url": `${siteUrl}/courses/${course.slug}`,
    "image": image,
    "teaches": course.learningOutcomes || [],
    "occupationalCredentialAwarded": course.certificationIncluded ? "Certificate" : undefined
  } : null;

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      }
    ]
  };

  // Add breadcrumb items based on current page
  if (window.location.pathname.includes('/courses/')) {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": "Courses",
      "item": `${siteUrl}/courses`
    });
    if (course) {
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": course.title,
        "item": `${siteUrl}/courses/${course.slug}`
      });
    }
  } else if (window.location.pathname.includes('/courses')) {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": "Courses",
      "item": `${siteUrl}/courses`
    });
  } else if (window.location.pathname.includes('/blog')) {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": `${siteUrl}/blog`
    });
  } else if (window.location.pathname !== '/') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    pathSegments.forEach((segment, index) => {
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": segment.charAt(0).toUpperCase() + segment.slice(1),
        "item": `${siteUrl}/${pathSegments.slice(0, index + 1).join('/')}`
      });
    });
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="GRRAS Solutions Training Institute" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#DC2626" />
      <meta name="author" content="GRRAS Solutions Training Institute" />
      <meta name="publisher" content="GRRAS Solutions Training Institute" />
      
      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {courseSchema && (
        <script type="application/ld+json">
          {JSON.stringify(courseSchema)}
        </script>
      )}
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      
      {/* Custom structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default EnhancedSEO;