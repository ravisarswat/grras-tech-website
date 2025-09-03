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
  Plus,
  Trash2,
  History,
  LogOut,
  Shield,
  AlertCircle,
  Tag,
  Route,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import SettingsTab from '../components/SettingsTab';
import CourseManager from '../components/CourseManager';
import FooterTab from '../components/FooterTab';
import CategoryManager from '../components/CategoryManager';
import LearningPathManager from '../components/LearningPathManager';
import BlogManager from '../components/BlogManager';
import adminSyncUtils from '../utils/adminSync';
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
      // Check for stored token
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      // Verify token with backend
      await axios.get(`${API}/admin/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsAuthenticated(true);
    } catch (error) {
      // Remove invalid token
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
      }
      
      setIsAuthenticated(true);
      toast.success('Login successful');
    } catch (error) {
      setAuthError('Invalid password');
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await axios.post(`${API}/admin/logout`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
    }
  };

  const loadContent = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/content`, { headers });
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
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      // Validate all courses before saving
      const courseErrors = [];
      content.courses?.forEach((course, index) => {
        // Auto-fix missing required fields with sensible defaults
        if (!course.title?.trim()) {
          courseErrors.push(`Course ${index + 1}: Title is required`);
        }
        if (!course.slug?.trim()) {
          courseErrors.push(`Course ${index + 1}: Slug is required`);
        }
        
        // Auto-fix missing oneLiner with course title fallback
        if (!course.oneLiner?.trim()) {
          // Instead of throwing error, auto-generate oneLiner from title
          const autoOneLiner = course.title ? 
            `Professional ${course.title.toLowerCase()} training with hands-on experience and industry certification` :
            'Comprehensive training program with practical skills and certification';
          
          // Auto-update the course with generated oneLiner
          course.oneLiner = autoOneLiner;
          console.log(`Auto-generated oneLiner for course ${index + 1}: ${autoOneLiner}`);
        }
        
        // Auto-fix other missing fields
        if (!course.description?.trim()) {
          course.description = course.oneLiner || 'Detailed course description will be updated soon.';
        }
        if (!course.duration?.trim()) {
          course.duration = '4-6 weeks';
        }
        if (!course.fees?.trim()) {
          course.fees = 'Contact for pricing';
        }
        if (!course.level?.trim()) {
          course.level = 'Beginner to Intermediate';
        }
        if (!course.category?.trim()) {
          course.category = 'general';
        }
        
        // Check for duplicate slugs
        const duplicateSlug = content.courses.find((c, i) => 
          i !== index && c.slug === course.slug
        );
        if (duplicateSlug) {
          courseErrors.push(`Course ${index + 1}: Slug "${course.slug}" is already used`);
        }
      });
      
      if (courseErrors.length > 0) {
        toast.error(`Please fix the following errors:\n${courseErrors.join('\n')}`);
        setSaving(false);
        return;
      }
      
      // Ensure all courses have required arrays and proper structure with auto-fix
      const cleanedContent = {
        ...content,
        courses: content.courses?.map((course, index) => {
          // Auto-fix missing fields globally
          const cleanedCourse = {
            ...course,
            // Ensure basic required fields exist
            title: course.title?.trim() || `Course ${index + 1}`,
            slug: course.slug?.trim() || `course-${index + 1}`,
            oneLiner: course.oneLiner?.trim() || 
              (course.title ? 
                `Professional ${course.title.toLowerCase()} training with hands-on experience and industry certification` :
                'Comprehensive training program with practical skills and certification'
              ),
            description: course.description?.trim() || course.oneLiner?.trim() || 'Course description will be updated soon',
            duration: course.duration?.trim() || '4-6 weeks',
            fees: course.fees?.trim() || 'Contact for pricing',
            level: course.level?.trim() || 'Beginner to Intermediate',
            category: course.category?.trim() || 'general',
            
            // Ensure arrays exist
            tools: course.tools || [],
            highlights: course.highlights || [],
            learningOutcomes: course.learningOutcomes || [],
            careerRoles: course.careerRoles || [],
            mode: course.mode || [],
            
            // Ensure other fields
            visible: course.visible !== false,
            featured: course.featured || false,
            order: course.order || index + 1,
            
            // Optional fields with defaults
            overview: course.overview || course.description || course.oneLiner,
            eligibility: course.eligibility || 'Basic computer knowledge recommended',
            certificate: course.certificate || 'Certificate of completion provided',
            
            // SEO fields
            seo: {
              title: course.seo?.title || course.title,
              description: course.seo?.description || course.oneLiner,
              keywords: course.seo?.keywords || course.title?.toLowerCase().replace(/\s+/g, ', '),
              ogImage: course.seo?.ogImage || '',
              ...course.seo
            }
          };
          
          return cleanedCourse;
        }) || []
      };
      
      // Use enhanced save with sync
      const saveResult = await adminSyncUtils.saveContentWithSync(cleanedContent, token, false);
      
      if (saveResult.success) {
        setOriginalContent(JSON.parse(JSON.stringify(cleanedContent)));
        setContent(cleanedContent);
        
        // Show sync notification  
        adminSyncUtils.showSyncNotification('Content saved! Syncing with website...', 'info');
        
        // Wait for sync and verify
        await adminSyncUtils.waitForSync(2000);
        
        // Verify sync status
        const syncStatus = await adminSyncUtils.verifySyncStatus(cleanedContent.courses?.length);
        
        if (syncStatus.synced) {
          toast.success('✅ Content saved and synced successfully! Changes are now live on website.');
        } else {
          toast.warning('⚠️ Content saved but sync verification failed. Please refresh website to see changes.');
        }
        
        // Force reload content from server to ensure sync
        setTimeout(() => {
          loadContent();
        }, 1000);
      } else {
        throw new Error(saveResult.error || 'Save failed');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save content. Please try again.';
      toast.error(errorMessage);
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
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await axios.get(`${API}/content/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    console.log('🔄 updateContent called:', { path, valueType: typeof value, valueKeys: typeof value === 'object' ? Object.keys(value || {}) : 'N/A' });
    
    // Create a deep copy to ensure change detection works
    const newContent = JSON.parse(JSON.stringify(content));
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Add a timestamp to force change detection
    newContent._lastModified = new Date().toISOString();
    
    console.log('🔄 Setting new content with timestamp:', newContent._lastModified);
    setContent(newContent);
    
    // Log if changes should be detected
    setTimeout(() => {
      const hasChangesNow = JSON.stringify(newContent) !== JSON.stringify(originalContent);
      console.log('🔄 Changes detected after update:', hasChangesNow);
    }, 0);
  };

  const forceSyncWithWebsite = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      toast.info('🔄 Force syncing with website...');
      
      const syncResult = await adminSyncUtils.forceAdminSync(token);
      
      if (syncResult.success) {
        toast.success('✅ Force sync completed! Website updated successfully.');
        
        // Verify sync status
        setTimeout(async () => {
          const verification = await adminSyncUtils.verifySyncStatus();
          if (verification.synced) {
            toast.success(`✅ Sync verified: ${verification.coursesCount} courses live on website`);
          }
        }, 2000);
        
        // Reload content to ensure consistency
        loadContent();
      } else {
        toast.error(`❌ Force sync failed: ${syncResult.error}`);
      }
    } catch (error) {
      toast.error('❌ Force sync error: ' + error.message);
      console.error('Force sync error:', error);
    }
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
    const timestamp = Date.now();
    const newCourse = {
      slug: `new-course-${timestamp}`,
      title: 'New Course',
      oneLiner: 'Course description',
      duration: '',
      fees: '',
      tools: [],
      highlights: [],
      learningOutcomes: [],
      careerRoles: [],
      overview: '',
      level: 'Beginner',
      certificateInfo: '',
      batchesInfo: '',
      category: '',
      thumbnailUrl: '',
      mode: [],
      eligibility: '',
      seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: ''
      },
      visible: true,
      featured: false,
      order: (content?.courses?.length || 0) + 1
    };
    
    const newCourses = [...(content?.courses || []), newCourse];
    updateContent('courses', newCourses);
    toast.success('New course added. Please update the details and save.');
  };

  const updateCourse = (index, field, value) => {
    console.log('🔄 ADMIN updateCourse called:');
    console.log('   Index:', index);
    console.log('   Field:', field);
    console.log('   Value:', value);
    
    const newCourses = [...content.courses];
    const beforeUpdate = { ...newCourses[index] };
    
    newCourses[index] = { ...newCourses[index], [field]: value };
    
    console.log('   Before:', beforeUpdate[field]);
    console.log('   After:', newCourses[index][field]);
    console.log('   Updated Course:', newCourses[index]);
    
    // Update content state immediately
    updateContent('courses', newCourses);
    
    console.log('✅ updateContent called for courses - category should now persist in UI');
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
      if (!newCourses[courseIndex].tools) {
        newCourses[courseIndex].tools = [];
      }
      newCourses[courseIndex].tools = [...newCourses[courseIndex].tools, tool.trim()];
      updateContent('courses', newCourses);
      
      // Show immediate feedback
      toast.success(`Added "${tool.trim()}" to ${newCourses[courseIndex].title}`);
    }
  };

  const removeTool = (courseIndex, toolIndex) => {
    const newCourses = [...content.courses];
    if (newCourses[courseIndex].tools) {
      newCourses[courseIndex].tools = newCourses[courseIndex].tools.filter((_, i) => i !== toolIndex);
      updateContent('courses', newCourses);
    }
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
    { id: 'blog', name: 'Blog', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'categories', name: 'Categories', icon: <Tag className="h-5 w-5" /> },
    { id: 'paths', name: 'Learning Paths', icon: <Route className="h-5 w-5" /> },
    { id: 'footer', name: 'Footer', icon: <MessageSquare className="h-5 w-5" /> },
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
                  onClick={forceSyncWithWebsite}
                  className="btn-outline flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                  title="Force sync admin changes with website"
                >
                  <RefreshCw className="h-4 w-4" />
                  Force Sync
                </button>
                
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
            <div className="w-full">
              <div className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-3 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
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

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <CourseManager 
              content={content} 
              updateContent={updateContent}
            />
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <CategoryManager 
              content={content} 
              updateContent={updateContent}
              saveContent={saveContent}
              saving={saving}
            />
          )}

          {/* Blog Tab */}
          {activeTab === 'blog' && (
            <BlogManager />
          )}

          {/* Learning Paths Tab */}
          {activeTab === 'paths' && (
            <LearningPathManager 
              content={content} 
              updateContent={updateContent}
            />
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
            <FooterTab 
              content={content} 
              updateContent={updateContent}
            />
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
            <SettingsTab 
              content={content}
              updateContent={updateContent}
              getContentValue={getContentValue}
            />
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