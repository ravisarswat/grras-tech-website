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
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src={instituteLogo} 
                alt={instituteName}
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{instituteName}</h3>
            {footerBranding.tagline && (
              <p className="text-gray-300 text-sm mb-4">{footerBranding.tagline}</p>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                <span>{address}</span>
              </div>
              
              {phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4 text-red-400" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {phone}
                  </a>
                </div>
              ))}
              
              {emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="h-4 w-4 text-red-400" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {footerColumns.map((column, index) => (
            <div key={column.id || index}>
              <h4 className="text-lg font-semibold text-white mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target={link.target || '_blank'}
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1"
                      >
                        {link.label}
                        {link.target === '_blank' && <ExternalLink className="h-3 w-3" />}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Popular Courses */}
          {popularCourses.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Popular Courses</h4>
              <ul className="space-y-3">
                {popularCourses.map((course) => (
                  <li key={course.slug}>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="text-gray-300 hover:text-white transition-colors text-sm block"
                    >
                      {course.title || course.name}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                {legalConfig.copyright}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-4 text-sm">
              {/* Legal Links */}
              <div className="flex items-center gap-4">
                {legalConfig.privacyPolicy && (
                  <Link
                    to={legalConfig.privacyPolicy}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                )}
                {legalConfig.terms && (
                  <Link
                    to={legalConfig.terms}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                )}
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {social.whatsapp && (
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-400 transition-colors"
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
  );
};

export default Footer;
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={instituteLogo}
                alt={instituteName}
                className="h-12 sm:h-14 w-auto hover:scale-105 transition-transform"
              />
              <div>
                <h3 className="text-base sm:text-lg font-bold">{institute.shortName || instituteName}</h3>
                <p className="text-xs sm:text-sm text-gray-300">Training Institute</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed">
              {institute.tagline || 'Empowering Futures Through Technology'}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <address className="text-gray-300 not-italic">
                  {address.split(',').map((line, index) => (
                    <span key={index} className="block">
                      {line.trim()}
                    </span>
                  ))}
                </address>
              </div>
              
              {phones.length > 0 && (
                <div className="space-y-1">
                  {phones.map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        {phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {emails.length > 0 && (
                <div className="space-y-1">
                  {emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${email}`}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        {email}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {website && (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {social.whatsapp && social.whatsapp !== '#' && (
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
              {social.instagram && social.instagram !== '#' && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.youtube && social.youtube !== '#' && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Courses</h3>
            <ul className="space-y-2">
              {courses.map((course) => (
                <li key={course.name}>
                  <Link
                    to={course.path}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                  >
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  A-81, Singh Bhoomi Khatipura Rd,<br />
                  behind Marudhar Hospital,<br />
                  Jaipur, Rajasthan 302012
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-400" />
                <a
                  href="tel:+919001991227"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  090019 91227
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-400" />
                <a
                  href="mailto:info@grrassolutions.com"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  info@grrassolutions.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} GRRAS Solutions Training Institute. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919001991227?text=Hello! I'm interested in GRRAS courses."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </footer>
  );
};

export default Footer;