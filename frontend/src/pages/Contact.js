import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Sparkles,
  Heart,
  Star,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const { content } = useContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Get institute data from CMS
  const institute = content?.institute || {};
  const instituteName = institute.name || 'GRRAS Solutions Training Institute';
  const address = institute.address || 'A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012';
  const phones = institute.phones || ['090019 91227'];
  const emails = institute.emails || ['info@grrassolutions.com'];
  const whatsappUrl = institute.social?.whatsapp || 'https://wa.me/919001991227';
  const googleMapUrl = institute.googleMapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113831.95870011782!2d75.59321269726563!3d26.92732880000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db5d0e5555555%3A0xc45671d79cdb76ba!2sGrras%20Solution%20Pvt%20Ltd%20-%20Advanced%20IT%20Training%20%26%20Certification%20Center!5e0!3m2!1sen!2sin!4v1756381969994!5m2!1sen!2sin';
  const social = institute.social || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
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
      // Create FormData for backend Form(...) endpoints
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('phone', formData.phone.replace(/\D/g, ''));
      formDataToSend.append('course', 'General Inquiry');
      formDataToSend.append('message', formData.message.trim());
      
      await axios.post(`${API}/contact`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Message sent successfully!', {
        description: 'We will get back to you within 24 hours.',
        icon: <CheckCircle className="h-5 w-5" />
      });
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      toast.error('Failed to send message', {
        description: 'Please try again or contact us directly.',
        icon: <AlertCircle className="h-5 w-5" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic contact info from CMS
  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Visit Our Campus',
      details: address.split(',').map(line => line.trim()),
      action: { 
        text: 'Get Directions', 
        href: googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}` 
      }
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Call Us',
      details: phones.filter(phone => phone.trim()),
      action: { 
        text: 'Call Now', 
        href: `tel:${phones[0]?.replace(/\s+/g, '')}` 
      }
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Us',
      details: emails.filter(email => email.trim()),
      action: { 
        text: 'Send Email', 
        href: `mailto:${emails[0]}` 
      }
    },
    ...(whatsappUrl && whatsappUrl !== '#' ? [{
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'WhatsApp',
      details: ['Quick responses on WhatsApp'],
      action: { 
        text: 'Chat Now', 
        href: `${whatsappUrl}?text=Hello! I need information about ${instituteName} courses.`
      }
    }] : [])
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' }
  ];

  const faqs = [
    {
      question: 'What are the admission requirements?',
      answer: 'For our degree programs, you need 12th pass. For professional courses, basic computer knowledge is preferred but not mandatory.'
    },
    {
      question: 'Do you provide placement assistance?',
      answer: 'Yes, we provide 100% placement assistance with our network of 100+ hiring partners including top IT companies.'
    },
    {
      question: 'Are there any EMI options for course fees?',
      answer: 'Yes, we offer flexible EMI options for all our courses. Contact our admission team for details.'
    },
    {
      question: 'What is the batch size for courses?',
      answer: 'We maintain small batch sizes of 20-25 students to ensure personalized attention and better learning outcomes.'
    }
  ];

  return (
    <>
      <SEO
        title="Contact GRRAS Solutions - IT Training Institute in Jaipur"
        description="Get in touch with GRRAS Solutions Training Institute in Jaipur. Call 090019 91227, visit our Khatipura campus, or send us a message for course information."
        keywords="contact GRRAS, IT training institute Jaipur, admission enquiry, course information, address phone number"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-20 gradient-bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Get in Touch
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Ready to start your IT career? Contact our admission counselors for personalized guidance
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                    {info.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  
                  <div className="text-gray-600 text-sm mb-4">
                    {info.details.map((detail, i) => (
                      <p key={i}>{detail}</p>
                    ))}
                  </div>
                  
                  <a
                    href={info.action.href}
                    target={info.action.href && info.action.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.action.href && info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                  >
                    {info.action.text}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form - Beautiful & Creative Design */}
              <div className="animate-fade-in-up">
                <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-red-50/40 rounded-3xl p-8 shadow-2xl border border-orange-100/50 overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
                  
                  {/* Header with Icons */}
                  <div className="relative text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      Let's Start Your Journey! 🚀
                    </h2>
                    <p className="text-gray-600 font-medium">Transform your career with us - we're here to help every step of the way</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {/* Name Field */}
                    <div className="group">
                      <label htmlFor="name" className="flex items-center text-sm font-bold text-gray-700 mb-3">
                        <User className="h-4 w-4 mr-2 text-red-500" />
                        What should we call you? ✨
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md focus:shadow-lg focus:scale-[1.02] ${
                            errors.name 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                          } focus:ring-4 focus:outline-none placeholder-gray-400`}
                          placeholder="Your awesome name here! 😊"
                          disabled={isSubmitting}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Star className="h-5 w-5 text-orange-400 opacity-50" />
                        </div>
                      </div>
                      {errors.name && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="group">
                      <label htmlFor="email" className="flex items-center text-sm font-bold text-gray-700 mb-3">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        Where can we reach you? 📧
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md focus:shadow-lg focus:scale-[1.02] ${
                            errors.email 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                          } focus:ring-4 focus:outline-none placeholder-gray-400`}
                          placeholder="your.email@example.com ✉️"
                          disabled={isSubmitting}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Zap className="h-5 w-5 text-blue-400 opacity-50" />
                        </div>
                      </div>
                      {errors.email && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="group">
                      <label htmlFor="phone" className="flex items-center text-sm font-bold text-gray-700 mb-3">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        Your contact number? 📱
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md focus:shadow-lg focus:scale-[1.02] ${
                            errors.phone 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                          } focus:ring-4 focus:outline-none placeholder-gray-400`}
                          placeholder="9876543210 📞"
                          disabled={isSubmitting}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Heart className="h-5 w-5 text-green-400 opacity-50" />
                        </div>
                      </div>
                      {errors.phone && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    {/* Message Field */}
                    <div className="group">
                      <label htmlFor="message" className="flex items-center text-sm font-bold text-gray-700 mb-3">
                        <MessageCircle className="h-4 w-4 mr-2 text-purple-500" />
                        Tell us about your dreams! 💭
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md focus:shadow-lg focus:scale-[1.02] ${
                            errors.message 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                          } focus:ring-4 focus:outline-none placeholder-gray-400 resize-none`}
                          placeholder="Share your goals, questions, or just say hello! We'd love to know what brings you here... 🌟"
                          disabled={isSubmitting}
                        />
                        <div className="absolute right-4 bottom-4">
                          <Sparkles className="h-5 w-5 text-purple-400 opacity-50" />
                        </div>
                      </div>
                      {errors.message && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.message}
                        </div>
                      )}
                    </div>

                    {/* Beautiful Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full py-4 px-8 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                      >
                        {/* Button Background Animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Button Content */}
                        <div className="relative flex items-center justify-center space-x-3">
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-lg">Sending your message... ✨</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                              <span className="text-lg">Send My Message! 🚀</span>
                              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                            </>
                          )}
                        </div>
                        
                        {/* Sparkle Effect */}
                        <div className="absolute top-0 left-0 w-full h-full">
                          <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                          <div className="absolute bottom-2 right-6 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute top-3 right-8 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '1s' }}></div>
                        </div>
                      </button>
                      
                      {/* Fun Message Below Button */}
                      <p className="text-center text-sm text-gray-500 mt-3 font-medium">
                        🎯 We typically respond within 2 hours!
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-8">
                {/* Office Hours */}
                <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-red-500" />
                    Office Hours
                  </h3>
                  
                  <div className="space-y-3">
                    {officeHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700 font-medium">{schedule.day}</span>
                        <span className="text-gray-600">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 text-sm">
                      <strong>Note:</strong> We're also available for online consultations outside office hours. 
                      Contact us via WhatsApp for immediate assistance.
                    </p>
                  </div>
                </div>

                {/* Google Maps */}
                <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Find Us Here
                  </h3>
                  
                  {googleMapUrl ? (
                    <div className="rounded-lg overflow-hidden">
                      <iframe
                        src={googleMapUrl}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-lg"
                        title={`${instituteName} Location`}
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Interactive Map</p>
                        <p className="text-sm text-gray-500">
                          Map will be displayed when configured in admin settings
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Address:</p>
                        <address className="text-sm text-gray-800 not-italic">
                          {address.split(',').map((line, index) => (
                            <span key={index}>
                              {line.trim()}
                              {index < address.split(',').length - 1 && <br />}
                            </span>
                          ))}
                        </address>
                        {googleMapUrl && (
                          <a
                            href={googleMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm mt-2 transition-colors"
                            aria-label={`Open ${instituteName} location in Google Maps`}
                          >
                            Open in Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Frequently Asked Questions
                  </h3>
                  
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;