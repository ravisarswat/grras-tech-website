// Footer Component - Optimized for Mobile Responsiveness
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Youtube,
  MessageCircle,
  ExternalLink,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Footer = () => {
  const { content } = useContent();
  const currentYear = new Date().getFullYear();

  // Get data from CMS
  const institute = content?.institute || {};
  const branding = content?.branding || {};
  const footer = content?.footer || {};
  
  // Institute information
  const instituteName = institute.name || 'GRRAS Solutions Training Institute';
  const instituteLogo = branding.logoUrl || 'https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png';
  const address = institute.address || 'A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012';
  const phones = institute.phones || ['090019 91227'];
  const emails = institute.emails || ['online@grras.com'];
  const social = institute.social || {
    facebook: 'https://www.facebook.com/grrassolutionss',
    instagram: 'https://www.instagram.com/grrassolutionss/',
    youtube: 'https://www.youtube.com/@grrassolutions',
    linkedin: 'https://www.linkedin.com/company/grrassolutions',
    twitter: 'https://twitter.com/grrassolutions'
  };
  
  // Footer configuration with fallbacks
  const footerColumns = footer.columns || [
    {
      title: 'Quick Links',
      links: [
        { label: 'About Us', href: '/about', target: '_self' },
        { label: 'Courses', href: '/courses', target: '_self' },
        { label: 'Admissions', href: '/admissions', target: '_self' },
        { label: 'Contact', href: '/contact', target: '_self' }
      ]
    }
  ];
  
  const popularCoursesConfig = footer.popularCourses || { source: 'auto', limit: 5 };
  const legalConfig = footer.legal || {
    copyright: `© ${currentYear} GRRAS Solutions Training Institute. All rights reserved.`,
    privacyPolicy: '/privacy-policy',
    terms: '/terms-of-service'
  };
  const footerBranding = footer.branding || { tagline: 'Empowering Futures Through Technology' };

  // Get popular courses based on configuration
  const getPopularCourses = () => {
    const allCourses = content?.courses || [];
    const visibleCourses = allCourses.filter(course => course.visible !== false);
    
    if (popularCoursesConfig.source === 'manual' && popularCoursesConfig.manualCourses?.length > 0) {
      return popularCoursesConfig.manualCourses
        .map(slug => visibleCourses.find(course => course.slug === slug))
        .filter(Boolean)
        .slice(0, popularCoursesConfig.limit || 5);
    }
    
    // Auto mode: top courses by order
    return visibleCourses
      .sort((a, b) => (a.order || 999) - (b.order || 999))
      .slice(0, popularCoursesConfig.limit || 5);
  };

  const popularCourses = getPopularCourses();

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Company Info - Optimized for Mobile */}
            <div className="md:col-span-2 lg:col-span-1">
              {/* Company Name Only - No Logo */}
              <div className="mb-6">
                <div className="mb-3">
                  <h3 className="text-xl lg:text-2xl font-bold text-white leading-tight">{instituteName}</h3>
                  <p className="text-gray-300 text-sm lg:text-base">Training Institute</p>
                </div>
                
                {footerBranding.tagline && (
                  <p className="text-gray-300 text-sm lg:text-base leading-relaxed mb-4 lg:mb-6">
                    {footerBranding.tagline}
                  </p>
                )}
              </div>

              {/* Contact Info - Mobile Optimized */}
              <div className="space-y-3 mb-6">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                      {address}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-red-500 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {phones.map((phone, index) => (
                      <a 
                        key={index}
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-red-500 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {emails.map((email, index) => (
                      <a 
                        key={index}
                        href={`mailto:${email}`}
                        className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors break-all"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media - Mobile Optimized */}
              <div className="flex gap-3">
                {social.facebook && (
                  <a 
                    href={social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {social.instagram && (
                  <a 
                    href={social.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-pink-600 p-2 rounded-lg transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {social.youtube && (
                  <a 
                    href={social.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-red-600 p-2 rounded-lg transition-colors"
                    aria-label="Subscribe to our YouTube channel"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {phones[0] && (
                  <a 
                    href={`https://wa.me/${phones[0].replace(/\D/g, '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-green-600 p-2 rounded-lg transition-colors"
                    aria-label="Chat on WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links - Mobile Optimized */}
            <div className="md:col-span-1 lg:col-span-1">
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                {footerColumns[0]?.links?.map((link, index) => (
                  <li key={index}>
                    {link.target === '_blank' ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link 
                        to={link.href}
                        className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Courses - Mobile Optimized */}
            <div className="md:col-span-2 lg:col-span-2">
              <h4 className="text-lg font-semibold mb-4 text-white">Popular Courses</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {popularCourses.map((course, index) => (
                  <Link 
                    key={index} 
                    to={`/courses/${course.slug}`}
                    className="bg-gray-800 rounded-lg p-3 lg:p-4 hover:bg-gray-700 transition-colors block group"
                  >
                    <h5 className="font-medium text-white text-sm lg:text-base mb-1 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {course.title}
                    </h5>
                    <div className="flex items-center justify-between">
                      <p className="text-red-400 font-semibold text-sm lg:text-base">
                        {course.price}
                        {course.hasEMI && (
                          <span className="text-gray-400 text-xs lg:text-sm ml-2">(EMI Available)</span>
                        )}
                      </p>
                      <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer - Mobile Optimized */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-xs lg:text-sm text-center sm:text-left">
                {legalConfig.copyright}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 lg:gap-6">
                <Link 
                  to={legalConfig.privacyPolicy}
                  className="text-gray-400 hover:text-white text-xs lg:text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to={legalConfig.terms}
                  className="text-gray-400 hover:text-white text-xs lg:text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;