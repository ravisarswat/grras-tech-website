import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, selectedCourse, dateRange]);

  const checkAuthentication = async () => {
    try {
      // Try to access the leads endpoint to check if we're already authenticated
      const response = await axios.get(`${API}/leads`, {
        auth: {
          username: 'admin',
          password: localStorage.getItem('adminPassword') || ''
        }
      });
      
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Not authenticated, show login form
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await axios.get(`${API}/leads`, {
        auth: {
          username: 'admin',
          password: credentials.password
        }
      });
      
      if (response.status === 200) {
        localStorage.setItem('adminPassword', credentials.password);
        setIsAuthenticated(true);
        toast.success('Login successful');
      }
    } catch (error) {
      setAuthError('Invalid password. Please try again.');
      toast.error('Login failed');
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`, {
        auth: {
          username: 'admin',
          password: localStorage.getItem('adminPassword')
        }
      });
      
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
      
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('adminPassword');
      }
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(lead => lead.course_slug === selectedCourse);
    }

    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(lead => new Date(lead.timestamp) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(lead => new Date(lead.timestamp) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(lead => new Date(lead.timestamp) >= filterDate);
          break;
      }
    }

    setFilteredLeads(filtered);
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Course', 'Message', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${getCourseNameFromSlug(lead.course_slug || '')}"`,
        `"${(lead.message || '').replace(/"/g, '""')}"`,
        `"${formatDate(lead.timestamp)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grras_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Data exported successfully');
  };

  const getCourseNameFromSlug = (slug) => {
    const courseNames = {
      'bca-degree': 'BCA Degree Program',
      'devops-training': 'DevOps Training',
      'redhat-certifications': 'Red Hat Certifications',
      'data-science-machine-learning': 'Data Science & ML',
      'java-salesforce': 'Java & Salesforce',
      'python': 'Python',
      'c-cpp-dsa': 'C/C++ & DSA'
    };
    return courseNames[slug] || slug;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueCourseSlugs = () => {
    const slugs = [...new Set(leads.map(lead => lead.course_slug).filter(Boolean))];
    return slugs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="Admin Login - GRRAS Solutions"
          description="Admin panel for GRRAS Solutions Training Institute"
        />
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Admin Login
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Access the leads management panel
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value="admin"
                    readOnly
                    className="form-input bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="form-input"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="text-red-600 text-sm text-center">
                  {authError}
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Admin Panel - Leads Management | GRRAS Solutions"
        description="Manage leads and inquiries for GRRAS Solutions Training Institute"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                <p className="text-gray-600">Manage student inquiries and course downloads</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={fetchLeads}
                  className="btn-outline flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => {
                      const leadDate = new Date(lead.timestamp);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return leadDate >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Syllabus Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.course_slug).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">General Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => !lead.course_slug).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Courses</option>
                  {getUniqueCourseSlugs().map(slug => (
                    <option key={slug} value={slug}>
                      {getCourseNameFromSlug(slug)}
                    </option>
                  ))}
                  <option value="">General Inquiry</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <p className="text-sm text-gray-600">
                  Showing {filteredLeads.length} of {leads.length} leads
                </p>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead, index) => (
                      <tr key={lead.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.course_slug ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getCourseNameFromSlug(lead.course_slug)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                General Inquiry
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {lead.message || 'Syllabus download request'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(lead.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLeads;