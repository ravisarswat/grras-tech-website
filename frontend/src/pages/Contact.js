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
              {/* Contact Form */}
              <div className="animate-fade-in-up">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Send Us a Message
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`form-textarea ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Tell us about your requirements or questions..."
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner w-4 h-4 border-2"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
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