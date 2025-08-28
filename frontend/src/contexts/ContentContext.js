import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/content`);
      setContent(response.data.content);
      setError(null);
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Failed to load content');
      
      // Fallback to default content structure
      setContent({
        branding: {
          logoUrl: "https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png",
          colors: {
            primary: "#DC2626",
            secondary: "#EA580C",
            accent: "#16A34A"
          }
        },
        institute: {
          name: "GRRAS Solutions Training Institute",
          address: "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012",
          phone: "090019 91227",
          email: "info@grrassolutions.com",
          social: {
            whatsapp: "https://wa.me/919001991227",
            instagram: "#",
            youtube: "#"
          }
        },
        home: {
          heroHeadline: "Empowering Students with World-Class IT & Cloud Education",
          heroSubtext: "From Degree Programs to Cutting-Edge Certifications",
          ctaPrimaryLabel: "Explore Courses",
          ctaPrimaryHref: "/courses",
          ctaSecondaryLabel: "Apply Now",
          ctaSecondaryHref: "/admissions"
        },
        about: {
          headline: "About GRRAS Solutions",
          mission: "To provide world-class IT education and training that bridges the gap between academic learning and industry requirements.",
          vision: "To be the leading IT training institute in India, recognized for excellence in education.",
          body: "GRRAS Solutions Training Institute has been empowering students with world-class IT education since 2014."
        },
        courses: [],
        faqs: [],
        testimonials: [],
        settings: {
          seoTitle: "GRRAS Solutions Training Institute - IT & Cloud Education in Jaipur",
          seoDescription: "Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications with placement assistance.",
          seoKeywords: "IT training Jaipur, BCA degree, DevOps training, Red Hat certification"
        }
      });
    } finally {
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