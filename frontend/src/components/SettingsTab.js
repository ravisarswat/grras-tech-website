import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import MultiInputField from './MultiInputField';

const SettingsTab = ({ content, updateContent, getContentValue }) => {
  const [showMapPreview, setShowMapPreview] = useState(false);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const isValidPhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/;
    return phoneRegex.test(phone);
  };

  // URL validation function
  const isValidUrl = (url) => {
    if (!url) return true; // Allow empty
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const googleMapUrl = getContentValue('institute.googleMapUrl') || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Institute Settings</h2>
        <div className="text-sm text-gray-500">
          Changes will be saved as draft until published
        </div>
      </div>
      
      {/* Basic Institute Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Institute Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institute Name *
            </label>
            <input
              type="text"
              value={getContentValue('institute.name') || ''}
              onChange={(e) => updateContent('institute.name', e.target.value)}
              className="form-input"
              placeholder="GRRAS Solutions Training Institute"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Name
            </label>
            <input
              type="text"
              value={getContentValue('institute.shortName') || ''}
              onChange={(e) => updateContent('institute.shortName', e.target.value)}
              className="form-input"
              placeholder="GRRAS Solutions"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={getContentValue('institute.tagline') || ''}
              onChange={(e) => updateContent('institute.tagline', e.target.value)}
              className="form-input"
              placeholder="Empowering Futures Through Technology"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={getContentValue('institute.address') || ''}
              onChange={(e) => updateContent('institute.address', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={getContentValue('institute.website') || ''}
              onChange={(e) => updateContent('institute.website', e.target.value)}
              className="form-input"
              placeholder="https://www.grras.tech"
            />
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <MultiInputField
            label="Phone Numbers"
            values={getContentValue('institute.phones') || []}
            onChange={(values) => updateContent('institute.phones', values)}
            placeholder="Phone number"
            type="tel"
            validation={isValidPhone}
            maxItems={5}
          />
          
          <MultiInputField
            label="Email Addresses"
            values={getContentValue('institute.emails') || []}
            onChange={(values) => updateContent('institute.emails', values)}
            placeholder="Email address"
            type="email"
            validation={isValidEmail}
            maxItems={5}
          />
        </div>
      </div>
      
      {/* Google Maps Integration */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Maps</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Map Embed URL
            </label>
            <input
              type="url"
              value={googleMapUrl}
              onChange={(e) => updateContent('institute.googleMapUrl', e.target.value)}
              className="form-input"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Go to Google Maps → Share → Embed → Copy the src URL from the iframe code
            </p>
          </div>
          
          {googleMapUrl && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowMapPreview(!showMapPreview)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showMapPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showMapPreview ? 'Hide' : 'Show'} Map Preview
                </button>
                <a
                  href={googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  Test Link
                </a>
              </div>
              
              {showMapPreview && (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={googleMapUrl}
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  ></iframe>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Social Media Links */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp URL
            </label>
            <input
              type="url"
              value={getContentValue('institute.social.whatsapp') || ''}
              onChange={(e) => updateContent('institute.social.whatsapp', e.target.value)}
              className={`form-input ${!isValidUrl(getContentValue('institute.social.whatsapp')) ? 'border-red-300' : ''}`}
              placeholder="https://wa.me/919001991227"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram URL
            </label>
            <input
              type="url"
              value={getContentValue('institute.social.instagram') || ''}
              onChange={(e) => updateContent('institute.social.instagram', e.target.value)}
              className={`form-input ${!isValidUrl(getContentValue('institute.social.instagram')) ? 'border-red-300' : ''}`}
              placeholder="https://instagram.com/grrassolutions"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={getContentValue('institute.social.youtube') || ''}
              onChange={(e) => updateContent('institute.social.youtube', e.target.value)}
              className={`form-input ${!isValidUrl(getContentValue('institute.social.youtube')) ? 'border-red-300' : ''}`}
              placeholder="https://youtube.com/@grrassolutions"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={getContentValue('institute.social.linkedin') || ''}
              onChange={(e) => updateContent('institute.social.linkedin', e.target.value)}
              className={`form-input ${!isValidUrl(getContentValue('institute.social.linkedin')) ? 'border-red-300' : ''}`}
              placeholder="https://linkedin.com/company/grrassolutions"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook URL
            </label>
            <input
              type="url"
              value={getContentValue('institute.social.facebook') || ''}
              onChange={(e) => updateContent('institute.social.facebook', e.target.value)}
              className={`form-input ${!isValidUrl(getContentValue('institute.social.facebook')) ? 'border-red-300' : ''}`}
              placeholder="https://facebook.com/grrassolutions"
            />
          </div>
        </div>
      </div>
      
      {/* Institute Statistics */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Institute Statistics</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Excellence
            </label>
            <input
              type="text"
              value={getContentValue('institute.stats.yearsOfExcellence') || ''}
              onChange={(e) => updateContent('institute.stats.yearsOfExcellence', e.target.value)}
              className="form-input"
              placeholder="18+"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Students Trained
            </label>
            <input
              type="text"
              value={getContentValue('institute.stats.studentsTrained') || ''}
              onChange={(e) => updateContent('institute.stats.studentsTrained', e.target.value)}
              className="form-input"
              placeholder="5000+"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placement Rate
            </label>
            <input
              type="text"
              value={getContentValue('institute.stats.placementRate') || ''}
              onChange={(e) => updateContent('institute.stats.placementRate', e.target.value)}
              className="form-input"
              placeholder="95%"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hiring Partners
            </label>
            <input
              type="text"
              value={getContentValue('institute.stats.hiringPartners') || ''}
              onChange={(e) => updateContent('institute.stats.hiringPartners', e.target.value)}
              className="form-input"
              placeholder="100+"
            />
          </div>
        </div>
      </div>
      
      {/* Branding Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={getContentValue('branding.logoUrl') || ''}
              onChange={(e) => updateContent('branding.logoUrl', e.target.value)}
              className="form-input"
              placeholder="https://example.com/logo.png"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getContentValue('branding.colors.primary') || '#DC2626'}
                  onChange={(e) => updateContent('branding.colors.primary', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={getContentValue('branding.colors.primary') || ''}
                  onChange={(e) => updateContent('branding.colors.primary', e.target.value)}
                  className="form-input flex-1"
                  placeholder="#DC2626"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getContentValue('branding.colors.secondary') || '#EA580C'}
                  onChange={(e) => updateContent('branding.colors.secondary', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={getContentValue('branding.colors.secondary') || ''}
                  onChange={(e) => updateContent('branding.colors.secondary', e.target.value)}
                  className="form-input flex-1"
                  placeholder="#EA580C"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* SEO Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              value={getContentValue('pages.home.seo.title') || ''}
              onChange={(e) => updateContent('pages.home.seo.title', e.target.value)}
              className="form-input"
              placeholder="GRRAS Solutions Training Institute - IT & Cloud Education in Jaipur"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Description
            </label>
            <textarea
              value={getContentValue('pages.home.seo.description') || ''}
              onChange={(e) => updateContent('pages.home.seo.description', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications with placement assistance."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Keywords
            </label>
            <input
              type="text"
              value={getContentValue('pages.home.seo.keywords') || ''}
              onChange={(e) => updateContent('pages.home.seo.keywords', e.target.value)}
              className="form-input"
              placeholder="IT training Jaipur, BCA degree, DevOps training, Red Hat certification"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;