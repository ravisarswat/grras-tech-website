import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const Privacy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - GRRAS Solutions Training Institute"
        description="Learn about how GRRAS Solutions protects your privacy and handles your personal information. Read our comprehensive privacy policy."
        keywords="GRRAS privacy policy, data protection, personal information, privacy rights"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
              <Shield className="h-8 w-8" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy is important to us. Learn how we protect your information.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in-up">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> January 15, 2025
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you:
              </p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li>Fill out inquiry forms on our website</li>
                <li>Download course syllabi or materials</li>
                <li>Contact us via phone, email, or WhatsApp</li>
                <li>Visit our campus for counseling</li>
                <li>Enroll in our courses or programs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                The types of personal information we may collect include:
              </p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                <li><strong>Educational Background:</strong> Academic qualifications, previous courses</li>
                <li><strong>Course Preferences:</strong> Areas of interest, career goals</li>
                <li><strong>Communication Records:</strong> Messages, inquiries, and correspondence</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li>Provide course information and counseling services</li>
                <li>Process course enrollments and admissions</li>
                <li>Send you course materials, syllabi, and updates</li>
                <li>Communicate about our programs and services</li>
                <li>Provide placement assistance and career guidance</li>
                <li>Improve our courses and services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li><strong>Placement Partners:</strong> With your consent, we may share your profile with hiring partners for placement opportunities</li>
                <li><strong>Service Providers:</strong> With trusted service providers who assist in our operations (email services, payment processors)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your information to another organization</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication Preferences</h2>
              <p className="text-gray-700 mb-6">
                By providing your contact information, you consent to receive communications from GRRAS Solutions about:
              </p>
              <ul className="text-gray-700 mb-6 space-y-2">
                <li>Course information and updates</li>
                <li>Admission processes and deadlines</li>
                <li>Placement opportunities</li>
                <li>Educational content and resources</li>
              </ul>
              <p className="text-gray-700 mb-6">
                You can opt-out of promotional communications at any time by contacting us directly.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 mb-6">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. You can control cookie settings through your browser preferences.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
              <p className="text-gray-700 mb-6">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 mb-6">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Student records are maintained according to educational regulations and our institutional policies.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this privacy policy or our privacy practices, please contact us:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">
                      <strong>Email:</strong> privacy@grrassolutions.com
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">
                      <strong>Phone:</strong> 090019 91227
                    </span>
                  </div>
                  
                  <div className="text-gray-700">
                    <strong>Address:</strong><br />
                    GRRAS Solutions Training Institute<br />
                    A-81, Singh Bhoomi Khatipura Rd,<br />
                    behind Marudhar Hospital,<br />
                    Jaipur, Rajasthan 302012
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 text-center border border-red-100 mt-8 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Have Questions About Our Privacy Policy?
            </h3>
            <p className="text-gray-600 mb-6">
              We're transparent about how we handle your information. Contact us if you need clarification.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="btn-primary"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
              
              <Link
                to="/"
                className="btn-outline"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;