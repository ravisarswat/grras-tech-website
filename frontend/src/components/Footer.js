import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Youtube,
  MessageCircle,
  ExternalLink
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
  const emails = institute.emails || ['info@grrassolutions.com'];
  const social = institute.social || {};
  
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              {/* Logo and Company Name */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={instituteLogo} 
                    alt={instituteName}
                    className="h-16 w-16 object-contain bg-white p-2 rounded-lg"
                    onError={(e) => {
                      // If logo fails to load, show a placeholder
                      e.target.outerHTML = `<div class="h-16 w-16 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">G</div>`;
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{instituteName}</h3>
                    <p className="text-gray-300 text-sm">Training Institute</p>
                  </div>
                </div>
                
                {footerBranding.tagline && (
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {footerBranding.tagline}
                  </p>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                  <div className="text-gray-300 text-sm leading-relaxed">
                    <p className="font-medium text-white mb-1">Address:</p>
                    <address className="not-italic">
                      {address.split(',').map((line, index) => (
                        <span key={index} className="block">
                          {line.trim()}
                        </span>
                      ))}
                    </address>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {phones.map((phone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Phone:</p>
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-gray-300 hover:text-white transition-colors text-sm">
                          {phone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Email:</p>
                        <a href={`mailto:${email}`} className="text-gray-300 hover:text-white transition-colors text-sm">
                          {email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Footer Columns */}
            {footerColumns.map((column, index) => (
              <div key={column.id || index} className="lg:col-span-1">
                <h4 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-2">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.href.startsWith('http') ? (
                        <a
                          href={link.href}
                          target={link.target || '_blank'}
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.label}
                          </span>
                          {link.target === '_blank' && <ExternalLink className="h-3 w-3 opacity-70" />}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-gray-300 hover:text-white transition-colors text-sm group flex items-center"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Popular Courses */}
            {popularCourses.length > 0 && (
              <div className="lg:col-span-1">
                <h4 className="text-lg font-semibold text-white mb-6 border-b border-gray-700 pb-2">
                  Popular Courses
                </h4>
                <ul className="space-y-3">
                  {popularCourses.map((course) => (
                    <li key={course.slug}>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="text-gray-300 hover:text-white transition-colors text-sm block group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200 block">
                          {course.title || course.name}
                        </span>
                        {course.fees && (
                          <span className="text-xs text-gray-500 mt-1 block">
                            {course.fees}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm mb-2 md:mb-0">
                  {legalConfig.copyright}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-6">
                {/* Legal Links */}
                <div className="flex items-center gap-6">
                  {legalConfig.privacyPolicy && (
                    <Link
                      to={legalConfig.privacyPolicy}
                      className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                      Privacy Policy
                    </Link>
                  )}
                  {legalConfig.terms && (
                    <Link
                      to={legalConfig.terms}
                      className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                      Terms of Service
                    </Link>
                  )}
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {social.whatsapp && (
                    <a
                      href={social.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white rounded-full transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                  {social.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-pink-600 text-gray-400 hover:text-white rounded-full transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {social.youtube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-full transition-colors"
                      title="YouTube"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={social.whatsapp || "https://wa.me/919001991227?text=Hello! I'm interested in GRRAS courses."}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </>
  );
};

export default Footer;