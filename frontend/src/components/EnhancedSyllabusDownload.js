import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, User, Mail, Phone, Briefcase, GraduationCap, X } from 'lucide-react';
import RHCSASyllabusPDF from './RHCSASyllabusPDF';

const EnhancedSyllabusDownload = ({ courseSlug, courseName, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    experience: '',
    preferredMode: 'hybrid'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateAndDownloadPDF = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    
    try {
      // Generate PDF
      const blob = await pdf(<RHCSASyllabusPDF />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GRRAS_RHCSA_Certification_Syllabus.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Save lead data (you can integrate with your backend here)
      await saveLead();
      
      // Show success message
      alert('✅ PDF downloaded successfully! Check your downloads folder.');
      
      // Close modal
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLead = async () => {
    try {
      // You can integrate with your backend API here
      const leadData = {
        ...formData,
        course: 'RHCSA',
        courseSlug: 'rhcsa',
        type: 'syllabus_download',
        timestamp: new Date().toISOString()
      };
      
      console.log('Lead data saved:', leadData);
      
      // Example API call (uncomment when backend is ready):
      /*
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });
      */
      
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Download RHCSA Syllabus</h2>
              <p className="text-red-100">Get detailed course information and career roadmap</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">RHCSA Certification</h3>
                <p className="text-sm text-gray-600">Red Hat Certified System Administrator</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                🏆 <strong>Best Red Hat Partner Since 2007</strong> - Get industry-recognized certification with 95% placement success rate!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="your.email@company.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+91 90019 91227"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Current Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Current Role
              </label>
              <select
                name="currentRole"
                value={formData.currentRole}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value="">Select your current role</option>
                <option value="student">Student</option>
                <option value="fresher">Fresher</option>
                <option value="working_professional">Working Professional</option>
                <option value="career_changer">Career Changer</option>
              </select>
            </div>

            {/* Experience Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              >
                <option value="">Select experience level</option>
                <option value="no_experience">No Experience</option>
                <option value="0_1_year">0-1 Year</option>
                <option value="1_3_years">1-3 Years</option>
                <option value="3_5_years">3-5 Years</option>
                <option value="5_plus_years">5+ Years</option>
              </select>
            </div>

            {/* Preferred Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Learning Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preferredMode"
                    value="online"
                    checked={formData.preferredMode === 'online'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Online</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preferredMode"
                    value="offline"
                    checked={formData.preferredMode === 'offline'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Offline</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preferredMode"
                    value="hybrid"
                    checked={formData.preferredMode === 'hybrid'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Hybrid</span>
                </label>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">What you'll get:</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Detailed 4-page professional syllabus</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Career roadmap and salary expectations</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Free career counseling session</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Exclusive admission discounts</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={generateAndDownloadPDF}
            disabled={isGenerating}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6 rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Professional Syllabus PDF
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By downloading, you agree to receive course updates and career guidance from GRRAS Solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSyllabusDownload;