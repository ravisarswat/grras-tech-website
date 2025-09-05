import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  Calendar,
  Mail,
  Phone,
  BookOpen,
  RefreshCw,
  AlertCircle,
  LogIn,
  Trash2,
  CheckSquare,
  Square
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
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [authError, setAuthError] = useState('');
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState([]);

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
      // Check if we have admin token from AdminContent login
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Try to access the leads endpoint with the token
      const response = await axios.get(`${API}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        setIsAuthenticated(true);
        setLeads(response.data.leads || []);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('admin_token');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!password.trim()) {
      setAuthError('Please enter the admin password');
      return;
    }
    
    try {
      console.log('🔐 Attempting admin login...');
      // Use the same login endpoint as AdminContent
      const response = await axios.post(`${API}/admin/login`, {
        password: password.trim()
      });

      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        setIsAuthenticated(true);
        toast.success('Login successful!');
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your password.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.get(`${API}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to fetch leads');
      }
    }
  };

  // Delete Functions
  const handleDeleteSingle = (lead) => {
    setLeadsToDelete([lead]);
    setShowDeleteConfirm(true);
  };

  const handleDeleteSelected = () => {
    const leadsToDeleteArray = filteredLeads.filter(lead => selectedLeads.has(lead._id));
    setLeadsToDelete(leadsToDeleteArray);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (leadsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      if (leadsToDelete.length === 1) {
        // Delete single lead
        await axios.delete(`${API}/leads/${leadsToDelete[0]._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Lead deleted successfully!');
      } else {
        // Delete multiple leads
        const leadIds = leadsToDelete.map(lead => lead._id);
        await axios.delete(`${API}/leads/bulk`, {
          data: { lead_ids: leadIds },
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success(`${leadsToDelete.length} leads deleted successfully!`);
      }
      
      // Refresh leads and clear selections
      await fetchLeads();
      setSelectedLeads(new Set());
      setShowDeleteConfirm(false);
      setLeadsToDelete([]);
      
    } catch (error) {
      console.error('Error deleting leads:', error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to delete leads. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection Functions
  const toggleLeadSelection = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead._id)));
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.course?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(lead => 
        lead.course?.toLowerCase().includes(selectedCourse.toLowerCase())
      );
    }
    
    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(lead => 
          new Date(lead.timestamp) >= filterDate
        );
      }
    }
    
    setFilteredLeads(filtered);
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads to export');
      return;
    }
    
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Message', 'Type', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.course || '',
        lead.message || '',
        lead.type || '',
        new Date(lead.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grras_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Leads exported successfully!');
  };

  const getUniqueValues = (field) => {
    return [...new Set(leads.map(lead => lead[field]).filter(Boolean))];
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

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <SEO 
          title="Admin Leads - GRRAS Solutions"
          description="Admin leads management"
        />
        
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Leads</h1>
            <p className="text-gray-600">Sign in to manage leads</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(''); // Clear error when typing
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
            </div>
            
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{authError}</span>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              {password.trim() ? 'Sign In' : 'Enter Password'}
            </button>
            

          </form>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Admin Leads - GRRAS Solutions"
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
                
                {selectedLeads.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedLeads.size})
                  </button>
                )}
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
                    {leads.filter(lead => lead.type === 'syllabus_download').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contact Forms</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.type === 'contact_form').length}
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
                  {getUniqueValues('course').map(course => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
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
                      <th className="px-3 py-3 text-left">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700"
                        >
                          {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
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
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead, index) => (
                      <tr key={lead._id || index} className={`hover:bg-gray-50 ${selectedLeads.has(lead._id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 py-4">
                          <button
                            onClick={() => toggleLeadSelection(lead._id)}
                            className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700"
                          >
                            {selectedLeads.has(lead._id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
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
                            {lead.course ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {lead.course}
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
                            {lead.message || 'No message'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.type === 'syllabus_download' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {lead.type === 'syllabus_download' ? 'Syllabus Download' : 'Contact Form'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(lead.timestamp)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteSingle(lead)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded-md transition-colors"
                            title="Delete this lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete {leadsToDelete.length === 1 ? 'this lead' : `${leadsToDelete.length} leads`}?
              </p>
              
              {leadsToDelete.length <= 3 && (
                <div className="mt-3 space-y-1">
                  {leadsToDelete.map((lead, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">{lead.name}</span> - {lead.email}
                    </div>
                  ))}
                </div>
              )}
              
              {leadsToDelete.length > 3 && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">{leadsToDelete[0].name}</span> - {leadsToDelete[0].email}
                  <div className="text-gray-500">...and {leadsToDelete.length - 1} more</div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setLeadsToDelete([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete {leadsToDelete.length === 1 ? 'Lead' : 'Leads'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLeads;