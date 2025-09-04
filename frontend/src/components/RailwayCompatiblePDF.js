import React, { useState } from 'react';
import { Download, User, Mail, Phone, Briefcase, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

const RailwayCompatiblePDF = ({ courseSlug, courseName, onClose }) => {
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

  // Course information mapping
  const courseInfo = {
    'rhcsa-red-hat-certified-system-administrator': {
      title: 'RHCSA Certification',
      fullTitle: 'Red Hat Certified System Administrator',
      icon: '🐧',
      duration: '40 Hours (8 Weeks)',
      fee: '₹22,000',
      level: 'Intermediate'
    },
    'devops-training': {
      title: 'DevOps Engineering',
      fullTitle: 'Complete DevOps Engineering Program',
      icon: '🚀',
      duration: '60 Hours (12 Weeks)',
      fee: '₹35,000',
      level: 'Advanced'
    },
    'aws-cloud-platform': {
      title: 'AWS Cloud Platform',
      fullTitle: 'Amazon Web Services Certification',
      icon: '☁️',
      duration: '45 Hours (9 Weeks)',
      fee: '₹28,000',
      level: 'Intermediate'
    }
  };

  const course = courseInfo[courseSlug] || {
    title: courseName,
    fullTitle: courseName,
    icon: '📚',
    duration: 'Contact for details',
    fee: 'Contact for pricing',
    level: 'All Levels'
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateProfessionalPDF = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Colors
      const primaryColor = '#dc2626'; // Red
      const secondaryColor = '#ea580c'; // Orange
      const textColor = '#374151'; // Gray
      const lightGray = '#f3f4f6';
      
      // Page 1: Cover Page
      // Background gradient effect (using rectangles)
      doc.setFillColor(220, 38, 38); // Red
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setFillColor(234, 88, 12); // Orange overlay
      doc.rect(0, 0, pageWidth, pageHeight/2, 'F');
      
      // Header with award
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('GRRAS SOLUTIONS', 20, 20);
      
      // Award badge
      doc.setFillColor(251, 191, 36); // Yellow
      doc.roundedRect(pageWidth - 80, 10, 70, 15, 3, 3, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(8);
      doc.text('🏆 Best Red Hat Partner Since 2007', pageWidth - 75, 19);
      
      // Course title section
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.text(course.title.split(' ')[0], pageWidth/2, 80, { align: 'center' });
      
      doc.setFontSize(24);
      doc.text(course.fullTitle, pageWidth/2, 100, { align: 'center' });
      
      // Key highlights box
      doc.setFillColor(255, 255, 255, 0.1);
      doc.roundedRect(30, 120, pageWidth - 60, 60, 5, 5, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      const highlights = [
        '✓ ' + course.duration + ' of Training',
        '✓ Industry-Recognized Certification',
        '✓ Expert Instructors',
        '✓ 95% Placement Success Rate'
      ];
      
      highlights.forEach((highlight, index) => {
        doc.text(highlight, 40, 140 + (index * 12));
      });
      
      // Institute tag at bottom
      doc.setFillColor(255, 255, 255, 0.2);
      doc.roundedRect(60, 220, pageWidth - 120, 20, 10, 10, 'F');
      doc.setFontSize(14);
      doc.text('GRRAS Solutions Training Institute', pageWidth/2, 232, { align: 'center' });
      
      // Page 2: Course Details
      doc.addPage();
      
      // Header
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Course Overview', 20, 18);
      
      // Page number
      doc.setFontSize(10);
      doc.text('Page 2', pageWidth - 30, 18);
      
      // Content
      doc.setTextColor(textColor);
      doc.setFontSize(14);
      doc.text('About ' + course.title, 20, 45);
      
      doc.setFontSize(11);
      const aboutText = `The ${course.title} certification demonstrates your skills in areas of system administration common across a wide range of environments. This comprehensive program is designed to provide hands-on experience with real-world scenarios.`;
      
      const splitText = doc.splitTextToSize(aboutText, pageWidth - 40);
      doc.text(splitText, 20, 55);
      
      // Why choose GRRAS section
      doc.setFontSize(14);
      doc.text('Why Choose GRRAS?', 20, 85);
      
      doc.setFontSize(11);
      const reasons = [
        '• Best Red Hat Partner Since 2007: Official training partner with proven track record',
        '• Expert Instructors: Certified professionals with industry experience',
        '• Hands-on Labs: 70% practical training with real-world scenarios',
        '• Placement Support: 95% placement rate with top IT companies'
      ];
      
      let yPos = 95;
      reasons.forEach(reason => {
        const splitReason = doc.splitTextToSize(reason, pageWidth - 40);
        doc.text(splitReason, 20, yPos);
        yPos += (splitReason.length * 6) + 5;
      });
      
      // Course info table
      doc.setFontSize(14);
      doc.text('Course Information', 20, yPos + 10);
      
      // Table
      const tableData = [
        ['Duration', course.duration],
        ['Mode', 'Online + Offline'],
        ['Level', course.level],
        ['Fee', course.fee]
      ];
      
      let tableY = yPos + 25;
      
      // Table header
      doc.setFillColor(220, 38, 38);
      doc.rect(20, tableY, pageWidth - 40, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Course Details', 25, tableY + 10);
      doc.text('Information', pageWidth/2 + 10, tableY + 10);
      
      // Table rows
      tableData.forEach((row, index) => {
        const rowY = tableY + 15 + (index * 15);
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(20, rowY, pageWidth - 40, 15, 'F');
        }
        
        doc.setTextColor(textColor);
        doc.setFontSize(11);
        doc.text(row[0], 25, rowY + 10);
        doc.text(row[1], pageWidth/2 + 10, rowY + 10);
      });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('📞 +91-90019 91227 | ✉️ online@grras.com', 20, pageHeight - 10);
      doc.text('www.grras.tech', pageWidth - 40, pageHeight - 10);
      
      // Page 3: Syllabus
      doc.addPage();
      
      // Header
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Detailed Syllabus', 20, 18);
      doc.setFontSize(10);
      doc.text('Page 3', pageWidth - 30, 18);
      
      // Syllabus modules
      const modules = [
        {
          title: 'Module 1: Introduction to Enterprise Linux',
          content: '• Linux overview and features\n• Installation and initial setup\n• File system hierarchy\n• Basic command line operations'
        },
        {
          title: 'Module 2: File Management and Permissions',
          content: '• File and directory operations\n• File permissions and ownership\n• Access Control Lists (ACLs)\n• File linking and archiving'
        },
        {
          title: 'Module 3: User and Group Management',
          content: '• Creating and managing user accounts\n• Group management and membership\n• Password policies and aging\n• Sudo configuration'
        },
        {
          title: 'Module 4: Process and Service Management',
          content: '• Process monitoring and control\n• System service management\n• Job scheduling\n• System logging and analysis'
        }
      ];
      
      let moduleY = 40;
      
      modules.forEach((module, index) => {
        // Module header
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(20, moduleY, pageWidth - 40, 8, 2, 2, 'F');
        
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(12);
        doc.text(module.title, 25, moduleY + 6);
        
        // Module content
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        const moduleContent = doc.splitTextToSize(module.content, pageWidth - 50);
        doc.text(moduleContent, 25, moduleY + 15);
        
        moduleY += 40;
      });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('📍 A-81, Singh Bhoomi Khatipura Rd, Jaipur', 20, pageHeight - 10);
      doc.text('Best Red Hat Training Partner', pageWidth - 60, pageHeight - 10);
      
      // Page 4: Career & Contact
      doc.addPage();
      
      // Header
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Career Opportunities & Contact', 20, 18);
      doc.setFontSize(10);
      doc.text('Page 4', pageWidth - 30, 18);
      
      // Career section
      doc.setTextColor(textColor);
      doc.setFontSize(14);
      doc.text('Career Opportunities', 20, 45);
      
      doc.setFontSize(11);
      const careerText = 'This certification opens doors to numerous career opportunities in the rapidly growing Linux ecosystem. Our students have successfully placed in top companies with excellent packages.';
      const splitCareerText = doc.splitTextToSize(careerText, pageWidth - 40);
      doc.text(splitCareerText, 20, 55);
      
      // Job roles
      doc.setFontSize(12);
      doc.text('Job Roles After Certification:', 20, 75);
      
      const jobRoles = [
        '• Linux System Administrator: ₹4-8 LPA',
        '• DevOps Engineer: ₹6-12 LPA',
        '• Cloud Infrastructure Engineer: ₹8-15 LPA',
        '• Site Reliability Engineer: ₹10-20 LPA'
      ];
      
      let jobY = 85;
      jobRoles.forEach(role => {
        doc.setFontSize(11);
        doc.text(role, 25, jobY);
        jobY += 10;
      });
      
      // Next steps
      doc.setFontSize(14);
      doc.text('Next Steps', 20, 140);
      
      doc.setFontSize(11);
      const nextStepsText = 'Ready to start your certification journey? Contact us today for admission details, batch schedules, and fee structure. Our admission counselors will guide you through the entire process.';
      const splitNextSteps = doc.splitTextToSize(nextStepsText, pageWidth - 40);
      doc.text(splitNextSteps, 20, 150);
      
      // CTA box
      doc.setFillColor(251, 243, 199);
      doc.roundedRect(30, 170, pageWidth - 60, 20, 5, 5, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(14);
      doc.text('🎯 Limited Seats Available - Enroll Now!', pageWidth/2, 182, { align: 'center' });
      
      // Contact information
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.text('Contact Information:', 20, 210);
      
      doc.setFontSize(11);
      doc.text('📞 Phone: +91-90019 91227', 20, 220);
      doc.text('✉️ Email: online@grras.com', 20, 230);
      doc.text('🌐 Website: www.grras.tech', 20, 240);
      doc.text('📍 Address: A-81, Singh Bhoomi Khatipura Rd, Jaipur', 20, 250);
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('WhatsApp: +91-90019 91227', 20, pageHeight - 10);
      doc.text('Download More Syllabi at www.grras.tech', pageWidth - 80, pageHeight - 10);
      
      // Save PDF
      const fileName = `GRRAS_${course.title.replace(/\s+/g, '_')}_Syllabus.pdf`;
      doc.save(fileName);
      
      // Save lead
      await saveLead();
      
      alert('✅ Professional PDF downloaded successfully! Check your downloads folder.');
      
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
      const leadData = {
        ...formData,
        course: course.title,
        courseSlug: courseSlug,
        type: 'syllabus_download',
        timestamp: new Date().toISOString()
      };
      
      console.log('Lead data saved:', leadData);
      
      // TODO: Integrate with backend API when ready
      
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
              <h2 className="text-2xl font-bold mb-2">Download Professional Syllabus</h2>
              <p className="text-red-100">{course.fullTitle}</p>
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
                {course.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.fullTitle}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                🏆 <strong>Best Red Hat Partner Since 2007</strong> - Get professional 4-page syllabus with career guidance!
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
                <span>Professional 4-page syllabus PDF</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Career roadmap with salary ranges</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Free career counseling session</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Course modules and learning outcomes</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={generateProfessionalPDF}
            disabled={isGenerating}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6 rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Professional PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Professional Syllabus PDF
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

export default RailwayCompatiblePDF;