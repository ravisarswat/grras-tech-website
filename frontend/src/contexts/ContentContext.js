import React, { createContext, useContext, useState, useEffect } from 'react';

// Static Data Imports
import { categories } from '../data/categories';
import { courses } from '../data/courses';
import blogPosts from '../data/blog';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStaticContent = () => {
    try {
      setLoading(true);
      
      // Create content structure similar to backend API
      const staticContent = {
        courseCategories: categories,
        courses: courses,
        blog: {
          posts: blogPosts
        },
        institute: {
          name: "GRRAS Solutions Training Institute",
          tagline: "Empowering Students with World-Class IT & Cloud Education",
          address: "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012",
          phones: ["090019 91227"],
          emails: ["info@grrassolutions.com"],
          social: {
            whatsapp: "https://wa.me/919001991227"
          },
          stats: {
            yearsOfExcellence: "18+"
          }
        },
        pages: {
          home: {
            hero: {
              title: "Transform Your Career with Industry-Ready IT Skills",
              subtitle: "Join 5000+ successful graduates who landed dream jobs with our comprehensive training programs"
            },
            popularCourses: {
              enabled: true,
              limit: 6
            }
          }
        },
        branding: {
          primaryColor: "#DC2626",
          logoUrl: "/logo.png"
        }
      };
      
      setContent(staticContent);
      setLoading(false);
      setError(null);
      
    } catch (err) {
      console.error('Error loading static content:', err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const refreshContent = () => {
    loadContent();
  };

  const getCourses = () => {
    if (!content?.courses) return [];
    return content.courses
      .filter(course => course.visible !== false)
      .sort((a, b) => (a.order || 999) - (b.order || 999));
  };

  const getCourseBySlug = (slug) => {
    if (!content?.courses) return null;
    return content.courses.find(course => course.slug === slug && course.visible !== false);
  };

  const getFeaturedCourses = (limit = 4) => {
    return getCourses().slice(0, limit);
  };

  const getTestimonials = () => {
    if (!content?.testimonials) return [];
    return content.testimonials.sort((a, b) => (a.order || 999) - (b.order || 999));
  };

  const getFeaturedTestimonials = () => {
    return getTestimonials().filter(testimonial => testimonial.featured);
  };

  const getFAQs = () => {
    if (!content?.faqs) return [];
    return content.faqs.sort((a, b) => (a.order || 999) - (b.order || 999));
  };

  const getFAQsByCategory = (category) => {
    return getFAQs().filter(faq => faq.category === category);
  };

  const value = {
    content,
    loading,
    error,
    refreshContent,
    getCourses,
    getCourseBySlug,
    getFeaturedCourses,
    getTestimonials,
    getFeaturedTestimonials,
    getFAQs,
    getFAQsByCategory
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;