import React, { useState, useEffect } from 'react';
import { 
  Users, RefreshCw, Mail, Phone, Calendar, LogOut, 
  Filter, Download, Trash2, Search, CheckSquare, 
  Square, MoreHorizontal, Eye, Edit, AlertTriangle,
  FileText, Star, MapPin, MessageSquare, X
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SimpleLeadsManager = ({ token, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/simple-leads?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      
      if (data.success) {
        const leadsData = data.leads || [];
        setLeads(leadsData);
        setFilteredLeads(leadsData);
      } else {
        setError(data.message || 'Failed to load leads');
      }
    } catch (err) {
      setError('Connection error. Check backend.');
    }
    
    setLoading(false);
  };

  // Filter and Search Logic
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.course?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at || lead.timestamp);
        switch (dateFilter) {
          case 'today':
            return leadDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return leadDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return leadDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(lead => 
        lead.course?.toLowerCase().includes(courseFilter.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'email':
          aVal = a.email || '';
          bVal = b.email || '';
          break;
        case 'course':
          aVal = a.course || '';
          bVal = b.course || '';
          break;
        default: // date
          aVal = new Date(a.created_at || a.timestamp);
          bVal = new Date(b.created_at || b.timestamp);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, dateFilter, courseFilter, sortBy, sortOrder]);

  // Export functionality
  const exportLeads = (format = 'csv') => {
    const dataToExport = selectedLeads.length > 0 
      ? leads.filter(lead => selectedLeads.includes(lead.email || lead.id))
      : filteredLeads;

    if (format === 'csv') {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Course', 'Message', 'Date'],
        ...dataToExport.map(lead => [
          lead.name || '',
          lead.email || '',
          lead.phone || '',
          lead.course || '',
          (lead.message || '').replace(/,/g, ';'),
          formatDate(lead.created_at || lead.timestamp)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grras-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.email || lead.id));
    }
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Delete functionality  
  const handleDelete = (leadIds) => {
    setDeleteTarget(leadIds);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // In a real app, this would call a delete API
    const idsToDelete = Array.isArray(deleteTarget) ? deleteTarget : [deleteTarget];
    const updatedLeads = leads.filter(lead => 
      !idsToDelete.includes(lead.email || lead.id)
    );
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('simple_admin_token');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Leads Dashboard</h1>
                <p className="text-gray-600">Manage and track your business inquiries</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{filteredLeads.length}</span> of <span className="font-semibold">{leads.length}</span> leads
              </div>
              <button
                onClick={fetchLeads}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Courses</option>
                <option value="devops">DevOps</option>
                <option value="cloud">Cloud Computing</option>
                <option value="data">Data Science</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {selectedLeads.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedLeads.length} selected</span>
                  <button
                    onClick={() => handleDelete(selectedLeads)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center gap-2 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </button>
                </div>
              )}
              
              <button
                onClick={() => exportLeads('csv')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Sort & View Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="course">Course</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedLeads.length === filteredLeads.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button 
              onClick={fetchLeads}
              className="ml-3 text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {leads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500">Leads will appear here when users submit the contact form.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  {leads.map((lead, index) => (
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.course}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {lead.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lead.timestamp)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLeadsManager;