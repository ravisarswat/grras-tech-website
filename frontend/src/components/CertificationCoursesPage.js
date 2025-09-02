import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Award, 
  Clock, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Star,
  CheckCircle,
  BookOpen,
  Target,
  Search,
  Filter
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../contexts/ContentContext';

const CertificationCoursesPage = () => {
  const { content } = useContent();
  const location = useLocation();
  
  // Dynamic course categories from admin panel + fallback hardcoded
  const courseCategories = content?.courseCategories || {};
  
  // Get first available category as default
  const getDefaultTab = () => {
    const availableCategories = Object.keys(courseCategories);
    return availableCategories.length > 0 ? availableCategories[0] : 'redhat';
  };
  
  // Get tab from URL parameter with dynamic default
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab') || getDefaultTab();
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Update active tab when URL changes
  useEffect(() => {
    const newTab = urlParams.get('tab') || getDefaultTab();
    setActiveTab(newTab);
  }, [location.search, content]);

  const courses = content?.courses || [];

  // Determine certification level based on course content
  const determineLevel = (course, vendor) => {
    const title = course.title?.toLowerCase() || '';
    const level = course.level?.toLowerCase() || '';
    const category = course.category?.toLowerCase() || '';

    // PRIORITY 1: Always respect exact database level settings from admin panel
    if (level.includes('professional level') || level === 'professional level' || level === 'professional') return 'professional';
    if (level.includes('specialist level') || level === 'specialist level' || level === 'specialist') return 'specialist';
    if (level.includes('foundation level') || level === 'foundation level' || level === 'foundation') return 'foundation';
    if (level.includes('beginner level') || level === 'beginner level' || level === 'beginner') return 'beginner';
    if (level.includes('intermediate level') || level === 'intermediate level' || level === 'intermediate') return 'intermediate';
    if (level.includes('advanced level') || level === 'advanced level' || level === 'advanced') return 'advanced';
    if (level.includes('associate level') || level === 'associate level' || level === 'associate') return 'associate';
    if (level.includes('administrator level') || level === 'administrator level' || level === 'administrator') return 'administrator';
    if (level.includes('security level') || level === 'security level' || level === 'security') return 'security';
    if (level.includes('expert level') || level === 'expert level' || level === 'expert') return 'expert';
    if (level.includes('developer level') || level === 'developer level' || level === 'developer') return 'developer';

    // PRIORITY 2: Fallback to vendor-specific logic only if level is not set
    if (vendor === 'redhat') {
      if (title.includes('rhcsa') || title.includes('basics') || title.includes('foundation')) return 'foundation';
      if (title.includes('rhce') || title.includes('do188') || title.includes('engineer')) return 'professional';
      return 'specialist';
    }

    if (vendor === 'aws') {
      if (title.includes('practitioner') || title.includes('foundation')) return 'foundation';
      if (title.includes('associate') || title.includes('developer')) return 'associate';
      return 'professional';
    }

    if (vendor === 'kubernetes') {
      if (title.includes('cka') || title.includes('administrator')) return 'administrator';
      if (title.includes('cks') || title.includes('security')) return 'security';
      return 'developer';
    }

    if (vendor === 'devops') {
      if (title.includes('basics') || title.includes('foundation')) return 'foundation';
      if (title.includes('advanced') || title.includes('expert')) return 'expert';
      return 'professional';
    }

    if (vendor === 'cybersecurity') {
      if (title.includes('basics') || title.includes('foundation')) return 'foundation';
      if (title.includes('advanced') || title.includes('expert')) return 'expert';
      return 'professional';
    }

    if (vendor === 'programming') {
      if (title.includes('machine learning') || title.includes('data science')) return 'professional';
      if (title.includes('basics') || title.includes('foundation')) return 'beginner';
      return 'intermediate';
    }

    // Default fallback
    return 'intermediate';
  };

  // Vendor-based course organization
  // Combine dynamic categories with hardcoded ones for backward compatibility
  const courseVendors = {
    // Dynamic categories from admin panel
    ...Object.keys(courseCategories).reduce((acc, slug) => {
      const category = courseCategories[slug];
      acc[slug] = {
        name: category.name || slug,
        slug: slug, // Add slug for reference
        order: category.order || 999, // Include order from category
        icon: category.icon === 'server' ? '🔴' : 
              category.icon === 'cloud' ? '☁️' : 
              category.icon === 'container' ? '⚙️' :
              category.icon === 'terminal' ? '🔧' :
              category.icon === 'shield' ? '🛡️' :
              category.icon === 'code' ? '💻' :
              category.icon === 'graduation-cap' ? '🎓' :
              category.icon === 'database' ? '🖥️' : '📚',
        color: category.color || '#6366F1',
        description: category.description || `${category.name} courses and certifications`,
        keywords: [slug, category.name?.toLowerCase()],
        levels: {
          foundation: { name: 'Foundation Level', description: `Start your ${category.name} journey` },
          professional: { name: 'Professional Level', description: `Advanced ${category.name} skills` },
          specialist: { name: 'Specialist Level', description: `Expert-level ${category.name}` }
        }
      };
      return acc;
    }, {}),
    
    // Fallback hardcoded categories (if no dynamic categories available)
    redhat: {
      name: 'Red Hat Technologies',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg',
      color: 'red',
      description: 'Industry-leading Linux and OpenShift certifications',
      keywords: ['red hat', 'rhcsa', 'rhce', 'do188', 'openshift', 'linux', 'ansible', 'redhat'],
      levels: {
        foundation: { name: 'Foundation Level', description: 'Start your Red Hat journey' },
        professional: { name: 'Professional Level', description: 'Advanced system administration' },
        specialist: { name: 'Specialist Level', description: 'Expert-level specializations' }
      }
    },
    aws: {
      name: 'AWS Cloud Platform',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      color: 'orange',
      description: 'Amazon Web Services cloud computing certifications',
      keywords: ['aws', 'cloud', 'amazon', 'practitioner', 'solutions architect', 'developer'],
      levels: {
        foundation: { name: 'Foundation Level', description: 'Cloud computing basics' },
        associate: { name: 'Associate Level', description: 'Professional cloud skills' },
        professional: { name: 'Professional Level', description: 'Expert cloud architecture' }
      }
    },
    kubernetes: {
      name: 'Kubernetes Ecosystem',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg',
      color: 'blue',
      description: 'Container orchestration and cloud-native technologies',
      keywords: ['kubernetes', 'cka', 'cks', 'ckad', 'container', 'docker', 'cloud native'],
      levels: {
        administrator: { name: 'Administrator Level', description: 'Cluster administration' },
        security: { name: 'Security Level', description: 'Security specialization' },
        developer: { name: 'Developer Level', description: 'Application development' }
      }
    },
    devops: {
      name: 'DevOps Engineering',
      icon: '🔧',
      color: 'green',
      description: 'DevOps, MLOps, SecOps and automation technologies',
      keywords: ['devops', 'mlops', 'secops', 'automation', 'ci/cd', 'jenkins', 'docker', 'terraform', 'ansible'],
      levels: {
        foundation: { name: 'Foundation Level', description: 'DevOps fundamentals' },
        professional: { name: 'Professional Level', description: 'Advanced DevOps practices' },
        expert: { name: 'Expert Level', description: 'Enterprise DevOps leadership' }
      }
    },
    cybersecurity: {
      name: 'Cybersecurity & Ethical Hacking',
      icon: '🛡️',
      color: 'slate',
      description: 'Cybersecurity, ethical hacking, penetration testing and security analysis',
      keywords: ['cybersecurity', 'cyber security', 'ethical hacking', 'penetration testing', 'security', 'kali linux', 'wireshark', 'metasploit', 'vulnerability', 'incident response'],
      levels: {
        foundation: { name: 'Foundation Level', description: 'Security fundamentals' },
        professional: { name: 'Professional Level', description: 'Advanced security practices' },
        expert: { name: 'Expert Level', description: 'Security leadership & consulting' }
      }
    },
    programming: {
      name: 'Programming & Development',
      icon: '💻',
      color: 'purple',
      description: 'Programming languages and software development skills',
      keywords: ['java', 'salesforce', 'c++', 'dsa', 'data structures', 'programming', 'development', 'coding'],
      levels: {
        beginner: { name: 'Beginner Level', description: 'Programming fundamentals' },
        intermediate: { name: 'Intermediate Level', description: 'Advanced programming concepts' },
        professional: { name: 'Professional Level', description: 'Industry-ready development' }
      }
    },
    degree: {
      name: 'Degree Programs',
      icon: '🎓',
      color: 'indigo',
      description: 'Comprehensive degree and diploma programs',
      keywords: ['bca', 'degree', 'bachelor', 'diploma', 'graduation', 'computer applications'],
      levels: {
        undergraduate: { name: 'Undergraduate', description: 'Bachelor degree programs' },
        diploma: { name: 'Diploma', description: 'Professional diploma courses' },
        certification: { name: 'Certification', description: 'Professional certifications' }
      }
    },
    general: {
      name: 'All Courses',
      icon: '📚',
      color: 'gray',
      description: 'Complete course catalog including all specializations',
      keywords: [],
      levels: {
        all: { name: 'All Levels', description: 'Browse all available courses' }
      }
    }
  };

  // Sort courseVendors by order for display
  const sortedCourseVendorEntries = Object.entries(courseVendors).sort(([keyA, vendorA], [keyB, vendorB]) => {
    const orderA = vendorA.order || courseCategories[keyA]?.order || 999;
    const orderB = vendorB.order || courseCategories[keyB]?.order || 999;
    return orderA - orderB;
  });

  // Categorize courses by vendor
  const categorizedCourses = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        redhat: [],
        aws: [],
        kubernetes: [],
        programming: [],
        degree: [],
        general: []
      };
    }

    const result = {
      redhat: [],
      aws: [],
      kubernetes: [],
      devops: [],
      cybersecurity: [],
      programming: [],
      degree: [],
      general: []
    };

    // First, filter out duplicates based on slug
    const uniqueCourses = courses.filter((course, index, arr) => 
      arr.findIndex(c => c.slug === course.slug) === index
    );

    uniqueCourses.forEach(course => {
      const title = course.title?.toLowerCase() || '';
      const category = course.category?.toLowerCase() || '';
      const tools = course.tools?.join(' ').toLowerCase() || '';
      const oneLiner = course.oneLiner?.toLowerCase() || '';
      const searchText = `${title} ${category} ${tools} ${oneLiner}`;

      let categorizedFlag = false;

      // PRIORITY 1: Direct category field matching (ABSOLUTE PRIORITY)
      if (category === 'devops') {
        result.devops.push({
          ...course,
          vendor: 'devops',
          level: determineLevel(course, 'devops')
        });
        categorizedFlag = true;
      }
      else if (category === 'security' || category === 'cybersecurity') {
        result.cybersecurity.push({
          ...course,
          vendor: 'cybersecurity',
          level: determineLevel(course, 'cybersecurity')
        });
        categorizedFlag = true;
      }
      else if (category === 'degree' || title.includes('bca') || title.includes('degree')) {
        result.degree.push({
          ...course,
          vendor: 'degree',
          level: determineLevel(course, 'degree')
        });
        categorizedFlag = true;
      }
      else if (category === 'certification') {
        result.redhat.push({
          ...course,
          vendor: 'redhat',
          level: determineLevel(course, 'redhat')
        });
        categorizedFlag = true;
      }
      else if (category === 'cloud') {
        result.aws.push({
          ...course,
          vendor: 'aws',
          level: determineLevel(course, 'aws')
        });
        categorizedFlag = true;
      }
      else if (category === 'container') {
        result.kubernetes.push({
          ...course,
          vendor: 'kubernetes',
          level: determineLevel(course, 'kubernetes')
        });
        categorizedFlag = true;
      }
      else if (category === 'programming' && !title.includes('bca') && !title.includes('degree')) {
        result.programming.push({
          ...course,
          vendor: 'programming',
          level: determineLevel(course, 'programming')
        });
        categorizedFlag = true;
      }
      
      // PRIORITY 2: Keyword-based fallback matching (only if no direct category match)
      if (!categorizedFlag) {
        if (courseVendors.redhat.keywords.some(keyword => searchText.includes(keyword))) {
          result.redhat.push({
            ...course,
            vendor: 'redhat',
            level: determineLevel(course, 'redhat')
          });
          categorizedFlag = true;
        }
        else if (courseVendors.aws.keywords.some(keyword => searchText.includes(keyword))) {
          result.aws.push({
            ...course,
            vendor: 'aws',
            level: determineLevel(course, 'aws')
          });
          categorizedFlag = true;
        }
        else if (courseVendors.kubernetes.keywords.some(keyword => searchText.includes(keyword))) {
          result.kubernetes.push({
            ...course,
            vendor: 'kubernetes',
            level: determineLevel(course, 'kubernetes')
          });
          categorizedFlag = true;
        }
        else if (courseVendors.devops.keywords.some(keyword => searchText.includes(keyword))) {
          result.devops.push({
            ...course,
            vendor: 'devops',
            level: determineLevel(course, 'devops')
          });
          categorizedFlag = true;
        }
        else if (courseVendors.cybersecurity.keywords.some(keyword => searchText.includes(keyword))) {
          result.cybersecurity.push({
            ...course,
            vendor: 'cybersecurity',
            level: determineLevel(course, 'cybersecurity')
          });
          categorizedFlag = true;
        }
        else if (courseVendors.programming.keywords.some(keyword => searchText.includes(keyword))) {
          result.programming.push({
            ...course,
            vendor: 'programming',
            level: determineLevel(course, 'programming')
          });
          categorizedFlag = true;
        }
      }

      // Always add to general category (unique courses only)
      result.general.push({
        ...course,
        vendor: 'general',
        level: 'all'
      });

      // Fallback categorization for uncategorized courses
      if (!categorizedFlag && !title.includes('test')) {
        // Programming fallback
        if (title.includes('java') || title.includes('c++') || title.includes('data structures') || 
            title.includes('machine learning') || title.includes('data science') ||
            category.includes('programming') || category.includes('technology')) {
          if (!result.programming.find(c => c.slug === course.slug)) {
            result.programming.push({
              ...course,
              vendor: 'programming',
              level: determineLevel(course, 'programming')
            });
          }
        }
        // Security/Cyber fallback
        else if (title.includes('cyber') || title.includes('security') || 
                 category.includes('security')) {
          // Add to general as security specialty
          // Can be viewed under "All Courses" tab
        }
        // DevOps/Cloud fallback
        else if (title.includes('devops') || title.includes('cloud') || 
                 category.includes('cloud')) {
          // Add to general as DevOps specialty
          // Can be viewed under "All Courses" tab
        }
        // Degree fallback
        else if (title.includes('bca') || title.includes('degree') || 
                 category.includes('degree')) {
          if (!result.degree.find(c => c.slug === course.slug)) {
            result.degree.push({
              ...course,
              vendor: 'degree',
              level: determineLevel(course, 'degree')
            });
          }
        }
      }
    });

    return result;
  }, [courses]);

  // Filter courses based on search and level
  const filteredCourses = useMemo(() => {
    const vendorCourses = categorizedCourses[activeTab] || [];
    
    return vendorCourses.filter(course => {
      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          course.title?.toLowerCase().includes(searchLower) ||
          course.oneLiner?.toLowerCase().includes(searchLower) ||
          course.tools?.some(tool => tool.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Level filter
      if (selectedLevel !== 'all' && course.level !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [categorizedCourses, activeTab, searchTerm, selectedLevel]);

  // Group courses by level for display
  const coursesByLevel = useMemo(() => {
    const grouped = {};
    const vendor = courseVendors[activeTab];
    
    filteredCourses.forEach(course => {
      const level = course.level || 'all';
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(course);
    });

    return grouped;
  }, [filteredCourses, activeTab]);

  const currentVendor = courseVendors[activeTab];

  // Get color classes based on vendor
  const getVendorColors = (vendorColor) => {
    const colorMap = {
      red: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-500 to-red-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', gradient: 'from-slate-500 to-slate-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' }
    };
    return colorMap[vendorColor] || colorMap.gray;
  };

  return (
    <>
      <SEO
        title={`${currentVendor.name} Certifications - GRRAS Solutions`}
        description={`Professional ${currentVendor.name} certification training with hands-on experience and industry recognition.`}
        keywords={`${currentVendor.keywords.join(', ')}, certification training, IT courses`}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                Professional IT Certifications
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                GRRAS Certification Academy
              </h1>
              
              <p className="text-xl text-gray-100 mb-8 max-w-4xl mx-auto">
                Industry-Leading IT Certifications & Professional Training Programs
                <br />
                Build expertise with hands-on experience and recognized credentials
              </p>

              {/* Dynamic Stats from categories */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12 max-w-4xl mx-auto">
                {sortedCourseVendorEntries.slice(0, 5).map(([key, vendor], index) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold mb-2">{categorizedCourses[key]?.length || 0}</div>
                    <div className="text-sm text-gray-200">{vendor.name}</div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">95%</div>
                  <div className="text-sm text-gray-200">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Classic Tabs Navigation */}  
        <section className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto py-4">
              {sortedCourseVendorEntries.map(([key, vendor]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === key
                      ? `bg-${vendor.color}-100 text-${vendor.color}-700 border-2 border-${vendor.color}-200`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {vendor.icon && vendor.icon.startsWith('http') ? (
                    <img 
                      src={vendor.icon} 
                      alt={`${vendor.name} Logo`}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                  ) : (
                    <span className="text-lg">{vendor.icon}</span>
                  )}
                  <span className="text-lg" style={{ display: vendor.icon && vendor.icon.startsWith('http') ? 'none' : 'inline' }}>
                    {vendor.icon && !vendor.icon.startsWith('http') ? vendor.icon : ''}
                  </span>
                  <div className="text-left">
                    <div className="font-semibold">{vendor.name}</div>
                    <div className="text-xs opacity-75">{categorizedCourses[key]?.length || 0} courses</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-6 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${currentVendor.name.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              {/* Level Filter */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Levels</option>
                  {Object.entries(currentVendor.levels).map(([key, level]) => (
                    <option key={key} value={key}>{level.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Display */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Vendor Description */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                {currentVendor.icon && currentVendor.icon.startsWith('http') ? (
                  <img 
                    src={currentVendor.icon} 
                    alt={`${currentVendor.name} Logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                    }}
                  />
                ) : (
                  <span className="text-4xl">{currentVendor.icon}</span>
                )}
                <span className="text-4xl" style={{ display: currentVendor.icon && currentVendor.icon.startsWith('http') ? 'none' : 'inline' }}>
                  {currentVendor.icon && !currentVendor.icon.startsWith('http') ? currentVendor.icon : ''}
                </span>
                {currentVendor.name}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {currentVendor.description}
              </p>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or level filter.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLevel('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(coursesByLevel).map(([level, levelCourses]) => {
                  const levelInfo = currentVendor.levels[level] || { name: 'General', description: '' };
                  
                  return (
                    <div key={level} className="space-y-6">
                      {/* Level Header */}
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`w-12 h-12 ${getVendorColors(currentVendor.color).bg} rounded-xl flex items-center justify-center`}>
                          <Target className={`h-6 w-6 ${getVendorColors(currentVendor.color).text}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{levelInfo.name}</h3>
                          <p className="text-gray-600">{levelInfo.description}</p>
                        </div>
                        <div className="ml-auto bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                          {levelCourses.length} course{levelCourses.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Course Cards Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {levelCourses.map((course) => (
                          <CertificationCourseCard 
                            key={course.slug} 
                            course={course} 
                            vendor={currentVendor}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

// Professional Certification Course Card Component
const CertificationCourseCard = ({ course, vendor }) => {
  // Get color classes based on vendor
  const getVendorColors = (vendorColor) => {
    const colorMap = {
      red: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-500 to-red-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', gradient: 'from-slate-500 to-slate-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' }
    };
    return colorMap[vendorColor] || colorMap.gray;
  };

  const colors = getVendorColors(vendor.color);

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className={`h-2 bg-gradient-to-r ${colors.gradient}`}></div>
      
      <div className="p-8">
        {/* Certification Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center text-2xl font-bold ${colors.text}`}>
            {vendor.icon && vendor.icon.startsWith('http') ? (
              <img 
                src={vendor.icon} 
                alt={`${vendor.name} Logo`}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
            ) : (
              <span>{vendor.icon}</span>
            )}
            <span style={{ display: vendor.icon && vendor.icon.startsWith('http') ? 'none' : 'inline' }}>
              {vendor.icon && !vendor.icon.startsWith('http') ? vendor.icon : ''}
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-1">{course.fees}</div>
            {course.featured && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-current" />
                Popular
              </span>
            )}
          </div>
        </div>

        {/* Course Info */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
          {course.oneLiner}
        </p>

        {/* Course Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600 mb-1">Duration</div>
            <div className="font-semibold text-sm">{course.duration}</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600 mb-1">Level</div>
            <div className="font-semibold text-sm">{course.level}</div>
          </div>
        </div>

        {/* Key Highlights */}
        {course.highlights && course.highlights.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">What You'll Learn:</h4>
            <div className="space-y-2">
              {course.highlights.slice(0, 3).map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="line-clamp-1">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to={`/courses/${course.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors group/btn"
          >
            View Details
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/admissions"
            className="inline-flex items-center justify-center px-4 py-3 border-2 border-red-600 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
          >
            Enroll
          </Link>
        </div>

        {/* Certification Badge */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Award className="h-3 w-3" />
            <span>Industry-Recognized Certification</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationCoursesPage;