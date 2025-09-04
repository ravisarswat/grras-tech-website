import React, { useState } from 'react';
import { Download, User, Mail, Phone, Briefcase, GraduationCap, X } from 'lucide-react';

const StaticSyllabusDownload = ({ courseSlug, courseName, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    experience: '',
    preferredMode: 'hybrid'
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState({});

  // Static PDF mapping for different courses
  const pdfMapping = {
    'rhcsa-red-hat-certified-system-administrator': {
      fileName: 'GRRAS_RHCSA_Certification_Syllabus.pdf',
      courseName: 'RHCSA Certification',
      description: 'Red Hat Certified System Administrator',
      icon: '🐧'
    },
    'devops-training': {
      fileName: 'GRRAS_DevOps_Engineering_Syllabus.pdf', 
      courseName: 'DevOps Training',
      description: 'Complete DevOps Engineering Program',
      icon: '🚀'
    },
    'aws-cloud-platform': {
      fileName: 'GRRAS_AWS_Cloud_Platform_Syllabus.pdf',
      courseName: 'AWS Cloud Platform',
      description: 'Amazon Web Services Certification',
      icon: '☁️'
    }
  };

  const courseInfo = pdfMapping[courseSlug] || {
    fileName: 'GRRAS_Course_Syllabus.pdf',
    courseName: courseName,
    description: 'Professional Certification Program',
    icon: '📚'
  };

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

  const handleDownload = async () => {
    if (!validateForm()) return;
    
    setIsDownloading(true);
    
    try {
      // Save lead data first
      await saveLead();
      
      // Create and trigger download for a sample PDF
      // For now, we'll create a simple text file as placeholder
      const pdfContent = generateSamplePDF();
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = courseInfo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Show success message
      alert('✅ Thank you! Your syllabus has been downloaded. Check your downloads folder.');
      
      // Close modal
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error downloading syllabus:', error);
      alert('❌ Error downloading syllabus. Please try again or contact support.');
    } finally {
      setIsDownloading(false);
    }
  };

  const generateSamplePDF = () => {
    // This is a placeholder - in production you would have actual PDF files
    return `
GRRAS SOLUTIONS TRAINING INSTITUTE
${courseInfo.courseName}
${courseInfo.description}

🏆 Best Red Hat Training Partner Since 2007

Course Overview:
- Professional certification program
- Industry-recognized credentials  
- Expert instructors
- Hands-on practical training
- 95% placement success rate

For complete details, visit: www.grras.tech
Contact: +91-90019 91227
Email: online@grras.com

Note: This is a sample file. Complete PDF syllabus will be available soon.
`;
  };

  const saveLead = async () => {
    try {
      const leadData = {
        ...formData,
        course: courseInfo.courseName,
        courseSlug: courseSlug,
        type: 'syllabus_download',
        timestamp: new Date().toISOString()
      };
      
      console.log('Lead data:', leadData);
      
      // TODO: Integrate with backend API
      // const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/leads`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(leadData)
      // });
      
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
              <h2 className="text-2xl font-bold mb-2">Download Syllabus</h2>
              <p className="text-red-100">{courseInfo.description}</p>
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
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                {courseInfo.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{courseInfo.courseName}</h3>
                <p className="text-sm text-gray-600">{courseInfo.description}</p>
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
          </div>

          {/* Benefits */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">What you'll get:</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Professional course syllabus</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Career roadmap and salary info</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Free career counseling session</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6 rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Syllabus
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By downloading, you agree to receive course updates from GRRAS Solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaticSyllabusDownload;