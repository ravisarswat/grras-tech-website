import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Home, 
  Info, 
  BookOpen, 
  HelpCircle,
  MessageSquare,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  History,
  LogOut,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [content, setContent] = useState(null);
  const [originalContent, setOriginalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadContent();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      await axios.get(`${API}/admin/verify`);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      await axios.post(`${API}/admin/login`, { password });
      setIsAuthenticated(true);
      toast.success('Login successful');
    } catch (error) {
      setAuthError('Invalid password');
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/admin/logout`);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setContent(response.data.content);
      setOriginalContent(JSON.parse(JSON.stringify(response.data.content)));
    } catch (error) {
      toast.error('Failed to load content');
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/content`, { content });
      setOriginalContent(JSON.parse(JSON.stringify(content)));
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setContent(JSON.parse(JSON.stringify(originalContent)));
    toast.info('Changes reset');
  };

  const loadAuditLogs = async () => {
    try {
      const response = await axios.get(`${API}/content/audit`);
      setAuditLogs(response.data.audit_logs);
      setShowAudit(true);
    } catch (error) {
      toast.error('Failed to load audit logs');
    }
  };

  const hasChanges = () => {
    return JSON.stringify(content) !== JSON.stringify(originalContent);
  };

  const updateContent = (path, value) => {
    const newContent = { ...content };
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setContent(newContent);
  };

  const getContentValue = (path) => {
    if (!content) return '';
    
    const keys = path.split('.');
    let current = content;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }
    
    return current || '';
  };

  const addCourse = () => {
    const newCourse = {
      slug: `new-course-${Date.now()}`,
      title: 'New Course',
      oneLiner: 'Course description',
      duration: '3 months',
      fees: 'Contact for fees',
      tools: [],
      visible: true,
      order: (content?.courses?.length || 0) + 1,
      thumbnailUrl: '',
      category: 'other',
      level: 'Beginner'
    };
    
    const newCourses = [...(content?.courses || []), newCourse];
    updateContent('courses', newCourses);
  };

  const updateCourse = (index, field, value) => {
    const newCourses = [...content.courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    updateContent('courses', newCourses);
  };

  const deleteCourse = (index) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const newCourses = content.courses.filter((_, i) => i !== index);
      updateContent('courses', newCourses);
    }
  };

  const moveCourse = (index, direction) => {
    const newCourses = [...content.courses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newCourses.length) {
      [newCourses[index], newCourses[targetIndex]] = [newCourses[targetIndex], newCourses[index]];
      
      // Update order values
      newCourses.forEach((course, i) => {
        course.order = i + 1;
      });
      
      updateContent('courses', newCourses);
    }
  };

  const addTool = (courseIndex, tool) => {
    if (tool.trim()) {
      const newCourses = [...content.courses];
      newCourses[courseIndex].tools = [...newCourses[courseIndex].tools, tool.trim()];
      updateContent('courses', newCourses);
    }
  };

  const removeTool = (courseIndex, toolIndex) => {
    const newCourses = [...content.courses];
    newCourses[courseIndex].tools = newCourses[courseIndex].tools.filter((_, i) => i !== toolIndex);
    updateContent('courses', newCourses);
  };

  const addFAQ = () => {
    const newFAQ = {
      id: `faq-${Date.now()}`,
      question: 'New FAQ Question',
      answer: 'New FAQ Answer',
      category: 'general',
      order: (content?.faqs?.length || 0) + 1
    };
    
    const newFAQs = [...(content?.faqs || []), newFAQ];
    updateContent('faqs', newFAQs);
  };

  const updateFAQ = (index, field, value) => {
    const newFAQs = [...content.faqs];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    updateContent('faqs', newFAQs);
  };

  const deleteFAQ = (index) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      const newFAQs = content.faqs.filter((_, i) => i !== index);
      updateContent('faqs', newFAQs);
    }
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: `testimonial-${Date.now()}`,
      name: 'Student Name',
      role: 'Role at Company',
      course: 'Course Name',
      text: 'Testimonial text',
      rating: 5,
      order: (content?.testimonials?.length || 0) + 1,
      featured: false
    };
    
    const newTestimonials = [...(content?.testimonials || []), newTestimonial];
    updateContent('testimonials', newTestimonials);
  };

  const updateTestimonial = (index, field, value) => {
    const newTestimonials = [...content.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    updateContent('testimonials', newTestimonials);
  };

  const deleteTestimonial = (index) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      const newTestimonials = content.testimonials.filter((_, i) => i !== index);
      updateContent('testimonials', newTestimonials);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <SEO title="Admin Content Management - GRRAS Solutions" />
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Content Management
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Access the content management panel
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Admin Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input mt-1"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {authError && (
                <div className="text-red-600 text-sm text-center">
                  {authError}
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                Access Content Panel
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'home', name: 'Home Page', icon: <Home className="h-5 w-5" /> },
    { id: 'about', name: 'About', icon: <Info className="h-5 w-5" /> },
    { id: 'courses', name: 'Courses', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'faqs', name: 'FAQs', icon: <HelpCircle className="h-5 w-5" /> },
    { id: 'testimonials', name: 'Testimonials', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <>
      <SEO title="Content Management - GRRAS Solutions" />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-gray-600">Manage website content and course information</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={loadAuditLogs}
                  className="btn-outline flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Audit Log
                </button>
                
                <button
                  onClick={resetChanges}
                  disabled={!hasChanges()}
                  className="btn-outline flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                
                <button
                  onClick={saveContent}
                  disabled={!hasChanges() || saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="spinner w-4 h-4 border-2"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>

                <button
                  onClick={handleLogout}
                  className="btn-outline flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Home Page Content</h2>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      value={getContentValue('home.heroHeadline')}
                      onChange={(e) => updateContent('home.heroHeadline', e.target.value)}
                      className="form-input"
                      placeholder="Main headline on homepage"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtext
                    </label>
                    <textarea
                      value={getContentValue('home.heroSubtext')}
                      onChange={(e) => updateContent('home.heroSubtext', e.target.value)}
                      className="form-textarea"
                      rows={3}
                      placeholder="Subtitle text below headline"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary CTA Label
                      </label>
                      <input
                        type="text"
                        value={getContentValue('home.ctaPrimaryLabel')}
                        onChange={(e) => updateContent('home.ctaPrimaryLabel', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary CTA Link
                      </label>
                      <input
                        type="text"
                        value={getContentValue('home.ctaPrimaryHref')}
                        onChange={(e) => updateContent('home.ctaPrimaryHref', e.target.value)}
                        className="form-input"
                        placeholder="/courses"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary CTA Label
                      </label>
                      <input
                        type="text"
                        value={getContentValue('home.ctaSecondaryLabel')}
                        onChange={(e) => updateContent('home.ctaSecondaryLabel', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary CTA Link
                      </label>
                      <input
                        type="text"
                        value={getContentValue('home.ctaSecondaryHref')}
                        onChange={(e) => updateContent('home.ctaSecondaryHref', e.target.value)}
                        className="form-input"
                        placeholder="/admissions"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">About Page Content</h2>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Headline
                    </label>
                    <input
                      type="text"
                      value={getContentValue('about.headline')}
                      onChange={(e) => updateContent('about.headline', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission Statement
                    </label>
                    <textarea
                      value={getContentValue('about.mission')}
                      onChange={(e) => updateContent('about.mission', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision Statement
                    </label>
                    <textarea
                      value={getContentValue('about.vision')}
                      onChange={(e) => updateContent('about.vision', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Body Text
                    </label>
                    <textarea
                      value={getContentValue('about.body')}
                      onChange={(e) => updateContent('about.body', e.target.value)}
                      className="form-textarea"
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab - This will be a complex interface, I'll implement the basic structure */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Courses Management</h2>
                <button
                  onClick={addCourse}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Course
                </button>
              </div>
              
              <div className="space-y-4">
                {content?.courses?.map((course, index) => (
                  <div key={course.slug} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">#{course.order}</span>
                        <h3 className="text-lg font-medium">{course.title}</h3>
                        {course.visible ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveCourse(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCourse(index, 'down')}
                          disabled={index === content.courses.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => deleteCourse(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course Title
                        </label>
                        <input
                          type="text"
                          value={course.title}
                          onChange={(e) => updateCourse(index, 'title', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slug (URL)
                        </label>
                        <input
                          type="text"
                          value={course.slug}
                          onChange={(e) => updateCourse(index, 'slug', e.target.value)}
                          className="form-input"
                          placeholder="course-url-slug"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          One-liner Description
                        </label>
                        <input
                          type="text"
                          value={course.oneLiner}
                          onChange={(e) => updateCourse(index, 'oneLiner', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={course.duration}
                          onChange={(e) => updateCourse(index, 'duration', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fees
                        </label>
                        <input
                          type="text"
                          value={course.fees}
                          onChange={(e) => updateCourse(index, 'fees', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={course.visible}
                            onChange={(e) => updateCourse(index, 'visible', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Visible on website</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tools & Technologies
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {course.tools?.map((tool, toolIndex) => (
                          <span
                            key={toolIndex}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {tool}
                            <button
                              onClick={() => removeTool(index, toolIndex)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a tool or technology"
                          className="form-input flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTool(index, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add a tool or technology"]');
                            addTool(index, input.value);
                            input.value = '';
                          }}
                          className="btn-outline"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">FAQs Management</h2>
                <button
                  onClick={addFAQ}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add FAQ
                </button>
              </div>
              
              <div className="space-y-4">
                {content?.faqs?.map((faq, index) => (
                  <div key={faq.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium">FAQ #{index + 1}</h3>
                      <button
                        onClick={() => deleteFAQ(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          className="form-textarea"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={faq.category}
                          onChange={(e) => updateFAQ(index, 'category', e.target.value)}
                          className="form-input"
                        >
                          <option value="general">General</option>
                          <option value="admissions">Admissions</option>
                          <option value="fees">Fees</option>
                          <option value="placement">Placement</option>
                          <option value="courses">Courses</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Testimonials Management</h2>
                <button
                  onClick={addTestimonial}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Testimonial
                </button>
              </div>
              
              <div className="space-y-4">
                {content?.testimonials?.map((testimonial, index) => (
                  <div key={testimonial.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{testimonial.name}</h3>
                        {testimonial.featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Featured
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTestimonial(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student Name
                        </label>
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role at Company
                        </label>
                        <input
                          type="text"
                          value={testimonial.role}
                          onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course Taken
                        </label>
                        <input
                          type="text"
                          value={testimonial.course}
                          onChange={(e) => updateTestimonial(index, 'course', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={testimonial.rating}
                          onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Testimonial Text
                        </label>
                        <textarea
                          value={testimonial.text}
                          onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                          className="form-textarea"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={testimonial.featured}
                            onChange={(e) => updateTestimonial(index, 'featured', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Featured testimonial</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Institute Settings</h2>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institute Name
                    </label>
                    <input
                      type="text"
                      value={getContentValue('institute.name')}
                      onChange={(e) => updateContent('institute.name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={getContentValue('institute.address')}
                      onChange={(e) => updateContent('institute.address', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={getContentValue('institute.phone')}
                        onChange={(e) => updateContent('institute.phone', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={getContentValue('institute.email')}
                        onChange={(e) => updateContent('institute.email', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6">Social Media Links</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp URL
                      </label>
                      <input
                        type="text"
                        value={getContentValue('institute.social.whatsapp')}
                        onChange={(e) => updateContent('institute.social.whatsapp', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        value={getContentValue('institute.social.instagram')}
                        onChange={(e) => updateContent('institute.social.instagram', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="text"
                        value={getContentValue('institute.social.youtube')}
                        onChange={(e) => updateContent('institute.social.youtube', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={getContentValue('settings.seoTitle')}
                        onChange={(e) => updateContent('settings.seoTitle', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        value={getContentValue('settings.seoDescription')}
                        onChange={(e) => updateContent('settings.seoDescription', e.target.value)}
                        className="form-textarea"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        value={getContentValue('settings.seoKeywords')}
                        onChange={(e) => updateContent('settings.seoKeywords', e.target.value)}
                        className="form-input"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit Modal */}
        {showAudit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    Content Audit Log
                  </h3>
                  <button
                    onClick={() => setShowAudit(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-500 text-center">No audit logs available</p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{log.user}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{log.diffSummary}</p>
                        {log.changedKeys.length > 0 && (
                          <details className="text-xs text-gray-600">
                            <summary className="cursor-pointer">View changes ({log.changedKeys.length})</summary>
                            <ul className="list-disc list-inside mt-2 ml-4">
                              {log.changedKeys.map((key, i) => (
                                <li key={i}>{key}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminContent;