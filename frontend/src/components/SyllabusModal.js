import React, { useState } from 'react';
import { X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SyllabusModal = ({ isOpen, onClose, courseSlug, courseName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.consent) {
      newErrors.consent = 'You must agree to be contacted';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        course_slug: courseSlug,
        consent: formData.consent
      };
      
      const response = await axios.post(`${API}/syllabus`, requestData, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create one
      const contentDisposition = response.headers['content-disposition'];
      let filename = `GRRAS_${courseName.replace(/\s+/g, '_')}_Syllabus.pdf`;
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Success feedback
      toast.success('Syllabus sent! Your PDF is downloading.', {
        description: 'Check your downloads folder for the syllabus PDF.',
        icon: <CheckCircle className="h-5 w-5" />
      });
      
      // Reset form and close modal
      setFormData({ name: '', email: '', phone: '', consent: false });
      onClose();
      
    } catch (error) {
      console.error('Error downloading syllabus:', error);
      
      let errorMessage = 'Failed to generate syllabus. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Please check your information and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Course not found. Please contact support.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error('Download Failed', {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Download Syllabus
              </h3>
              <p className="text-gray-600">
                {courseName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`form-input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter 10-digit phone number"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className={`mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded ${
                    errors.consent ? 'border-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">
                  I agree to be contacted by GRRAS about courses (see{' '}
                  <a href="/privacy" className="text-red-600 hover:underline">
                    Privacy Policy
                  </a>
                  ).
                </span>
              </label>
              {errors.consent && (
                <p className="text-red-500 text-sm mt-1">{errors.consent}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner w-4 h-4 border-2"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Download Syllabus (PDF)</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            * Required fields. Your information is secure and used only for course counseling.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SyllabusModal;