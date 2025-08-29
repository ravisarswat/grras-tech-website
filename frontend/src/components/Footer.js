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

  // Get institute data from CMS
  const institute = content?.institute || {};
  const branding = content?.branding || {};
  const instituteName = institute.name || 'GRRAS Solutions Training Institute';
  const instituteLogo = branding.logoUrl || 'https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png';
  const address = institute.address || 'A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012';
  const phones = institute.phones || ['090019 91227'];
  const emails = institute.emails || ['info@grrassolutions.com'];
  const social = institute.social || {};
  const website = institute.website || '';

  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact', path: '/contact' }
  ];

  // Get featured courses from CMS
  const courses = (content?.courses || [])
    .filter(course => course.visible !== false && course.featured)
    .slice(0, 6)
    .map(course => ({
      name: course.title,
      path: `/courses/${course.slug}`
    }));

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
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